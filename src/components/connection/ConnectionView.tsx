import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConnectionStore } from '@/store/connectionStore';
import { useSettingsStore } from '@/store/settingsStore';
import Watermark from '@/components/common/Watermark';
import SpiceCanvas from '@/components/connection/SpiceCanvas';
import FloatingBall from '@/components/floating-ball/FloatingBall';
import { toast } from '@/components/common/Toast';
import { theme } from '@/theme';

/** 进入全屏 */
const enterFullscreen = async () => {
  try {
    // Tauri 原生全屏
    try {
      const { appWindow } = await import('@tauri-apps/api/window');
      await appWindow.setFullscreen(true);
      return;
    } catch {}
    // 浏览器 Fullscreen API
    const el = document.getElementById('root') || document.documentElement;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if ((el as any).webkitRequestFullscreen) {
      await (el as any).webkitRequestFullscreen();
    }
  } catch (e) {
    console.warn('全屏失败:', e);
  }
};

/** 退出全屏 */
const exitFullscreen = async () => {
  try {
    try {
      const { appWindow } = await import('@tauri-apps/api/window');
      await appWindow.setFullscreen(false);
      return;
    } catch {}
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch {}
};

type ViewPage = 'overview' | 'quality' | 'peripherals' | 'files';

const ConnectionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { connect, disconnect, connections, setQuality } = useConnectionStore();
  const { settings } = useSettingsStore();
  const connection = id ? connections[id] : null;

  const [metrics, setMetrics] = useState({ fps: 0, width: 0, height: 0 });

  const state = connection ? connection.state : 'disconnected';
  const isConnected = state === 'connected';

  useEffect(() => {
    if (id) connect(id);
    return () => {
      exitFullscreen();
      if (id) disconnect(id);
    };
  }, [id]);

  // 全屏模式
  useEffect(() => {
    if (isConnected && settings.display.defaultMode === 'fullscreen') {
      enterFullscreen();
    }
    return () => { exitFullscreen(); };
  }, [isConnected]);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: theme.textTertiary }}>
        连接信息未找到
      </div>
    );
  }

  const renderPage = () => (
    <SpiceCanvas host={connection.spiceConfig.host} port={connection.spiceConfig.port} onMetrics={setMetrics} />
  );

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#0F1219' }}>
      {/* 极简顶栏 - 只保留全屏和退出 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 16px', minHeight: 36, position: 'absolute', top: 0, right: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {isConnected && (
            <button onClick={enterFullscreen} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'rgba(255,255,255,0.6)', fontSize: 11, cursor: 'pointer' }}>
              ⛶ 全屏
            </button>
          )}
          <button onClick={handleDisconnect} style={{ padding: '4px 12px', background: 'rgba(255,77,79,0.12)', border: '1px solid rgba(255,77,79,0.2)', borderRadius: 4, color: '#FF4D4F', fontSize: 11, cursor: 'pointer' }}>
            ✕ 退出
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderPage()}
      </div>

      <Watermark config={{
        enabled: true, type: 'text', content: 'TP-LINK Cloud Terminal',
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
