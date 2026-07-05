import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, sectionTitleStyle, cardStyle, toggleBtnStyle } from '@/theme';

const RESOLUTION_OPTIONS = [
  { value: '1920x1080', label: '1920 × 1080' },
  { value: '1680x1050', label: '1680 × 1050' },
  { value: '1440x900', label: '1440 × 900' },
  { value: '1366x768', label: '1366 × 768' },
  { value: '1280x720', label: '1280 × 720' },
];

const DisplaySettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const display = settings.display;

  const [resolutions, setResolutions] = useState<Record<number, string>>(display.resolutions || { 1: '1920x1080', 2: '1920x1080' });
  const [selectedMonitor, setSelectedMonitor] = useState<number>(1);
  const [dualMode, setDualMode] = useState<'extend' | 'copy'>(display.dualMode || 'extend');
  const [monitorReversed, setMonitorReversed] = useState(display.monitorReversed || false);
  const [monitorVertical, setMonitorVertical] = useState(display.monitorVertical || false);

  // 检测到的显示器（假设已接入双屏）
  const monitors = [
    { id: 1, name: '显示器 1' },
    { id: 2, name: '显示器 2' },
  ];

  const handleSave = () => {
    saveSettings({
      display: {
        ...display,
        dualMode,
        monitorVertical,
        monitorReversed,
        resolutions,
      },
    });
    toast.success('屏幕设置已保存');
  };

  const selectStyle = { ...inputStyle, maxWidth: 300 };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>屏幕设置</h2>

      {/* ── 显示模式 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={sectionTitleStyle}>显示模式</h3>
        <select style={{ ...inputStyle, maxWidth: 300 }} value={display.defaultMode} onChange={(e) => saveSettings({ display: { ...display, defaultMode: e.target.value as any } })}>
          <option value="window">窗口模式</option>
          <option value="fullscreen">全屏模式</option>
        </select>
      </div>

      {/* ── 多屏显示 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={sectionTitleStyle}>多屏显示</h3>
        <div style={{ ...cardStyle, padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>多屏模式</label>
              <select style={inputStyle} value={dualMode} onChange={(e) => setDualMode(e.target.value as any)}>
                <option value="extend">扩展</option>
                <option value="copy">复制</option>
              </select>
            </div>
            {dualMode === 'extend' && (
              <div>
                <label style={labelStyle}>排列方向</label>
                <select style={inputStyle} value={monitorVertical ? 'vertical' : 'horizontal'} onChange={(e) => setMonitorVertical(e.target.value === 'vertical')}>
                  <option value="horizontal">左右</option>
                  <option value="vertical">上下</option>
                </select>
              </div>
            )}
          </div>

          {/* 扩展模式时显示屏幕布局 */}
          {dualMode === 'extend' && (
            <>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 16,
                alignItems: 'center', padding: 16,
                flexDirection: monitorVertical ? 'column' : 'row',
              }}>
                <MonitorBox
                  label={monitors[monitorReversed ? 1 : 0].name}
                  number={monitorReversed ? '2' : '1'}
                  resolution={resolutions[monitorReversed ? 2 : 1] || '1920x1080'}
                  scale={display.dpiScaling}
                  selected={selectedMonitor === (monitorReversed ? 2 : 1)}
                  onClick={() => setSelectedMonitor(monitorReversed ? 2 : 1)}
                  onIdentify={() => toast.info(`显示器 ${monitorReversed ? '2' : '1'} 已标识`)}
                />
                <span
                  onClick={() => setMonitorReversed(prev => !prev)}
                  style={{
                    fontSize: 24, cursor: 'pointer', color: theme.textTertiary, padding: 8,
                    userSelect: 'none', borderRadius: 8,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.textTertiary}
                  title="交换位置"
                >{monitorVertical ? '⇅' : '⇄'}</span>
                <MonitorBox
                  label={monitors[monitorReversed ? 0 : 1].name}
                  number={monitorReversed ? '1' : '2'}
                  resolution={resolutions[monitorReversed ? 1 : 2] || '1920x1080'}
                  scale={display.dpiScaling}
                  selected={selectedMonitor === (monitorReversed ? 1 : 2)}
                  onClick={() => setSelectedMonitor(monitorReversed ? 1 : 2)}
                  onIdentify={() => toast.info(`显示器 ${monitorReversed ? '1' : '2'} 已标识`)}
                />
              </div>

              {/* 选中屏幕的分辨率设置 */}
              <div style={{ background: theme.bgInput, borderRadius: 8, padding: 16, marginTop: 12 }}>
                <label style={labelStyle}>
                  {monitors.find(m => m.id === selectedMonitor)?.name} - 分辨率
                </label>
                <select style={inputStyle} value={resolutions[selectedMonitor] || '1920x1080'}
                  onChange={(e) => setResolutions(prev => ({ ...prev, [selectedMonitor]: e.target.value }))}>
                  {RESOLUTION_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 缩放比例 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={sectionTitleStyle}>缩放比例</h3>
        <select style={{ ...inputStyle, maxWidth: 300 }} value={display.dpiScaling} onChange={(e) => saveSettings({ display: { ...display, dpiScaling: e.target.value as any } })}>
          <option value="100">100%</option>
          <option value="125">125%</option>
          <option value="150">150%</option>
          <option value="175">175%</option>
          <option value="200">200%</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        style={{
          padding: '10px 32px', background: theme.gradientPrimary,
          border: 'none', borderRadius: theme.radius, color: theme.textOnPrimary,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        保存设置
      </button>
    </div>
  );
};

/** 可拖拽的显示器卡片 */
const MonitorBox: React.FC<{ label: string; number: string; resolution: string; scale: string; selected: boolean; onClick: () => void; onIdentify?: () => void }> = ({ label, number, resolution, scale, selected, onClick, onIdentify }) => {
  // 根据分辨率计算宽高比
  const parts = resolution.split('x');
  const aspect = parts.length === 2 ? parseInt(parts[0]) / parseInt(parts[1]) : 16 / 9;
  const scaling = scale === 'auto' ? 100 : parseInt(scale) || 100;
  const baseH = 36;
  const monH = Math.round(baseH * scaling / 100);
  const monW = Math.round(monH * aspect);

  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
    <div
      onClick={onClick}
      style={{
        width: monW + 60, padding: '12px 8px', borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4,
        cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s', position: 'relative',
        background: selected ? theme.primaryLight : theme.bgCard,
        border: `2px solid ${selected ? theme.primary : theme.border}`,
        boxShadow: selected ? `0 0 0 2px ${theme.primary}20` : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 4, left: 8, fontSize: 18, fontWeight: 700,
        color: selected ? theme.primary : theme.border,
        lineHeight: 1,
      }}>{number}</span>
      <div style={{
        width: monW, height: monH, borderRadius: 3, marginTop: 6,
        border: `2px solid ${selected ? theme.primary : theme.border}`,
        background: selected ? 'rgba(24,113,255,0.05)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
          width: 14, height: 4, borderRadius: '0 0 2px 2px',
          background: selected ? theme.primary : theme.border,
        }} />
      </div>
      <span style={{ color: selected ? theme.primary : theme.textPrimary, fontSize: 12, fontWeight: 500 }}>{label}</span>
      <span style={{ color: theme.textTertiary, fontSize: 10 }}>{resolution}  {scale === 'auto' ? '自动' : `${scale}%`}</span>
      {selected && <span style={{ color: theme.primary, fontSize: 10 }}>已选中</span>}
    </div>
    {onIdentify && (
      <button
        onClick={(e) => { e.stopPropagation(); onIdentify(); }}
        style={{
          fontSize: 11, padding: '2px 10px', borderRadius: 4, cursor: 'pointer',
          background: theme.bgInput, border: `1px solid ${theme.border}`,
          color: theme.textTertiary, marginTop: 2,
        }}
      >
        标识 {number}
      </button>
    )}
  </div>
  );
};

export default DisplaySettings;
