import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/common/Toast';

interface SpiceCanvasProps {
  host: string; port: number;
  /** 每秒上报一次指标 (FPS/分辨率) */
  onMetrics?: (m: { fps: number; width: number; height: number }) => void;
}

type BridgeMsg =
  | { type: 'frame'; data: { w: number; h: number; rgba: string } }
  | { type: 'status'; data: { message: string } }
  | { type: 'ready' };

let invokeFn: any = null;
let listenFn: any = null;

async function ensureTauri() {
  if (invokeFn) return true;
  const w = window as any;
  if (w.__TAURI__?.invoke) { invokeFn = w.__TAURI__.invoke; listenFn = w.__TAURI__.event?.listen; return true; }
  try {
    const mod = await import(/* @vite-ignore */ '@tauri-apps/api/tauri');
    if (mod?.invoke) { invokeFn = mod.invoke; const evt = await import(/* @vite-ignore */ '@tauri-apps/api/event'); listenFn = evt?.listen; return true; }
  } catch {}
  return false;
}
async function tauriCmd(cmd: string, args?: any) { if (!await ensureTauri()) throw new Error('Tauri API 不可用'); return invokeFn(cmd, args || {}); }
async function tauriListen(event: string, cb: (data: any) => void) {
  if (await ensureTauri() && listenFn) return listenFn(event, (e: any) => cb(e.payload !== undefined ? e : { payload: e }));
  const handler = (e: any) => cb(e.detail || e); window.addEventListener(event, handler);
  return () => window.removeEventListener(event, handler);
}

const SpiceCanvas: React.FC<SpiceCanvasProps> = ({ host, port, onMetrics }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connected, setConnected] = useState(false);
  const [statusMsg, setStatusMsg] = useState('准备连接...');
  const [fps, setFps] = useState(0);
  const [dim, setDim] = useState({ w: 0, h: 0 });
  const cleanupsRef = useRef<Array<() => void>>([]);
  const autoStartedRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

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

  const startConnection = useCallback(async () => {
    setStatusMsg('正在连接 SPICE 服务器...');
    try {
      await tauriCmd('connect_spice', { host, port, password: null });
      const unlisten = await tauriListen('spice-bridge', (event: any) => {
        let msg: BridgeMsg;
        if (typeof event.payload === 'string') msg = JSON.parse(event.payload);
        else if (typeof event === 'object' && (event as any).type) msg = event as any;
        else return;
        switch (msg.type) {
          case 'frame': renderFrame(msg.data.w, msg.data.h, msg.data.rgba); break;
          case 'status': setStatusMsg(msg.data.message); if (msg.data.message.includes('display') || msg.data.message.includes('ready')) setConnected(true); break;
          case 'ready': setStatusMsg('桥接就绪，正在连接 SPICE...'); break;
        }
      });
      cleanupsRef.current.push(unlisten);
      setConnected(true);
      setStatusMsg('已连接');
    } catch (err: any) {
      const msg = err?.message || String(err);
      setStatusMsg(`连接失败: ${msg}`);
      toast.error(`SPICE 连接失败: ${msg}`);
    }
  }, [host, port, renderFrame]);

  const disconnect = useCallback(async () => {
    try { await tauriCmd('disconnect_spice'); } catch {}
    cleanupsRef.current.forEach(fn => fn()); cleanupsRef.current = [];
    setConnected(false); setStatusMsg('已断开');
  }, []);

  // 挂载即自动连接 (只连一次, 不自动断开)
  useEffect(() => { if (!autoStartedRef.current) { autoStartedRef.current = true; startConnection(); } }, []);

  const sendInput = useCallback(async (type: string, data: any) => {
    if (!connected) return;
    try { await tauriCmd('send_spice_input', { eventType: type, data: JSON.stringify(data) }); } catch {}
  }, [connected]);

  const evt = {
    onKeyDown: (e: React.KeyboardEvent) => { e.preventDefault(); sendInput('keydown', { key: e.key, code: e.code, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey }); },
    onKeyUp: (e: React.KeyboardEvent) => { e.preventDefault(); sendInput('keyup', { key: e.key, code: e.code }); },
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) sendInput('mousemove', { x: e.clientX - rect.left, y: e.clientY - rect.top, buttons: e.buttons });
    },
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => sendInput('mousedown', { button: e.button }),
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => sendInput('mouseup', { button: e.button }),
    onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => sendInput('wheel', { deltaY: e.deltaY }),
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', background: '#0a0a14' }}>
      {/* 状态浮标 */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '4px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: 4, fontSize: 11, color: connected ? '#52c41a' : '#aaa', pointerEvents: 'none' }}>
        {connected ? `● ${fps}FPS` : statusMsg}
      </div>

      {/* Canvas 铺满 */}
      <canvas ref={canvasRef} tabIndex={0} {...evt} style={{ flex: 1, width: '100%', cursor: connected ? 'crosshair' : 'default', outline: 'none', display: 'block' }} />

      {/* 未连接遮罩 (仅状态, 无按钮) */}
      {!connected && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <span style={{ color: '#888', fontSize: 13 }}>{statusMsg}</span>
        </div>
      )}
    </div>
  );
};

export default SpiceCanvas;
