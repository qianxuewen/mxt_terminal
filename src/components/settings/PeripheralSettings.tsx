import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

const PeripheralSettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const peri = settings.peripheral;

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
    background: active ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? '#4a6cf7' : '#999',
  });

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>外设设置</h2>

      {/* USB 设置 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>USB 设备</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>USB 设备自动重定向到云桌面</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button style={toggleStyle(peri.usbAutoRedirect)} onClick={() => saveSettings({ peripheral: { ...peri, usbAutoRedirect: true } })}>自动重定向</button>
          <button style={toggleStyle(!peri.usbAutoRedirect)} onClick={() => saveSettings({ peripheral: { ...peri, usbAutoRedirect: false } })}>手动管理</button>
        </div>
      </div>

      {/* 打印机 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>打印机映射</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>自动映射本地打印机到云桌面</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={toggleStyle(peri.printerAutoMap)} onClick={() => saveSettings({ peripheral: { ...peri, printerAutoMap: true } })}>开启</button>
          <button style={toggleStyle(!peri.printerAutoMap)} onClick={() => saveSettings({ peripheral: { ...peri, printerAutoMap: false } })}>关闭</button>
        </div>
      </div>

      {/* 音频 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>音频设置</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={toggleStyle(peri.audioEnabled)} onClick={() => saveSettings({ peripheral: { ...peri, audioEnabled: true } })}>开启音频</button>
          <button style={toggleStyle(!peri.audioEnabled)} onClick={() => saveSettings({ peripheral: { ...peri, audioEnabled: false } })}>关闭音频</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>音频输入设备</label>
            <select style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}>
              <option>默认设备</option>
              <option>麦克风 (Realtek Audio)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>音频输出设备</label>
            <select style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}>
              <option>默认设备</option>
              <option>扬声器 (Realtek Audio)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 智能卡 */}
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>智能卡 / UKey</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>USB Key 等智能卡设备支持</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={toggleStyle(peri.smartcardEnabled)} onClick={() => saveSettings({ peripheral: { ...peri, smartcardEnabled: true } })}>开启</button>
          <button style={toggleStyle(!peri.smartcardEnabled)} onClick={() => saveSettings({ peripheral: { ...peri, smartcardEnabled: false } })}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default PeripheralSettings;
