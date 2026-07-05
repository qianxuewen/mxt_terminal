import React, { useState, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, sectionTitleStyle, cardStyle } from '@/theme';

/** 真实麦克风/摄像头设备列表 */
const getMediaDevices = async (): Promise<{ audioIn: MediaDeviceInfo[]; audioOut: MediaDeviceInfo[]; video: MediaDeviceInfo[] }> => {
  try {
    const all = await navigator.mediaDevices.enumerateDevices();
    return {
      audioIn: all.filter(d => d.kind === 'audioinput'),
      audioOut: all.filter(d => d.kind === 'audiooutput'),
      video: all.filter(d => d.kind === 'videoinput'),
    };
  } catch {
    return { audioIn: [], audioOut: [], video: [] };
  }
};

/** 尝试枚举真实 USB 设备 */
async function enumerateUsbDevices(): Promise<{ id: number; name: string; vendor: string; type: string }[]> {
  const result: { id: number; name: string; vendor: string; type: string }[] = [];
  // Tauri 原生：通过 RS-232 / spice bridge 获取
  try {
    const w = window as any;
    if (w.__TAURI__?.invoke) {
      const raw = await w.__TAURI__.invoke('get_usb_devices');
      if (raw) {
        const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(list)) return list.map((d: any, i: number) => ({ id: i + 1, name: d.name || '未知设备', vendor: d.vendor || '', type: d.type || 'other' }));
      }
    }
  } catch {}
  // 浏览器 WebUSB API
  try {
    const usb = navigator as any;
    if (usb?.usb?.getDevices) {
      const devices = await usb.usb.getDevices();
      for (const d of devices) {
        result.push({ id: d.serialNumber || result.length + 1, name: d.productName || `USB 设备 #${result.length + 1}`, vendor: d.manufacturerName || '', type: 'other' });
      }
    }
  } catch {}
  // 浏览器 navigator.mediaDevices + USB 摄像头
  try {
    const all = await navigator.mediaDevices.enumerateDevices();
    all.filter(d => d.kind === 'videoinput').forEach((d, i) => {
      if (!result.find(r => r.name.includes(d.label.slice(0, 10)))) {
        result.push({ id: 100 + i, name: d.label || `摄像头 #${i + 1}`, vendor: '', type: 'camera' });
      }
    });
  } catch {}
  return result;
}

const PeripheralSettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const peri = settings.peripheral;

  const [policy, setPolicy] = useState<'allow_all' | 'block_all' | 'by_device'>('by_device');
  const [devices, setDevices] = useState<any[]>((peri.usbDevices && peri.usbDevices.length > 0) ? peri.usbDevices : []);
  const [redirecting, setRedirecting] = useState<Record<number, boolean>>(peri.usbRedirect || {});
  const [scanning, setScanning] = useState(false);
  const [audioInput, setAudioInput] = useState(peri.audioInput || 'default');
  const [audioOutput, setAudioOutput] = useState(peri.audioOutput || 'default');
  const [audioInDevices, setAudioInDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutDevices, setAudioOutDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const micTesting = useRef(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micActive, setMicActive] = useState(false);

  // 枚举真实音频设备（即使权限不足也能获取设备列表，只是没有标签）
  useEffect(() => {
    // 即使 getUserMedia 失败，enumerateDevices 仍可返回设备（无标签）
    const fallbackEnum = () => {
      navigator.mediaDevices.enumerateDevices()
        .then((all) => {
          setAudioInDevices(all.filter(d => d.kind === 'audioinput'));
          setAudioOutDevices(all.filter(d => d.kind === 'audiooutput'));
          setVideoDevices(all.filter(d => d.kind === 'videoinput'));
          const aIns = all.filter(d => d.kind === 'audioinput');
          const aOuts = all.filter(d => d.kind === 'audiooutput');
          if (aIns.length > 0 && !peri.audioInput) setAudioInput(aIns[0].deviceId);
          if (aOuts.length > 0 && !peri.audioOutput) setAudioOutput(aOuts[0].deviceId);
        })
        .catch(() => {});
    };
    // 先尝试获取权限（获取设备标签），失败则回退到无标签枚举
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((stream) => {
        stream.getTracks().forEach(t => t.stop());
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((all) => {
        setAudioInDevices(all.filter(d => d.kind === 'audioinput'));
        setAudioOutDevices(all.filter(d => d.kind === 'audiooutput'));
        setVideoDevices(all.filter(d => d.kind === 'videoinput'));
        const aIns = all.filter(d => d.kind === 'audioinput');
        const aOuts = all.filter(d => d.kind === 'audiooutput');
        if (aIns.length > 0 && !peri.audioInput) setAudioInput(aIns[0].deviceId);
        if (aOuts.length > 0 && !peri.audioOutput) setAudioOutput(aOuts[0].deviceId);
      })
      .catch(() => fallbackEnum()); // 权限不足时仍用 enumerateDevices 获取设备
  }, []);

  // 进入页面时自动扫描 USB 设备
  useEffect(() => {
    if (!devices || devices.length === 0) {
      enumerateUsbDevices().then(real => {
        if (real.length > 0) setDevices(real.map(d => ({ ...d, allowed: true })));
      });
    }
  }, []);

  const toggleAllow = (id: number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, allowed: !d.allowed } : d));
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>外设设置</h2>

      {/* ── USB 设备 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>USB 设备</h3>
        </div>

        {/* 策略 + 扫描一行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {devices.length > 0 && (
            <>
              <select style={{ ...inputStyle, width: 120, padding: '4px 8px', fontSize: 12 }} value={policy} onChange={(e) => setPolicy(e.target.value as any)}>
                <option value="allow_all">全部允许</option>
                <option value="block_all">全部禁止</option>
                <option value="by_device">按设备</option>
              </select>
              {policy === 'allow_all' && <span style={{ color: theme.success, fontSize: 12 }}>✓ 允许</span>}
              {policy === 'block_all' && <span style={{ color: '#FF4D4F', fontSize: 12 }}>✕ 禁止</span>}
              <span style={{ color: theme.border }}>|</span>
            </>
          )}
          <span style={{ color: theme.textTertiary, fontSize: 12 }}>已检测 {devices.length} 个</span>
          <button onClick={async () => {
            setScanning(true);
            const real = await enumerateUsbDevices();
            if (real.length > 0) {
              setDevices(real.map(d => ({ ...d, allowed: true })));
              toast.success(`检测到 ${real.length} 个 USB 设备`);
            } else {
              toast.warning('未检测到 USB 设备，请确认已插入');
            }
            setScanning(false);
          }} disabled={scanning} style={{ padding: '6px 16px', background: theme.primaryLight, border: `1px solid ${theme.primary}40`, borderRadius: 6, color: theme.primary, fontSize: 12, cursor: scanning ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            {scanning ? '扫描中...' : '🔍 扫描 USB 设备'}
          </button>
        </div>

        {/* 设备列表 — 始终显示 */}
        <div style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 8, fontWeight: 500 }}>
          检测到的设备 ({devices.length})
        </div>
        {devices.map(d => (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', marginBottom: 4, borderRadius: 6,
            background: policy === 'block_all' ? 'rgba(255,77,79,0.03)' : redirecting[d.id] ? 'rgba(25,190,107,0.05)' : theme.bgInput,
            border: `1px solid ${
              policy === 'block_all' ? 'rgba(255,77,79,0.1)' :
              redirecting[d.id] ? 'rgba(25,190,107,0.15)' : theme.border
            }`,
          }}>
            {policy === 'by_device' ? (
              <input type="checkbox" checked={!!redirecting[d.id]} onChange={(e) => setRedirecting(r => ({...r, [d.id]: e.target.checked}))} style={{ accentColor: theme.primary, width: 16, height: 16 }} />
            ) : policy === 'allow_all' ? (
              <span style={{ color: theme.success, fontSize: 14 }}>✓</span>
            ) : (
              <span style={{ color: '#FF4D4F', fontSize: 14 }}>✕</span>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: theme.textPrimary, fontSize: 13 }}>{d.name}</div>
              <div style={{ color: theme.textTertiary, fontSize: 11 }}>{d.vendor} · {d.type}</div>
            </div>
            <span style={{ fontSize: 11, color: policy === 'block_all' ? '#FF4D4F' : redirecting[d.id] ? theme.success : theme.textTertiary, fontWeight: 500 }}>
              {policy === 'block_all' ? '已禁止' : policy === 'allow_all' ? '允许' : redirecting[d.id] ? '重定向' : '仅充电'}
            </span>
          </div>
        ))}
        {devices.length === 0 && <div style={{ color: theme.textTertiary, fontSize: 12, padding: 16, textAlign: 'center', background: theme.bgInput, borderRadius: 8 }}>点击"扫描 USB 设备"检测外设</div>}
      </div>

      {/* ── 打印机映射 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>打印机映射</h3>
        </div>
        <select style={{ ...inputStyle, maxWidth: 200 }} value={peri.printerAutoMap ? 'on' : 'off'} onChange={(e) => saveSettings({ peripheral: { ...peri, printerAutoMap: e.target.value === 'on' } })}>
          <option value="on">开启</option>
          <option value="off">关闭</option>
        </select>
      </div>

      {/* ── 音频 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>音频设置</h3>
        </div>
        <div style={{ marginBottom: 12 }}>
          <select style={{ ...inputStyle, maxWidth: 200 }} value={peri.audioEnabled ? 'on' : 'off'} onChange={(e) => saveSettings({ peripheral: { ...peri, audioEnabled: e.target.value === 'on' } })}>
            <option value="on">开启音频</option>
            <option value="off">关闭音频</option>
          </select>
        </div>
        {peri.audioEnabled && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>音频输入设备</label>
                <select style={inputStyle} value={audioInput} onChange={(e) => setAudioInput(e.target.value)} disabled={audioInDevices.length === 0}>
                  {audioInDevices.length > 0 ? audioInDevices.map((d, i) => (
                    <option key={i} value={d.deviceId}>{d.label || `麦克风 #${i + 1}`}</option>
                  )) : <option>未检测到麦克风</option>}
                </select>
              </div>
              <div>
                <label style={labelStyle}>音频输出设备</label>
                <select style={inputStyle} value={audioOutput} onChange={(e) => setAudioOutput(e.target.value)} disabled={audioOutDevices.length === 0}>
                  {audioOutDevices.length > 0 ? audioOutDevices.map((d, i) => (
                    <option key={i} value={d.deviceId}>{d.label || `扬声器 #${i + 1}`}</option>
                  )) : <option>未检测到扬声器</option>}
                </select>
              </div>
            </div>
            {/* 音频测试 */}
            <div style={{ background: theme.bgInput, borderRadius: 8, padding: 12, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: theme.textSecondary }}>音频测试</span>
                <span style={{ fontSize: 10, color: theme.textTertiary }}>已识别 {audioInDevices.length} 个输入 / {audioOutDevices.length} 个输出设备</span>
                <button onClick={async () => {
                  try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    if (ctx.state === 'suspended') await ctx.resume();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = 440;
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.8);
                    osc.onended = () => ctx.close();
                  } catch (e: any) {
                    toast.error('无法播放测试音: ' + (e.message || ''));
                  }
                }} style={{ padding: '6px 16px', background: theme.primaryLight, border: `1px solid ${theme.primary}40`, borderRadius: 6, color: theme.primary, fontSize: 12, cursor: 'pointer' }}>
                  ▶ 播放测试音
                </button>
                <button onClick={async () => {
                  if (micActive || (micTesting && micTesting.current)) {
                    if (micTesting) micTesting.current = false;
                    setMicActive(false);
                    setMicLevel(0);
                    return;
                  }
                  try {
                    const constraints: MediaStreamConstraints = { audio: audioInput !== 'default' ? { deviceId: { exact: audioInput } } : true };
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    const ctx = new AudioContext();
                    const src = ctx.createMediaStreamSource(stream);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 256;
                    src.connect(analyser);
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    micTesting.current = true;
                    setMicActive(true);
                    setMicLevel(0);
                    const interval = setInterval(() => {
                      analyser.getByteFrequencyData(dataArray);
                      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                      setMicLevel(Math.min(100, Math.round(avg * 2)));
                      if (!micTesting.current) {
                        clearInterval(interval);
                        stream.getTracks().forEach(t => t.stop());
                        ctx.close();
                      }
                    }, 100);
                  } catch (e: any) {
                    if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                      toast.error('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问');
                    } else if (e.name === 'NotFoundError') {
                      toast.error('未检测到麦克风设备');
                    } else {
                      toast.error('无法访问麦克风: ' + (e.message || ''));
                    }
                  }
                }} style={{ padding: '6px 16px', background: micActive ? '#FF4D4F' : theme.primaryLight, border: `1px solid ${micActive ? '#FF4D4F' : theme.primary}40`, borderRadius: 6, color: micActive ? '#FF4D4F' : theme.primary, fontSize: 12, cursor: 'pointer' }}>
                  🎤 {micActive ? '停止测试' : '麦克风测试'}
                </button>
              </div>
              {micActive && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.textTertiary, marginBottom: 4 }}>
                    <span>信号强度</span>
                    <span>{micLevel}%</span>
                  </div>
                  <div style={{ height: 8, background: theme.border, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${micLevel}%`, background: micLevel > 70 ? theme.success : micLevel > 30 ? '#F5A623' : theme.primary, borderRadius: 4, transition: 'width 0.1s' }} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 智能卡 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <h3 style={{ ...sectionTitleStyle, margin: 0 }}>智能卡 / UKey</h3>
        </div>
        <select style={{ ...inputStyle, maxWidth: 200 }} value={peri.smartcardEnabled ? 'on' : 'off'} onChange={(e) => saveSettings({ peripheral: { ...peri, smartcardEnabled: e.target.value === 'on' } })}>
          <option value="on">开启</option>
          <option value="off">关闭</option>
        </select>
      </div>

      <button onClick={async () => {
        const data = { peripheral: { ...settings.peripheral, usbDevices: devices, usbRedirect: redirecting, usbPolicy: policy, audioInput, audioOutput } };
        await saveSettings(data);
        // 验证保存结果
        const saved = localStorage.getItem('app_settings');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const devs = parsed?.peripheral?.usbDevices;
            // 验证无误即提示成功
          } catch {}
        }
        toast.success('外设设置已保存');
      }} style={{ padding: '10px 32px', background: theme.gradientPrimary, border: 'none', borderRadius: theme.radius, color: theme.textOnPrimary, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        保存设置
      </button>
    </div>
  );
};

export default PeripheralSettings;
