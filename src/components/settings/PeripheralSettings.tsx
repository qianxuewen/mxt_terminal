import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, toggleBtnStyle, sectionTitleStyle, cardStyle } from '@/theme';

const MOCK_DEVICES = [
  { id: 1, name: 'SanDisk USB 3.0 (64GB)', vendor: 'SanDisk', type: 'storage' as const, allowed: true },
  { id: 2, name: 'Logitech USB 摄像头 C920', vendor: 'Logitech', type: 'camera' as const, allowed: false },
  { id: 3, name: 'CH341 USB 串口转换器', vendor: 'WCH', type: 'serial' as const, allowed: true },
  { id: 4, name: 'Kingston DataTraveler (32GB)', vendor: 'Kingston', type: 'storage' as const, allowed: false },
  { id: 5, name: 'Microsoft 键盘 (USB)', vendor: 'Microsoft', type: 'hid' as const, allowed: true },
];

const PeripheralSettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const peri = settings.peripheral;

  const [policy, setPolicy] = useState<'allow_all' | 'block_all' | 'by_device'>('by_device');
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [redirecting, setRedirecting] = useState<Record<number, boolean>>({});

  const allowedDevices = devices.filter(d => d.allowed);
  const blockedDevices = devices.filter(d => !d.allowed);

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

        {/* 策略 */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>策略</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select style={{ ...inputStyle, width: 140 }} value={policy} onChange={(e) => setPolicy(e.target.value as any)}>
              <option value="allow_all">全部允许</option>
              <option value="block_all">全部禁止</option>
              <option value="by_device">按设备</option>
            </select>
            {policy === 'allow_all' && <span style={{ color: theme.success, fontSize: 13 }}>✓ 所有 USB 设备允许重定向</span>}
            {policy === 'block_all' && <span style={{ color: '#FF4D4F', fontSize: 13 }}>✕ 所有 USB 设备已禁止重定向</span>}
          </div>
        </div>

        {policy === 'by_device' && (
          <>
            <div style={{ fontSize: 12, color: theme.success, marginBottom: 8, fontWeight: 500 }}>允许的设备</div>
            {allowedDevices.map(d => (
              <label key={d.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '8px 12px', marginBottom: 4, borderRadius: 6,
                background: redirecting[d.id] ? 'rgba(25,190,107,0.05)' : theme.bgInput,
                border: `1px solid ${redirecting[d.id] ? 'rgba(25,190,107,0.15)' : theme.border}`,
              }}>
                <input type="checkbox" checked={!!redirecting[d.id]} onChange={(e) => setRedirecting(r => ({...r, [d.id]: e.target.checked}))} style={{ accentColor: theme.primary, width: 16, height: 16 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: theme.textPrimary, fontSize: 13 }}>{d.name}</div>
                  <div style={{ color: theme.textTertiary, fontSize: 11 }}>{d.vendor} · {d.type}</div>
                </div>
                <span style={{ fontSize: 11, color: redirecting[d.id] ? theme.success : theme.textTertiary, fontWeight: 500 }}>{redirecting[d.id] ? '重定向' : '仅充电'}</span>
              </label>
            ))}
            {allowedDevices.length === 0 && <div style={{ color: theme.textTertiary, fontSize: 12, padding: 8 }}>无已允许的设备</div>}

            <div style={{ fontSize: 12, color: '#FF4D4F', marginTop: 12, marginBottom: 8, fontWeight: 500 }}>禁止的设备</div>
            {blockedDevices.map(d => (
              <div key={d.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', marginBottom: 4, borderRadius: 6,
                background: 'rgba(255,77,79,0.02)', border: '1px solid rgba(255,77,79,0.06)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: theme.textTertiary, fontSize: 13 }}>{d.name}</div>
                  <div style={{ color: theme.textTertiary, fontSize: 11 }}>{d.vendor} · {d.type}</div>
                </div>
                <span style={{ fontSize: 11, color: '#FF4D4F', fontWeight: 500 }}>已禁止</span>
              </div>
            ))}
            {blockedDevices.length === 0 && <div style={{ color: theme.textTertiary, fontSize: 12, padding: 8 }}>无禁止的设备</div>}
          </>
        )}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>音频输入设备</label>
              <select style={inputStyle}>
                <option>默认设备</option>
                <option>麦克风 (Realtek Audio)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>音频输出设备</label>
              <select style={inputStyle}>
                <option>默认设备</option>
                <option>扬声器 (Realtek Audio)</option>
              </select>
            </div>
          </div>
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

      <button onClick={() => { saveSettings({ peripheral: peri }); toast.success('外设设置已保存'); }} style={{ padding: '10px 32px', background: theme.gradientPrimary, border: 'none', borderRadius: theme.radius, color: theme.textOnPrimary, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        保存设置
      </button>
    </div>
  );
};

export default PeripheralSettings;
