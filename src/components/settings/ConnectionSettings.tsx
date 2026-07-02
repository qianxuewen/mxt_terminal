import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';

const ConnectionSettings: React.FC = () => {
  const { settings, saveSettings, saving } = useSettingsStore();
  const conn = settings.connection;

  const handleSave = () => {
    saveSettings({});
    toast.success('接入设置已保存');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14, outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, color: '#a0a0b8', marginBottom: 6,
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>接入设置</h2>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
        设置桌面云服务器IP、服务端口和设备端口。默认连接: 192.168.201.131:5900
      </p>

      <Section title="服务器连接">
        <div>
          <label style={labelStyle}>服务器地址</label>
          <input style={inputStyle} defaultValue={conn.host} placeholder="例如: 192.168.201.131" />
        </div>
        <div>
          <label style={labelStyle}>SPICE 端口</label>
          <input style={inputStyle} type="number" defaultValue={conn.port} placeholder="5900" />
        </div>
        <div>
          <label style={labelStyle}>超时时间 (秒)</label>
          <input style={inputStyle} type="number" defaultValue={conn.timeout} />
        </div>
        <div>
          <label style={labelStyle}>心跳间隔 (秒)</label>
          <input style={inputStyle} type="number" defaultValue={conn.heartbeatInterval} />
        </div>
      </Section>

      <Section title="自动重连">
        <div>
          <label style={labelStyle}>自动重连</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['开启', '关闭'].map((v) => (
              <button key={v} style={{
                flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer',
                background: (v === '开启') === conn.autoReconnect ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${(v === '开启') === conn.autoReconnect ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: (v === '开启') === conn.autoReconnect ? '#4a6cf7' : '#999', fontSize: 13,
              }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>重连间隔 (秒)</label>
          <input style={inputStyle} type="number" defaultValue={conn.reconnectInterval} />
        </div>
        <div>
          <label style={labelStyle}>最大重连次数</label>
          <input style={inputStyle} type="number" defaultValue={conn.reconnectAttempts} />
        </div>
      </Section>

      <Section title="安全">
        <div>
          <label style={labelStyle}>TLS 加密</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['开启', '关闭'].map((v) => (
              <button key={v} style={{
                flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer',
                background: (v === '开启') === conn.tlsEnabled ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${(v === '开启') === conn.tlsEnabled ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: (v === '开启') === conn.tlsEnabled ? '#4a6cf7' : '#999', fontSize: 13,
              }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '10px 32px', marginTop: 16,
          background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
          border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? '保存中...' : '保存设置'}
      </button>
    </div>
  );
};

export default ConnectionSettings;
