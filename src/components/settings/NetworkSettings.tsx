import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

const NetworkSettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const net = settings.network;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, color: '#a0a0b8', marginBottom: 6,
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
    background: active ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
    color: active ? '#4a6cf7' : '#999',
  });

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>网络设置</h2>

      {/* Proxy */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>代理设置</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={toggleStyle(net.proxyEnabled)} onClick={() => saveSettings({ network: { ...net, proxyEnabled: true } })}>开启代理</button>
          <button style={toggleStyle(!net.proxyEnabled)} onClick={() => saveSettings({ network: { ...net, proxyEnabled: false } })}>关闭代理</button>
        </div>

        {net.proxyEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>代理类型</label>
              <select style={inputStyle} defaultValue={net.proxyType}>
                <option value="http">HTTP</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>代理地址</label>
              <input style={inputStyle} defaultValue={net.proxyHost} placeholder="127.0.0.1" />
            </div>
            <div>
              <label style={labelStyle}>代理端口</label>
              <input style={inputStyle} type="number" defaultValue={net.proxyPort || ''} placeholder="1080" />
            </div>
            <div>
              <label style={labelStyle}>带宽限制 (Mbps, 0=不限)</label>
              <input style={inputStyle} type="number" defaultValue={net.bandwidthLimit} />
            </div>
          </div>
        )}
      </div>

      {/* Advanced */}
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>高级设置</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#ccc', fontSize: 14 }}>
            <input type="checkbox" style={{ accentColor: '#4a6cf7', width: 16, height: 16 }} />
            启用 QUIC 传输协议
          </label>
        </div>
      </div>
    </div>
  );
};

export default NetworkSettings;
