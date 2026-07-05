#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod spice_ffi;
mod db;

use base64::Engine;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::Manager;
use tauri::api::path::app_data_dir;

struct SpiceState {
    session: Option<spice_ffi::SpiceSessionHandle>,
}

#[tauri::command]
fn connect_spice(host: String, port: u16, password: Option<String>, app_handle: tauri::AppHandle) -> Result<(), String> {
    // 如果已有活跃连接则跳过
    {
        let state = app_handle.state::<Arc<Mutex<SpiceState>>>();
        let s = state.lock().unwrap();
        if s.session.is_some() {
            return Ok(());  // 已有连接，无需重复创建
        }
    }

    let mut session = spice_ffi::SpiceSessionHandle::connect(&host, port, password.as_deref())
        .map_err(|e| format!("连接失败: {}", e))?;

    let frame_rx = session.frame_receiver().ok_or("无帧通道")?;
    let status_rx = session.status_receiver().ok_or("无状态通道")?;

    let state = app_handle.state::<Arc<Mutex<SpiceState>>>();
    { let mut s = state.lock().unwrap(); s.session = Some(session); }

    // 帧转发
    let app = app_handle.clone();
    thread::spawn(move || {
        let b64 = base64::engine::general_purpose::STANDARD;
        loop {
            match frame_rx.recv() {
                Ok(f) => {
                    let rgba_b64 = b64.encode(&f.rgba);
                    let json = serde_json::json!({
                        "type": "frame",
                        "data": { "w": f.width, "h": f.height, "rgba": rgba_b64 }
                    });
                    let _ = app.emit_all("spice-bridge", json.to_string());
                }
                Err(_) => break,
            }
        }
    });

    // 状态转发
    thread::spawn(move || {
        loop {
            match status_rx.recv() {
                Ok(s) => {
                    let json = serde_json::json!({
                        "type": "status",
                        "data": { "message": s.message }
                    });
                    let _ = app_handle.emit_all("spice-bridge", json.to_string());
                }
                Err(_) => break,
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn disconnect_spice(app_handle: tauri::AppHandle) -> Result<(), String> {
    let state = app_handle.state::<Arc<Mutex<SpiceState>>>();
    if let Some(mut s) = state.lock().unwrap().session.take() {
        s.disconnect();
        let _ = app_handle.emit_all("spice-bridge",
            r#"{"type":"status","data":{"message":"已断开"}}"#);
    }
    Ok(())
}

#[tauri::command]
fn get_usb_devices() -> Result<String, String> {
    use libloading::Library;
    unsafe {
        let lib = Library::new("spice-bridge.dll").or(Err("DLL not found"))?;
        let func: libloading::Symbol<unsafe extern "C" fn(*mut i8, i32) -> i32> =
            lib.get(b"spice_get_usb_list").map_err(|e| e.to_string())?;
        let mut buf = vec![0u8; 4096];
        let _count = func(buf.as_mut_ptr() as *mut i8, 4096);
        let s = std::ffi::CStr::from_ptr(buf.as_ptr() as *const i8)
            .to_string_lossy().into_owned();
        Ok(s)
    }
}

#[tauri::command]
fn send_spice_input(event_type: String, data: String) -> Result<(), String> {
    // 使用 spice_ffi 模块中的输入函数
    spice_ffi::send_input(&event_type, &data)
}

#[tauri::command]
fn check_port(host: String, port: u16, timeout_ms: u64) -> bool {
    use std::net::{TcpStream, ToSocketAddrs};
    use std::time::Duration;
    let addr = format!("{}:{}", host, port);
    if let Ok(mut addrs) = addr.to_socket_addrs() {
        if let Some(addr) = addrs.next() {
            return TcpStream::connect_timeout(&addr, Duration::from_millis(timeout_ms)).is_ok();
        }
    }
    false
}

// ── Database Tauri Commands ──

#[tauri::command]
fn db_get_setting(state: tauri::State<'_, db::Database>, key: String) -> Result<Option<String>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_setting(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_set_setting(state: tauri::State<'_, db::Database>, key: String, value: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::set_setting(&conn, &key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_get_all_settings(state: tauri::State<'_, db::Database>) -> Result<Vec<(String, String)>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_all_settings(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_delete_setting(state: tauri::State<'_, db::Database>, key: String) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::delete_setting(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_get_connections(state: tauri::State<'_, db::Database>) -> Result<Vec<serde_json::Value>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_connections(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_save_connection(state: tauri::State<'_, db::Database>, connection: serde_json::Value) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::save_connection(&conn, &connection).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_delete_connection(state: tauri::State<'_, db::Database>, id: i64) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::delete_connection(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_get_login_history(state: tauri::State<'_, db::Database>, limit: Option<i64>) -> Result<Vec<serde_json::Value>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_login_history(&conn, limit.unwrap_or(20)).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_get_usb_policies(state: tauri::State<'_, db::Database>) -> Result<Vec<serde_json::Value>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::get_usb_policies(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn db_set_usb_policy(state: tauri::State<'_, db::Database>, policy: serde_json::Value) -> Result<(), String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    db::set_usb_policy(&conn, &policy).map_err(|e| e.to_string())
}

fn main() {
    std::env::set_var("PATH",
        format!("C:\\msys64\\mingw64\\bin;{}",
            std::env::var("PATH").unwrap_or_default()));

    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app_data_dir(&app.config()).ok_or("获取数据目录失败")?;
            let database = db::Database::new(data_dir).map_err(|e| e.to_string())?;
            app.manage(database);
            Ok(())
        })
        .manage(Arc::new(Mutex::new(SpiceState { session: None })))
        .invoke_handler(tauri::generate_handler![
            connect_spice, disconnect_spice, send_spice_input, get_usb_devices, check_port,
            db_get_setting, db_set_setting, db_get_all_settings, db_delete_setting,
            db_get_connections, db_save_connection, db_delete_connection,
            db_get_login_history,
            db_get_usb_policies, db_set_usb_policy,
        ])
        .run(tauri::generate_context!())
        .expect("error");
}
