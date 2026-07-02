import React, { useState, useRef, useCallback } from 'react';

interface MenuItem {
  key: string;
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}

/**
 * 悬浮球（云电脑助理）- 核心交互入口
 * 包括: AI助手、外设管理、文件传输、剪切板、远程协助、共享协同、投屏、状态监控
 */
const FloatingBall: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = [
    { key: 'ai', icon: '🤖', label: 'AI助手', color: '#4a6cf7', onClick: () => setShowMenu('ai') },
    { key: 'peripheral', icon: '🔌', label: '外设管理', color: '#52c41a', onClick: () => setShowMenu('peripheral') },
    { key: 'file', icon: '📁', label: '文件传输', color: '#faad14', onClick: () => setShowMenu('file') },
    { key: 'clipboard', icon: '📋', label: '剪切板', color: '#1890ff', onClick: () => setShowMenu('clipboard') },
    { key: 'assist', icon: '👥', label: '远程协助', color: '#eb2f96', onClick: () => setShowMenu('assist') },
    { key: 'share', icon: '🔄', label: '共享协同', color: '#722ed1', onClick: () => setShowMenu('share') },
    { key: 'screen', icon: '📺', label: '投屏', color: '#13c2c2', onClick: () => setShowMenu('screen') },
    { key: 'status', icon: '📊', label: '状态监控', color: '#fa8c16', onClick: () => setShowMenu('status') },
  ];

  const toggleBall = useCallback(() => {
    setExpanded(!expanded);
    setShowMenu(null);
  }, [expanded]);

  // Submenu content
  const renderSubMenu = () => {
    switch (showMenu) {
      case 'ai':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>AI 助手</div>
            {['知识问答', '翻译', '写作', 'AI绘图', '编码大师'].map((item) => (
              <div key={item}
                style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}
                onClick={() => setShowMenu(null)}
              >
                {item}
              </div>
            ))}
          </div>
        );
      case 'peripheral':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>外设管理</div>
            {[
              { name: 'USB设备', status: '已连接 2个' },
              { name: '打印机', status: '已映射 1台' },
              { name: '摄像头', status: '未连接' },
              { name: '麦克风', status: '已重定向' },
            ].map(({ name, status }) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>
                <span>{name}</span>
                <span style={{ color: status.includes('已') ? '#52c41a' : '#888', fontSize: 12 }}>{status}</span>
              </div>
            ))}
          </div>
        );
      case 'file':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>文件传输</div>
            <div style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>上传文件</div>
            <div style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>下载文件</div>
            <div style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>传输队列</div>
            <div style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>全速模式</div>
          </div>
        );
      case 'clipboard':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>剪切板管理</div>
            <div style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, background: 'rgba(255,255,255,0.03)', color: '#888', fontSize: 12 }}>
              剪切板管控策略：本地→远程 双向允许
            </div>
            <div style={{ padding: '8px 12px', marginBottom: 4, borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>📄 文本内容已同步</div>
            <div style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer', color: '#ccc', fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>🖼️ 图片内容已同步</div>
          </div>
        );
      case 'assist':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>远程协助</div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>向管理员发起协助请求</p>
            <button style={{ width: '100%', padding: '8px', background: '#4a6cf7', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              发起协助请求
            </button>
          </div>
        );
      case 'share':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>共享协同</div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>邀请其他用户共同操作此桌面</p>
            <button style={{ width: '100%', padding: '8px', background: '#722ed1', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              创建共享会话
            </button>
          </div>
        );
      case 'screen':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>投屏</div>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>将桌面画面投屏至会议屏</p>
            <select style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#ccc', fontSize: 13, marginBottom: 8 }}>
              <option>选择投屏设备</option>
              <option>会议室-大屏</option>
              <option>会议室-投影</option>
            </select>
            <button style={{ width: '100%', padding: '8px', background: '#13c2c2', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              开始投屏
            </button>
          </div>
        );
      case 'status':
        return (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>状态监控</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StatusItem label="CPU 负载" value="23%" />
              <StatusItem label="内存使用" value="45%" />
              <StatusItem label="网络延迟" value="15ms" />
              <StatusItem label="帧率" value="55 FPS" />
              <StatusItem label="带宽" value="35 Mbps" />
              <StatusItem label="丢包率" value="0.1%" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Ball */}
      <div
        ref={ballRef}
        onClick={toggleBall}
        style={{
          position: 'fixed',
          right: 24,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
          boxShadow: '0 4px 20px rgba(74,108,247,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
      >
        <span style={{ fontSize: 24, transition: 'transform 0.3s', transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          {expanded ? '✕' : '✦'}
        </span>
      </div>

      {/* Menu Panel */}
      {expanded && (
        <div
          style={{
            position: 'fixed',
            right: 92,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(16, 16, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 16,
            zIndex: 1000,
            minWidth: 200,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Quick action icons row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: showMenu ? 12 : 0 }}>
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={() => setShowMenu(item.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
                  background: showMenu === item.key ? 'rgba(255,255,255,0.06)' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = showMenu === item.key ? 'rgba(255,255,255,0.06)' : 'transparent'; }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: '#aaa', textAlign: 'center', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Sub-menu content */}
          {showMenu && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 12,
              minHeight: 120,
            }}>
              {renderSubMenu()}
            </div>
          )}
        </div>
      )}
    </>
  );
};

const StatusItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
    <span style={{ color: '#888' }}>{label}</span>
    <span style={{ color: '#52c41a', fontWeight: 600 }}>{value}</span>
  </div>
);

export default FloatingBall;
