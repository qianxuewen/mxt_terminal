use std::sync::mpsc;

// ======== C API 函数签名 ========

type SpiceStartFn = unsafe extern "C" fn(
    host: *const i8, port: i32, password: *const i8,
    on_frame: Option<unsafe extern "C" fn(i32, i32, *const u8, i32, *mut std::ffi::c_void)>,
    on_status: Option<unsafe extern "C" fn(*const i8, *mut std::ffi::c_void)>,
    userdata: *mut std::ffi::c_void,
) -> i32;

type SpiceStopFn = unsafe extern "C" fn();
type SpiceSendKeyFn = unsafe extern "C" fn(*const i8, i32);
type SpiceSendMouseMoveFn = unsafe extern "C" fn(i32, i32);
type SpiceSendMouseBtnFn = unsafe extern "C" fn(i32, i32);

// ======== 回调 ========

struct CallbackUserData {
    frame_tx: mpsc::Sender<SpiceFrame>,
    status_tx: mpsc::Sender<SpiceStatus>,
}

unsafe extern "C" fn on_frame_c(w: i32, h: i32, rgba: *const u8, size: i32, userdata: *mut std::ffi::c_void) {
    let ud = &*(userdata as *const CallbackUserData);
    if rgba.is_null() || size <= 0 { return; }
    let data = std::slice::from_raw_parts(rgba, size as usize);
    let _ = ud.frame_tx.send(SpiceFrame { width: w as u32, height: h as u32, rgba: data.to_vec() });
}

unsafe extern "C" fn on_status_c(msg: *const i8, userdata: *mut std::ffi::c_void) {
    let ud = &*(userdata as *const CallbackUserData);
    let message = if msg.is_null() { String::new() } else { std::ffi::CStr::from_ptr(msg).to_string_lossy().into_owned() };
    let _ = ud.status_tx.send(SpiceStatus { connected: message != "disconnected", message });
}

// ======== Rust 类型 ========

#[derive(Debug, Clone)]
pub struct SpiceFrame { pub width: u32, pub height: u32, pub rgba: Vec<u8> }
#[derive(Debug, Clone)]
pub struct SpiceStatus { pub message: String, pub connected: bool }

pub struct SpiceSessionHandle {
    lib: libloading::Library,
    frame_rx: Option<mpsc::Receiver<SpiceFrame>>,
    status_rx: Option<mpsc::Receiver<SpiceStatus>>,
}

unsafe impl Send for SpiceSessionHandle {}
unsafe impl Sync for SpiceSessionHandle {}

impl SpiceSessionHandle {
    pub fn connect(host: &str, port: u16, password: Option<&str>) -> Result<Self, String> {
        let dll_path = std::env::current_dir()
            .unwrap_or_default()
            .join("spice-bridge.dll");
        let lib = unsafe { libloading::Library::new(&dll_path) }
            .or_else(|_| unsafe { libloading::Library::new("spice-bridge.dll") })
            .or_else(|_| unsafe { libloading::Library::new("target/debug/spice-bridge.dll") })
            .or_else(|_| unsafe { libloading::Library::new("E:/mxt/terminal/spice-bridge.dll") })
            .map_err(|e| format!("加载 spice-bridge.dll 失败: {}", e))?;

        let spice_start: libloading::Symbol<SpiceStartFn> =
            unsafe { lib.get(b"spice_start") }.map_err(|e| format!("找不到 spice_start: {}", e))?;

        let (frame_tx, frame_rx) = mpsc::channel();
        let (status_tx, status_rx) = mpsc::channel();
        let userdata = Box::into_raw(Box::new(CallbackUserData { frame_tx, status_tx })) as *mut std::ffi::c_void;

        let host_c = std::ffi::CString::new(host).map_err(|e| format!("host: {}", e))?;
        let pwd_c = password.map(|p| std::ffi::CString::new(p)).transpose().map_err(|e| format!("password: {}", e))?;

        let result = unsafe {
            spice_start(
                host_c.as_ptr(), port as i32,
                pwd_c.as_ref().map_or(std::ptr::null(), |c| c.as_ptr()),
                Some(on_frame_c), Some(on_status_c), userdata,
            )
        };

        if result != 0 { return Err(format!("spice_start 失败 (code: {})", result)); }

        Ok(SpiceSessionHandle { lib, frame_rx: Some(frame_rx), status_rx: Some(status_rx) })
    }

    pub fn frame_receiver(&mut self) -> Option<mpsc::Receiver<SpiceFrame>> { self.frame_rx.take() }
    pub fn status_receiver(&mut self) -> Option<mpsc::Receiver<SpiceStatus>> { self.status_rx.take() }
    pub fn disconnect(&mut self) {
        if let Ok(stop) = unsafe { self.lib.get::<SpiceStopFn>(b"spice_stop") } { unsafe { stop(); } }
    }
}

// ======== 输入事件转发 (独立函数, 不依赖 SessionHandle) ========

/// 发送输入事件到 spice-bridge.dll
pub fn send_input(event_type: &str, data: &str) -> Result<(), String> {
    // 每次调用时临时加载 DLL (性能影响可忽略)
    let lib = unsafe {
        libloading::Library::new("spice-bridge.dll")
            .or_else(|_| libloading::Library::new("target/debug/spice-bridge.dll"))
            .or_else(|_| libloading::Library::new("E:/mxt/terminal/spice-bridge.dll"))
    }.map_err(|e| format!("加载 DLL 失败: {}", e))?;

    let parsed: serde_json::Value = serde_json::from_str(data).map_err(|e| e.to_string())?;

    match event_type {
        "keydown" | "keyup" => {
            let down = event_type == "keydown";
            let key = parsed["key"].as_str().unwrap_or("");
            let c_key = std::ffi::CString::new(key).unwrap();
            unsafe {
                let func: libloading::Symbol<SpiceSendKeyFn> = lib.get(b"spice_send_key").map_err(|e| e.to_string())?;
                func(c_key.as_ptr(), down as i32);
            }
        }
        "mousemove" => {
            let x = parsed["x"].as_f64().unwrap_or(0.0) as i32;
            let y = parsed["y"].as_f64().unwrap_or(0.0) as i32;
            unsafe {
                let func: libloading::Symbol<SpiceSendMouseMoveFn> = lib.get(b"spice_send_mouse_move").map_err(|e| e.to_string())?;
                func(x, y);
            }
        }
        "mousedown" | "mouseup" => {
            let down = event_type == "mousedown";
            let button = parsed["button"].as_u64().unwrap_or(0) as i32;
            unsafe {
                let func: libloading::Symbol<SpiceSendMouseBtnFn> = lib.get(b"spice_send_mouse_button").map_err(|e| e.to_string())?;
                func(button, down as i32);
            }
        }
        _ => {}
    }
    Ok(())
}
