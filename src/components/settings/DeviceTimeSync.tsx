import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';

const DeviceTimeSync: React.FC = () => {
  const { settings, saveSettings, syncTime, loading } = useSettingsStore();
  const ts = settings.timeSync;

  const handleSyncNow = async () => {
    await syncTime();
    toast.success('时间同步完成');
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>设备校时</h2>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 48 }}>🕐</span>
          <div>
            <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>NTP 时间同步</div>
            <div style={{ color: '#888', fontSize: 13 }}>同步设备时间，确保连接安全</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>NTP 服务器</label>
            <input
              defaultValue={ts.server}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}
              onChange={(e) => saveSettings({ timeSync: { ...ts, server: e.target.value } })}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>时区</label>
            <select
              defaultValue={ts.timezone}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}
              onChange={(e) => saveSettings({ timeSync: { ...ts, timezone: e.target.value } })}
            >
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              <option value="America/New_York">America/New_York (UTC-5)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>同步间隔 (小时)</label>
            <input
              type="number"
              defaultValue={ts.interval}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 14 }}
              onChange={(e) => saveSettings({ timeSync: { ...ts, interval: parseInt(e.target.value) || 24 } })}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>上次同步</label>
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, color: '#888', fontSize: 14 }}>
              {ts.lastSyncTime ? new Date(ts.lastSyncTime).toLocaleString('zh-CN') : '未同步'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 14 }}>
            <input type="checkbox" defaultChecked={ts.enabled} style={{ accentColor: '#4a6cf7', width: 16, height: 16 }}
              onChange={(e) => saveSettings({ timeSync: { ...ts, enabled: e.target.checked } })} />
            启用 NTP 时间同步
          </label>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={loading}
          style={{
            padding: '10px 32px', background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
            border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '同步中...' : '立即同步'}
        </button>
      </div>

      <div style={{ color: '#666', fontSize: 12, lineHeight: 1.6 }}>
        准确的系统时间对于安全连接和证书验证非常重要。建议保持 NTP 同步开启。
      </div>
    </div>
  );
};

export default DeviceTimeSync;
