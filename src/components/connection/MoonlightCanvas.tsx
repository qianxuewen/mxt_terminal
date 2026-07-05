import React, { useEffect, useState } from 'react';

interface MoonlightCanvasProps {
  host: string;
  port: number;
  serverId: string;
  appName: string;
  bitrate?: number;
  fps?: number;
  onMetrics?: (m: { fps: number; bitrate: number }) => void;
}

/** Moonlight 游戏串流画布 */
const MoonlightCanvas: React.FC<MoonlightCanvasProps> = ({ host, port, serverId, appName, bitrate = 20000, fps = 60, onMetrics }) => {
  const [status, setStatus] = useState('准备连接...');
  const [connected, setConnected] = useState(false);
  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;

  useEffect(() => {
    if (!isTauri) {
      setStatus('Moonlight 需要 Tauri 桌面环境');
      return;
    }
    if (!serverId) {
      setStatus('未配置服务器 ID');
      return;
    }
    const connect = async () => {
      setStatus('正在连接 Moonlight...');
      try {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('moonlight_start', { serverId, appName, bitrate, fps });
        setConnected(true);
        setStatus(`🎮 ${appName}`);
      } catch (err: any) {
        setStatus(`连接失败: ${err.message}`);
      }
    };
    connect();
  }, [host, serverId, appName]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', background: '#0a0a14' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '4px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: 4, fontSize: 11, color: connected ? '#52c41a' : '#aaa' }}>
        {connected ? `🎮 ${appName} - ${fps}FPS` : status}
      </div>
      {!connected && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <span style={{ color: '#888', fontSize: 13 }}>{status}</span>
        </div>
      )}
      {connected && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 14 }}>
          🎮 Moonlight 串流中 - {host}:{port} · {appName} · {bitrate}kbps
        </div>
      )}
    </div>
  );
};

export default MoonlightCanvas;
