import React from 'react';

const About: React.FC = () => {
  return (
    <div style={{ maxWidth: 700 }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#fff' }}>关于此终端</h2>

      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 24 }}>
        <div style={{
          width: 80, height: 80, margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)',
          borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, boxShadow: '0 12px 40px rgba(74,108,247,0.3)',
        }}>
          ☁
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#fff' }}>云终端</h1>
        <p style={{ margin: '0 0 4px', color: '#888', fontSize: 14 }}>Cloud Terminal Client</p>
        <p style={{ margin: '0', color: '#666', fontSize: 13 }}>版本 1.0.0</p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>功能特色</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '🖥', label: '云桌面管理', desc: '开机/关机/重启/休眠' },
            { icon: '🔗', label: 'SPICE 协议', desc: '高性能远程桌面协议' },
            { icon: '🤖', label: 'AI 助手', desc: '千问大模型驱动' },
            { icon: '📁', label: '文件传输', desc: '双向传输，拖拽上传' },
            { icon: '🔌', label: '外设支持', desc: 'USB/打印机/摄像头' },
            { icon: '🔒', label: '安全保障', desc: '水印/加密/录屏审计' },
            { icon: '📺', label: '投屏协作', desc: '投屏/远程协助/共享' },
            { icon: '🔄', label: '跨平台', desc: 'Linux/Windows/Web' },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{label}</div>
                <div style={{ color: '#888', fontSize: 12 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#fff' }}>技术栈</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            'React 18', 'TypeScript', 'Vite', 'Zustand', 'SPICE Protocol',
            'Tauri', 'WebSocket', 'CSS-in-JS',
          ].map((tech) => (
            <span key={tech} style={{
              padding: '4px 14px', background: 'rgba(74,108,247,0.1)',
              border: '1px solid rgba(74,108,247,0.2)', borderRadius: 20,
              color: '#4a6cf7', fontSize: 13,
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, color: '#666', fontSize: 12, lineHeight: 1.8 }}>
        <p>Copyright © 2025 Cloud Terminal. All rights reserved.</p>
        <p>参考阿里无影云电脑系统设计实现</p>
      </div>
    </div>
  );
};

export default About;
