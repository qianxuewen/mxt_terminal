import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, toggleBtnStyle, cardStyle } from '@/theme';

const WEEKDAYS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 0, label: '周日' },
];

const PowerSettings: React.FC = () => {
  const { settings, saveSettings } = useSettingsStore();
  const power = settings.power;

  const [idleAction, setIdleAction] = useState(power.idleAction);
  const [idleTimeout, setIdleTimeout] = useState(power.idleTimeout);
  const [scheduledEnabled, setScheduledEnabled] = useState(power.scheduledTaskEnabled);
  const [scheduledDays, setScheduledDays] = useState<number[]>(power.scheduledDays);
  const [scheduledTime, setScheduledTime] = useState(power.scheduledTime);
  const [scheduledAction, setScheduledAction] = useState(power.scheduledAction);
  const [shutdownOnAppClose, setShutdownOnAppClose] = useState(power.shutdownOnAppClose);
  const [shutdownOnDisconnect, setShutdownOnDisconnect] = useState(power.shutdownOnDisconnect);

  const toggleDay = (day: number) => {
    setScheduledDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    saveSettings({
      power: {
        ...power,
        idleAction,
        idleTimeout,
        scheduledTaskEnabled: scheduledEnabled,
        scheduledDays,
        scheduledTime,
        scheduledAction,
        shutdownOnAppClose,
        shutdownOnDisconnect,
      },
    });
    toast.success('电源设置已保存');
  };

  const sel = { ...inputStyle, maxWidth: 300 };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: theme.textPrimary }}>电源设置</h2>

      {/* ── 空闲节能 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>空闲节能</h3>
        <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 12 }}>
          终端无操作一段时间后自动执行
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>动作</label>
            <select style={inputStyle} value={idleAction} onChange={(e) => setIdleAction(e.target.value as any)}>
              <option value="sleep">自动休眠</option>
              <option value="shutdown">自动关机</option>
              <option value="none">关闭</option>
            </select>
          </div>
          {idleAction !== 'none' && (
            <div>
              <label style={labelStyle}>无操作超时 (分钟)</label>
              <input style={inputStyle} type="number" value={idleTimeout} onChange={(e) => setIdleTimeout(parseInt(e.target.value) || 30)} />
            </div>
          )}
        </div>
      </div>

      {/* ── 定时任务 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>定时任务</h3>
        <p style={{ color: theme.textTertiary, fontSize: 13, marginBottom: 12 }}>
          按计划时间自动执行关机或重启
        </p>
        <select style={sel} value={scheduledEnabled ? 'on' : 'off'} onChange={(e) => setScheduledEnabled(e.target.value === 'on')}>
          <option value="off">关闭</option>
          <option value="on">开启</option>
        </select>

        {scheduledEnabled && (
          <div style={{ ...cardStyle, padding: 16, marginTop: 12 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>重复</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {WEEKDAYS.map(({ value, label }) => (
                  <button key={value} style={toggleBtnStyle(scheduledDays.includes(value))} onClick={() => toggleDay(value)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>执行时间</label>
                <input style={inputStyle} type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>执行动作</label>
                <select style={inputStyle} value={scheduledAction} onChange={(e) => setScheduledAction(e.target.value as any)}>
                  <option value="shutdown">关机</option>
                  <option value="restart">重启</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 联动关机 ── */}
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>联动关机</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>关闭客户端时关机</label>
            <select style={inputStyle} value={shutdownOnAppClose ? 'on' : 'off'} onChange={(e) => setShutdownOnAppClose(e.target.value === 'on')}>
              <option value="off">关闭</option>
              <option value="on">开启</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>断开连接后关机</label>
            <select style={inputStyle} value={shutdownOnDisconnect ? 'on' : 'off'} onChange={(e) => setShutdownOnDisconnect(e.target.value === 'on')}>
              <option value="off">关闭</option>
              <option value="on">开启</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave} style={{ padding: '10px 32px', background: theme.gradientPrimary, border: 'none', borderRadius: theme.radius, color: theme.textOnPrimary, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
        保存设置
      </button>
    </div>
  );
};

export default PowerSettings;
