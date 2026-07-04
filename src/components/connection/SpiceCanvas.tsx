import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/common/Toast';

interface SpiceCanvasProps {
  host: string; port: number;
  onMetrics?: (m: { fps: number; width: number; height: number }) => void;
}

/** 统一 SPICE 画布：Tauri 下用原生桥接，浏览器下用 WebSocket */
const SpiceCanvas: React.FC<SpiceCanvasProps> = ({ host, port, onMetrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('准备连接...');
  const [fps, setFps] = useState(0);
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const cleanupsRef = useRef<Array<() => void>>([]);
  const autoStartedRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;

  const renderFrame = useCallback((w: number, h: number, b64: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const bin = atob(b64);
      const rgba = new Uint8ClampedArray(bin.length);
      for (let i = 0; i < bin.length; i++) rgba[i] = bin.charCodeAt(i);
      canvas.width = w; canvas.height = h;
      ctx.putImageData(new ImageData(rgba, w, h), 0, 0);
    } catch {}
    frameCountRef.current++;
    const now = Date.now();
    if (now - lastTimeRef.current >= 1000) {
      const currentFps = frameCountRef.current;
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      setFps(currentFps);
      setDim({ w, h });
      onMetrics?.({ fps: currentFps, width: w, height: h });
    }
  }, [onMetrics]);

  // Tauri 原生连接
  const startTauriConnection = useCallback(async () => {
    try {
      const { invoke } = await import('@tauri-apps/api/tauri');
      const { listen } = await import('@tauri-apps/api/event');
      await invoke('connect_spice', { host, port, password: null });
      const unlisten = await listen('spice-bridge', (event: any) => {
        let payload = typeof event.payload === 'string' ? event.payload : event;
        let msg: any;
        try { msg = typeof payload === 'string' ? JSON.parse(payload) : payload; } catch { return; }
        switch (msg.type) {
          case 'frame': renderFrame(msg.data.w, msg.data.h, msg.data.rgba); break;
          case 'status': setStatusMsg(msg.data.message); if (msg.data.message?.includes('display') || msg.data.message?.includes('ready')) setConnected(true); break;
          case 'ready': setStatusMsg('桥接就绪...'); break;
        }
      });
      cleanupsRef.current.push(unlisten);
      setConnected(true);
      setStatusMsg('已连接');
    } catch (err: any) {
      throw new Error(err?.message || String(err));
    }
  }, [host, port, renderFrame]);

  // WebSocket 连接（浏览器模式）
  const startWsConnection = useCallback(() => {
    const wsUrl = `ws://${host}:${port}`;
    setStatusMsg('正在连接 WebSocket...');
    try {
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      ws.onopen = () => { setConnected(true); setStatusMsg('已连接'); };
      ws.onmessage = (evt) => {
        if (evt.data instanceof ArrayBuffer) {
          const blob = new Blob([evt.data]);
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0);
            frameCountRef.current++;
            const now = Date.now();
            if (now - lastTimeRef.current >= 1000) {
              const currentFps = frameCountRef.current;
              frameCountRef.current = 0;
              lastTimeRef.current = now;
              setFps(currentFps); setDim({ w: img.width, h: img.height });
              onMetrics?.({ fps: currentFps, width: img.width, height: img.height });
            }
          };
          img.src = URL.createObjectURL(blob);
        } else if (typeof evt.data === 'string') {
          try { const msg = JSON.parse(evt.data); if (msg.type === 'resolution' && msg.width) setDim({ w: msg.width, h: msg.height }); } catch {}
        }
      };
      ws.onerror = () => { setStatusMsg('连接失败'); toast.error('WebSocket 连接失败'); };
      ws.onclose = () => { setStatusMsg('已断开'); setConnected(false); };
      wsRef.current = ws;
    } catch (err: any) {
      setStatusMsg(`连接失败: ${err.message}`);
      toast.error(`WebSocket 创建失败: ${err.message}`);
    }
  }, [host, port, onMetrics]);

  const startConnection = useCallback(async () => {
    if (isTauri) {
      await startTauriConnection();
    } else {
      startWsConnection();
    }
  }, [isTauri, startTauriConnection, startWsConnection]);

  const disconnect = useCallback(() => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    cleanupsRef.current.forEach(fn => fn()); cleanupsRef.current = [];
    setConnected(false); setStatusMsg('已断开');
  }, []);

  useEffect(() => {
    if (!autoStartedRef.current) { autoStartedRef.current = true; startConnection(); }
    return () => disconnect();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', background: '#0a0a14' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '4px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: 4, fontSize: 11, color: connected ? '#52c41a' : '#aaa', pointerEvents: 'none' }}>
        {connected ? `● ${fps}FPS` : statusMsg}
      </div>
      <canvas ref={canvasRef} tabIndex={0} style={{ flex: 1, width: '100%', cursor: connected ? 'crosshair' : 'default', outline: 'none', display: 'block' }} />
      {!connected && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <span style={{ color: '#888', fontSize: 13 }}>{statusMsg}</span>
        </div>
      )}
    </div>
  );
};

export default SpiceCanvas;
