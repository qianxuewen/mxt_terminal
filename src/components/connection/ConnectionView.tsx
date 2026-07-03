import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnectionStore } from '@/store/connectionStore';
import Watermark from '@/components/common/Watermark';
import SpiceCanvas from '@/components/connection/SpiceCanvas';
import FloatingBall from '@/components/floating-ball/FloatingBall';
import { toast } from '@/components/common/Toast';

type ViewPage = 'overview' | 'quality' | 'peripherals' | 'files';

const ConnectionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connect, disconnect, connections, setQuality } = useConnectionStore();
  const connection = id ? connections[id] : null;

  const [page, setPage] = useState<ViewPage>('overview');
  const [metrics, setMetrics] = useState({ fps: 0, width: 0, height: 0 });

  useEffect(() => {
    if (id) connect(id);
    return () => { if (id) disconnect(id); };
  }, [id]);

  const handleBack = () => { navigate('/'); };
  const handleDisconnect = async () => {
    if (id) {
      await disconnect(id);
      toast.info('已断开连接');
      navigate('/');
    }
  };

  if (!connection) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
        连接信息未找到
      </div>
    );
  }

  const state = connection.state;
  const isConnected = state === 'connected';

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return <SpiceCanvas host={connection.spiceConfig.host} port={connection.spiceConfig.port} onMetrics={setMetrics} />;

      case 'quality': {
        const q = connection.displaySettings.quality;
        return (
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#fff' }}>画质设置</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { key: 'low', label: '流畅', desc: '降低画质保证操作流畅', bw: '2 Mbps' },
                { key: 'medium', label: '均衡', desc: '平衡画质与性能', bw: '5 Mbps' },
                { key: 'high', label: '高清', desc: '高清画质体验', bw: '10 Mbps' },
                { key: 'lossless', label: '无损', desc: '无损画质专业场景', bw: '50 Mbps' },
              ].map((item) => {
                const active = q === item.key;
                return (
                  <div key={item.key} onClick={() => id && setQuality(id, item.key as any)}
                    style={{
                      padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                      background: active ? 'rgba(74,108,247,0.2)' : 'rgba(255,255,255,0.03)',
                      border: active ? '1px solid rgba(74,108,247,0.4)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: active ? '#4a6cf7' : '#fff', fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                      <span style={{ color: '#888', fontSize: 12 }}>{item.bw}</span>
                    </div>
                    <div style={{ color: '#888', fontSize: 12 }}>{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'peripherals':
        return (
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#fff' }}>外设管理</h3>
            {[
              { name: 'USB 设备', status: '已连接 2 个', color: '#52c41a' },
              { name: '打印机', status: '已映射 1 台', color: '#52c41a' },
              { name: '摄像头', status: '未连接', color: '#888' },
              { name: '麦克风', status: '已重定向', color: '#52c41a' },
            ].map(({ name, status, color }) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', marginBottom: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <span style={{ color: '#ccc', fontSize: 14 }}>{name}</span>
                <span style={{ color, fontSize: 13 }}>{status}</span>
              </div>
            ))}
          </div>
        );

      case 'files':
        return (
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#fff' }}>文件传输</h3>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 12 }}>
              <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>
                拖拽文件到此处上传<br /><span style={{ fontSize: 12 }}>或点击选择文件</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#0a0a14' }}>
      {/* 极简顶栏 - 只保留页面切换标签 */}
      {isConnected && (
        <div style={{ display: 'flex', gap: 2, padding: '6px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(8px)', zIndex: 50 }}>
          {([['overview', '概览'], ['quality', '画质'], ['peripherals', '外设'], ['files', '文件']] as [ViewPage, string][]).map(([k, lb]) => (
            <button key={k} onClick={() => setPage(k)} style={{
              padding: '6px 16px', background: 'none', border: 'none',
              borderBottom: `2px solid ${page === k ? '#4a6cf7' : 'transparent'}`,
              color: page === k ? '#4a6cf7' : '#888', fontSize: 13, cursor: 'pointer',
            }}>{lb}</button>
          ))}
        </div>
      )}

      <div style={{
        flex: 1, overflow: 'hidden',
        padding: page === 'overview' ? 0 : 32,
        maxWidth: page === 'overview' ? '100%' : 900,
        margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column',
      }}>
        {renderPage()}
      </div>

      <Watermark config={{
        enabled: true, type: 'text', content: '云终端 - Cloud Terminal',
        style: 'dark', opacity: 0.06, fontSize: 14, fontColor: '#ffffff',
        rotation: -30, density: 10, dynamic: true, userName: '管理员',
        timestamp: new Date().toISOString(),
      }} />
      <FloatingBall
        state={state}
        hostPort={`${connection.spiceConfig.host}:${connection.spiceConfig.port}`}
        onBack={handleBack}
        onDisconnect={handleDisconnect}
        metrics={metrics}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ConnectionView;
