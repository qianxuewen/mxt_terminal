import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

const DisplaySettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const display = settings.display;

  const handleToggle = (key: string, value: boolean) => {
    saveSettings({ display: { ...display, [key]: value } });
  };

  const radioGroup = (label: string, value: string, options: { value: string; label: string }[], onChange: (v: string) => void) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
              background: value === opt.value ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${value === opt.value ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: value === opt.value ? '#4a6cf7' : '#999',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>屏幕设置</h2>

      {radioGroup('默认显示模式', display.defaultMode, [
        { value: 'window', label: '窗口模式' },
        { value: 'fullscreen', label: '全屏模式' },
      ], (v) => saveSettings({ display: { ...display, defaultMode: v as any } }))}

      {radioGroup('默认画质', display.defaultQuality, [
        { value: 'low', label: '流畅' },
        { value: 'medium', label: '均衡' },
        { value: 'high', label: '高清' },
        { value: 'lossless', label: '无损' },
      ], (v) => saveSettings({ display: { ...display, defaultQuality: v as any } }))}

      {radioGroup('画面缩放', display.scaling, [
        { value: 'fit', label: '适应' },
        { value: 'fill', label: '填充' },
        { value: 'stretch', label: '拉伸' },
        { value: 'original', label: '原始' },
      ], (v) => saveSettings({ display: { ...display, scaling: v as any } }))}

      {radioGroup('DPI 缩放', display.dpiScaling, [
        { value: 'auto', label: '自动' },
        { value: '100', label: '100%' },
        { value: '125', label: '125%' },
        { value: '150', label: '150%' },
      ], (v) => saveSettings({ display: { ...display, dpiScaling: v as any } }))}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8 }}>色彩深度</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[16, 24, 32].map((v) => (
            <button
              key={v}
              onClick={() => saveSettings({ display: { ...display, colorDepth: v as 16 | 24 | 32 } })}
              style={{
                padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                background: display.colorDepth === v ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${display.colorDepth === v ? 'rgba(74,108,247,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: display.colorDepth === v ? '#4a6cf7' : '#999',
              }}
            >
              {v} bit
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 8 }}>帧率限制</div>
        <input
          type="range"
          min={15}
          max={120}
          step={5}
          defaultValue={display.frameRateLimit}
          style={{ width: '100%' }}
          onChange={(e) => saveSettings({ display: { ...display, frameRateLimit: parseInt(e.target.value) } })}
        />
        <div style={{ color: '#888', fontSize: 12, marginTop: 4, textAlign: 'center' }}>{display.frameRateLimit} FPS</div>
      </div>

      {/* Toggle options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {[
          { key: 'multiMonitor', label: '多屏扩展支持' },
          { key: 'rememberWindowPosition', label: '记住窗口位置' },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#ccc', fontSize: 14 }}>
            <input type="checkbox" checked={(display as any)[key]} onChange={(e) => handleToggle(key, e.target.checked)} style={{ accentColor: '#4a6cf7', width: 16, height: 16 }} />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default DisplaySettings;
