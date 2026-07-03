import React, { useState } from 'react';
import type { ConnectionState } from '@/types';

interface Metrics {
  fps: number;
  width: number;
  height: number;
}

interface FloatingBallProps {
  state: ConnectionState;
  hostPort?: string;
  onBack?: () => void;
  onDisconnect?: () => void;
  metrics?: Metrics;
}

const FloatingBall: React.FC<FloatingBallProps> = ({ state, hostPort, onBack, onDisconnect, metrics }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const isConnected = state === 'connected';

  const statusColor =
    state === 'connected' ? '#52c41a' :
    state === 'connecting' ? '#faad14' :
    state === 'error' ? '#ff4d4f' : '#888';

  const menuItems = [
    { key: 'status', icon: '📊', label: '状态监控', color: '#fa8c16', onClick: () => setShowMenu('status') },
    { key: 'peripheral', icon: '🔌', label: '外设管理', color: '#52c41a', onClick: () => setShowMenu('peripheral') },
    { key: 'audio', icon: '🎵', label: '音频', color: '#1890ff', onClick: () => setShowMenu('audio') },
    { key: 'remote', icon: '👥', label: '远程控制', color: '#eb2f96', onClick: () => setShowMenu('remote') },
    { key: 'ai', icon: '🤖', label: 'AI助手', color: '#4a6cf7', onClick: () => setShowMenu('ai') },
  ];

  return (
    <>
      {/* 遮罩层 - 点击外部关闭 */}
      {expanded && (
        <div onClick={() => { setExpanded(false); setShowMenu(null); }} style={{
          position: 'fixed', inset: 0, zIndex: 999, background: 'transparent',
        }} />
      )}

      {/* 悬浮球本体 - 底部中间 */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          width: 48, height: 48, borderRadius: '50%', zIndex: 1000,
          background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
          boxShadow: '0 4px 24px rgba(74,108,247,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(-50%) scale(1)'; }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: statusColor, boxShadow: `0 0 10px ${statusColor}60` }} />
      </div>

      {/* 展开面板 - 从底部升起 */}
      {expanded && (
        <div onClick={(e) => e.stopPropagation()} style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(16, 16, 30, 0.95)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14,
          zIndex: 2147483646, minWidth: 280, maxWidth: 360,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', pointerEvents: 'auto',
        }}>
          {/* 连接信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
            <span style={{ color: isConnected ? '#52c41a' : '#ccc', fontSize: 12 }}>
              {isConnected ? '已连接' : state === 'connecting' ? '连接中' : '未连接'}
            </span>
            {hostPort && <span style={{ color: '#666', fontSize: 11 }}>{hostPort}</span>}
          </div>

          {/* 功能图标 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: showMenu ? 8 : 0 }}>
            {menuItems.map(({ key, icon, label }) => (
              <div key={key} onClick={() => setShowMenu(key)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 2px', borderRadius: 6, cursor: 'pointer',
                background: showMenu === key ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ fontSize: 10, color: '#aaa' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* 子菜单 */}
          {showMenu === 'status' && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8 }}>状态监控</div>
              <StatusItem label="帧率" value={metrics ? `${metrics.fps} FPS` : '-'} />
              <StatusItem label="分辨率" value={metrics ? `${metrics.width}x${metrics.height}` : '-'} />
              <StatusItem label="延迟" value="< 5ms" />
              <StatusItem label="带宽" value="50 Mbps" />
              <StatusItem label="丢包率" value="0.1%" />
              {isConnected && (
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  {onBack && <button onClick={() => { setExpanded(false); onBack(); }} style={{ flex: 1, padding: '6px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#ccc', fontSize: 12, cursor: 'pointer' }}>← 返回</button>}
                  {onDisconnect && <button onClick={() => { setExpanded(false); onDisconnect(); }} style={{ flex: 1, padding: '6px 0', background: 'rgba(255,77,79,0.15)', border: '1px solid rgba(255,77,79,0.3)', borderRadius: 6, color: '#ff4d4f', fontSize: 12, cursor: 'pointer' }}>断开</button>}
                </div>
              )}
            </div>
          )}
          {showMenu === 'peripheral' && <UsbPanel />}
          {showMenu === 'audio' && <AudioPanel />}
          {showMenu === 'remote' && <RemotePanel />}
          {showMenu === 'ai' && <SubPanel title="AI助手" items={[{n:'知识问答'},{n:'翻译'},{n:'写作'},{n:'AI绘图'},{n:'编码大师'}]} />}
        </div>
      )}
    </>
  );
};

const StatusItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
    <span style={{ color: '#888' }}>{label}</span>
    <span style={{ color: '#ccc' }}>{value}</span>
  </div>
);

const SubPanel: React.FC<{ title: string; items: { n: string; s?: string }[] }> = ({ title, items }) => (
  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{title}</div>
    {items.map(({ n, s }) => (
      <div key={n} style={{ padding: '5px 8px', marginBottom: 2, borderRadius: 4, color: '#ccc', fontSize: 12, background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
        {n}{s ? <span style={{ float: 'right', color: '#52c41a', fontSize: 11 }}>{s}</span> : null}
      </div>
    ))}
  </div>
);

/* USB 设备面板 */
const UsbPanel: React.FC = () => {
  const [policy, setPolicy] = useState<'allow_all' | 'block_all' | 'by_device'>('by_device');
  const [redirecting, setRedirecting] = useState<Record<number, boolean>>({});
  const [devices] = useState([
    { id: 1, name: 'SanDisk USB 3.0 (64GB)', vendor: 'SanDisk', type: 'storage', allowed: true },
    { id: 2, name: 'Logitech USB 摄像头 C920', vendor: 'Logitech', type: 'camera', allowed: false },
    { id: 3, name: 'CH341 USB 串口转换器', vendor: 'WCH', type: 'serial', allowed: true },
    { id: 4, name: 'Kingston DataTraveler (32GB)', vendor: 'Kingston', type: 'storage', allowed: false },
    { id: 5, name: 'Microsoft 键盘 (USB)', vendor: 'Microsoft', type: 'hid', allowed: true },
  ]);

  const allowedDevices = devices.filter(d => d.allowed);
  const blockedDevices = devices.filter(d => !d.allowed);

  const policyStyle = (val: string) => ({
    padding: '3px 10px', fontSize: 10, borderRadius: 4, cursor: 'pointer', border: 'none',
    background: policy === val ? '#4a6cf7' : 'rgba(255,255,255,0.04)',
    color: policy === val ? '#fff' : '#999',
  });

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>USB 外设控制</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <button style={policyStyle('allow_all')} onClick={() => setPolicy('allow_all')}>全部允许</button>
        <button style={policyStyle('block_all')} onClick={() => setPolicy('block_all')}>全部禁止</button>
        <button style={policyStyle('by_device')} onClick={() => setPolicy('by_device')}>按设备</button>
      </div>
      {policy === 'allow_all' && <div style={{ color: '#52c41a', fontSize: 11, padding: 4 }}>✓ 所有 USB 设备允许重定向</div>}
      {policy === 'block_all' && <div style={{ color: '#ff4d4f', fontSize: 11, padding: 4 }}>✕ 所有 USB 设备已禁止重定向</div>}
      {policy === 'by_device' && (
        <>
          <div style={{ fontSize: 10, color: '#52c41a', marginBottom: 4 }}>允许重定向</div>
          {allowedDevices.map(d => (
            <div key={d.id} style={{ padding: '4px 8px', marginBottom: 2, borderRadius: 4, background: 'rgba(82,196,26,0.04)', border: '1px solid rgba(82,196,26,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#ccc', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                <div style={{ color: '#666', fontSize: 9 }}>{d.vendor}</div>
              </div>
              <button onClick={() => setRedirecting(r => ({...r, [d.id]: !r[d.id]}))} style={{
                padding: '2px 8px', fontSize: 10, borderRadius: 3, cursor: 'pointer',
                background: redirecting[d.id] ? 'rgba(82,196,26,0.15)' : 'rgba(82,196,26,0.1)',
                border: `1px solid ${redirecting[d.id] ? 'rgba(82,196,26,0.3)' : 'rgba(82,196,26,0.2)'}`,
                color: redirecting[d.id] ? '#52c41a' : '#888',
              }}>{redirecting[d.id] ? '已重定向' : '重定向'}</button>
            </div>
          ))}
          <div style={{ fontSize: 10, color: '#ff4d4f', marginTop: 8, marginBottom: 4 }}>禁止重定向</div>
          {blockedDevices.map(d => (
            <div key={d.id} style={{ padding: '4px 8px', marginBottom: 2, borderRadius: 4, background: 'rgba(255,77,79,0.03)', border: '1px solid rgba(255,77,79,0.08)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888', fontSize: 11 }}>{d.name}</span>
              <span style={{ color: '#ff4d4f', fontSize: 10 }}>禁止</span>
            </div>
          ))}
        </>
      )}
      <div style={{ marginTop: 4, fontSize: 9, color: '#666' }}>外设策略由管理员在安全中心配置</div>
    </div>
  );
};

/* 音频面板 */
const AudioPanel: React.FC = () => {
  const [speaker, setSpeaker] = useState('default');
  const [mic, setMic] = useState('default');
  const [muted, setMuted] = useState(false);
  const speakerDevices = [
    { id: 'default', name: '默认扬声器' },
    { id: 'spice', name: 'SPICE 音频通道' },
    { id: 'hdmi', name: 'HDMI 音频输出' },
    { id: 'bt', name: '蓝牙耳机 (FreeBuds)' },
  ];
  const micDevices = [
    { id: 'default', name: '默认麦克风' },
    { id: 'spice', name: 'SPICE 音频通道' },
    { id: 'webcam', name: '摄像头麦克风' },
    { id: 'headset', name: '耳机麦克风' },
  ];
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8 }}>音频设置</div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>🔊 扬声器</span>
          <button onClick={() => setMuted(!muted)} style={{ padding: '1px 8px', fontSize: 10, borderRadius: 3, cursor: 'pointer',
            background: muted ? 'rgba(255,77,79,0.1)' : 'rgba(82,196,26,0.1)',
            border: `1px solid ${muted ? 'rgba(255,77,79,0.2)' : 'rgba(82,196,26,0.2)'}`, color: muted ? '#ff4d4f' : '#52c41a',
          }}>{muted ? '已静音' : '正常'}</button>
        </div>
        {speakerDevices.map(d => (
          <div key={d.id} onClick={() => setSpeaker(d.id)} style={{ padding: '4px 8px', marginBottom: 2, borderRadius: 4, cursor: 'pointer', fontSize: 11,
            background: speaker === d.id ? 'rgba(74,108,247,0.12)' : 'transparent', display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ color: speaker === d.id ? '#4a6cf7' : '#bbb' }}>{d.name}</span>
            {speaker === d.id && <span style={{ color: '#4a6cf7' }}>✓</span>}
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>🎤 麦克风</div>
        {micDevices.map(d => (
          <div key={d.id} onClick={() => setMic(d.id)} style={{ padding: '4px 8px', marginBottom: 2, borderRadius: 4, cursor: 'pointer', fontSize: 11,
            background: mic === d.id ? 'rgba(74,108,247,0.12)' : 'transparent', display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ color: mic === d.id ? '#4a6cf7' : '#bbb' }}>{d.name}</span>
            {mic === d.id && <span style={{ color: '#4a6cf7' }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

/* 远程控制面板 */
const RemotePanel: React.FC = () => {
  const [sessions, setSessions] = useState([
    { id: 1, user: '管理员 (你)', host: '192.168.201.131', type: 'owner' as const, status: '当前连接' },
    { id: 2, user: 'zhangsan', host: '192.168.201.132', type: 'viewer' as const, status: '仅查看' },
    { id: 3, user: 'lisi', host: '192.168.201.133', type: 'controller' as const, status: '控制中' },
  ]);
  const endSession = (id: number) => setSessions(prev => prev.filter(s => s.id !== id));

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 8 }}>远程控制</div>
      {sessions.map(s => (
        <div key={s.id} style={{ padding: '6px 8px', marginBottom: 3, borderRadius: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontSize: 12 }}>{s.user}</div>
              <div style={{ color: '#666', fontSize: 10 }}>{s.host} · {s.type === 'owner' ? '所有者' : s.type === 'viewer' ? '观察者' : '控制者'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: s.type === 'owner' ? 'rgba(74,108,247,0.15)' : 'rgba(82,196,26,0.1)', color: s.type === 'owner' ? '#4a6cf7' : '#52c41a' }}>{s.status}</span>
              {s.type !== 'owner' && <button onClick={() => endSession(s.id)} style={{ padding: '2px 6px', fontSize: 10, background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.2)', borderRadius: 3, color: '#ff4d4f', cursor: 'pointer' }}>结束</button>}
            </div>
          </div>
        </div>
      ))}
      {sessions.filter(s => s.type !== 'owner').length === 0 && <div style={{ color: '#888', fontSize: 11, padding: '4px 0', textAlign: 'center' }}>无其他远程用户</div>}
    </div>
  );
};

export default FloatingBall;
