import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

const PowerSettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const power = settings.power;

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
    background: active ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? '#4a6cf7' : '#999',
  });

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>电源设置</h2>

      {/* 自动休眠 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>自动休眠</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>无操作自动休眠，节省资源</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={toggleStyle(power.autoSleepEnabled)} onClick={() => saveSettings({ power: { ...power, autoSleepEnabled: true } })}>开启</button>
          <button style={toggleStyle(!power.autoSleepEnabled)} onClick={() => saveSettings({ power: { ...power, autoSleepEnabled: false } })}>关闭</button>
        </div>
        {power.autoSleepEnabled && (
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>休眠超时 (分钟)</label>
            <input type="number" defaultValue={power.autoSleepTimeout}
              style={{ width: 200, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}
              onChange={(e) => saveSettings({ power: { ...power, autoSleepTimeout: parseInt(e.target.value) || 30 } })}
            />
          </div>
        )}
      </div>

      {/* 自动关机 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>自动关机</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>长时间空闲自动关机</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={toggleStyle(power.autoShutdownEnabled)} onClick={() => saveSettings({ power: { ...power, autoShutdownEnabled: true } })}>开启</button>
          <button style={toggleStyle(!power.autoShutdownEnabled)} onClick={() => saveSettings({ power: { ...power, autoShutdownEnabled: false } })}>关闭</button>
        </div>
        {power.autoShutdownEnabled && (
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>关机超时 (分钟)</label>
            <input type="number" defaultValue={power.autoShutdownTimeout}
              style={{ width: 200, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}
              onChange={(e) => saveSettings({ power: { ...power, autoShutdownTimeout: parseInt(e.target.value) || 120 } })}
            />
          </div>
        )}
      </div>

      {/* 联动关机 */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>联动关机</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>关闭客户端时同步关机云桌面</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={toggleStyle(power.shutdownOnAppClose)} onClick={() => saveSettings({ power: { ...power, shutdownOnAppClose: true } })}>开启</button>
          <button style={toggleStyle(!power.shutdownOnAppClose)} onClick={() => saveSettings({ power: { ...power, shutdownOnAppClose: false } })}>关闭</button>
        </div>
      </div>

      {/* 电源按钮 */}
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>电源按钮行为</h3>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>设置客户端电源按钮的操作</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { value: 'sleep', label: '休眠' },
            { value: 'shutdown', label: '关机' },
            { value: 'lock', label: '锁定' },
            { value: 'none', label: '无操作' },
          ].map((opt) => (
            <button
              key={opt.value}
              style={toggleStyle(power.powerButtonAction === opt.value)}
              onClick={() => saveSettings({ power: { ...power, powerButtonAction: opt.value as any } })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PowerSettings;
