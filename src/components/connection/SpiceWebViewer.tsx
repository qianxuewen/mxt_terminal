import React, { useRef, useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/common/Toast';

interface SpiceWebViewerProps {
  host: string;
  port: number;
  /** WebSocket 代理地址 (可选) */
  wsProxy?: string;
}

type ViewerStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * 嵌入式 SPICE 查看器
 *
 * 在浏览器中通过 WebSocket 代理连接 SPICE 服务器。
 * 需要 WebSocket 代理（如 websockify）将 WS 转为 TCP。
 *
 * 架构: Browser → WebSocket → websockify → SPICE Server(:5900)
 *
 * 快速启动 WebSocket 代理（需要 Python）:
 *   pip install websockify
 *   websockify --web . 5901 192.168.201.131:5900
 *
 * 然后浏览器连接 ws://localhost:5901
 */
const SpiceWebViewer: React.FC<SpiceWebViewerProps> = ({ host, port, wsProxy }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ViewerStatus>('disconnected');
  const [wsUrl, setWsUrl] = useState(wsProxy || `ws://localhost:5901`);
  const [showSetup, setShowSetup] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 768 });

  // WebSocket 连接
  const connectWS = useCallback(() => {
    if (!wsUrl) return;

    setStatus('connecting');
    setShowSetup(false);

    try {
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setStatus('connected');
        toast.success('SPICE 查看器已连接');
      };

      ws.onmessage = (evt) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (evt.data instanceof ArrayBuffer) {
          // 将收到的 SPICE 帧数据渲染到 canvas
          const blob = new Blob([evt.data]);
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0);
            setDimensions({ width: img.width, height: img.height });
          };
          img.src = URL.createObjectURL(blob);
        } else if (typeof evt.data === 'string') {
          // 文本消息（协议控制）
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'resolution') {
              setDimensions({ width: msg.width, height: msg.height });
            }
          } catch {}
        }
      };

      ws.onerror = () => {
        setStatus('error');
        toast.error('WebSocket 连接失败');
      };

      ws.onclose = () => {
        setStatus('disconnected');
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      };

      wsRef.current = ws;
    } catch (err: any) {
      setStatus('error');
      toast.error('WebSocket 创建失败: ' + err.message);
    }
  }, [wsUrl]);

  // 断开连接
  const disconnectWS = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  // 键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'keydown', key: e.key, code: e.code, ctrl: e.ctrlKey, alt: e.altKey, shift: e.shiftKey }));
      e.preventDefault();
    }
  }, []);

  // 鼠标事件
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        wsRef.current.send(JSON.stringify({
          type: 'mousemove', x: e.clientX - rect.left, y: e.clientY - rect.top,
          buttons: e.buttons,
        }));
      }
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mousedown', button: e.button }));
    }
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'mouseup', button: e.button }));
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'wheel', deltaY: e.deltaY }));
    }
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // ---- 设置界面 (未连接时显示) ----
  if (showSetup) {
    return (
      <div style={{ marginTop: 16, textAlign: 'left' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#fff' }}>
            🖥️ 嵌入式 SPICE 查看器
          </h3>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
            直接在浏览器中查看远程桌面。需要 WebSocket 代理将 SPICE 协议转为 WebSocket。
          </p>

          {/* WebSocket 地址输入 */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: '#a0a0b8', marginBottom: 6, display: 'block' }}>
              WebSocket 代理地址
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:5901"
                style={{
                  flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff',
                  fontSize: 14, outline: 'none',
                }}
              />
              <button onClick={connectWS} disabled={status === 'connecting'}
                style={{ padding: '10px 20px', background: status === 'connecting' ? 'rgba(74,108,247,0.5)' : 'linear-gradient(135deg, #4a6cf7, #6a3de8)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {status === 'connecting' ? '连接中...' : '连接'}
              </button>
            </div>
          </div>

          {/* 设置说明 */}
          <details style={{ marginTop: 12 }}>
            <summary style={{ color: '#4a6cf7', fontSize: 13, cursor: 'pointer' }}>
              如何启动 WebSocket 代理？
            </summary>
            <div style={{ marginTop: 8, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, color: '#ccc', fontSize: 12, lineHeight: 1.8 }}>
              <div>1. 安装 websockify: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 3 }}>pip install websockify</code></div>
              <div>2. 启动代理: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 3 }}>websockify 5901 {host}:{port}</code></div>
              <div>3. 点击"连接"按钮</div>
              <div style={{ marginTop: 4, color: '#888' }}>
                或在 Tauri 桌面模式下使用，会自动拉起 remote-viewer.exe。
              </div>
            </div>
          </details>

          {/* 备用：手动连接按钮 */}
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>也用 SPICE 客户端手动连接：</div>
            <div style={{ fontFamily: 'monospace', color: '#52c41a', fontSize: 13, wordBreak: 'break-all', marginBottom: 8, userSelect: 'all' }}>
              remote-viewer.exe spice://{host}:{port}/
            </div>
            <button onClick={() => {
              navigator.clipboard.writeText(`remote-viewer.exe spice://${host}:${port}/`);
              toast.success('命令已复制');
            }} style={{ padding: '6px 16px', background: 'rgba(74,108,247,0.15)', border: '1px solid rgba(74,108,247,0.3)', borderRadius: 6, color: '#4a6cf7', fontSize: 12, cursor: 'pointer' }}>
              📋 复制命令
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- 查看器界面 ----
  return (
    <div style={{ marginTop: 12 }}>
      {/* 状态栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: status === 'connected' ? '#52c41a' : status === 'connecting' ? '#faad14' : '#ff4d4f',
            display: 'inline-block',
          }} />
          <span style={{ color: '#ccc', fontSize: 12 }}>
            {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中...' : '未连接'}
          </span>
          {dimensions && (
            <span style={{ color: '#666', fontSize: 11 }}>{dimensions.width}x{dimensions.height}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setShowSetup(true)} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: '#999', fontSize: 11, cursor: 'pointer' }}>设置</button>
          {status === 'connected' ? (
            <button onClick={disconnectWS} style={{ padding: '4px 10px', background: 'rgba(255,77,79,0.1)', border: '1px solid rgba(255,77,79,0.2)', borderRadius: 4, color: '#ff4d4f', fontSize: 11, cursor: 'pointer' }}>断开</button>
          ) : (
            <button onClick={connectWS} style={{ padding: '4px 10px', background: 'rgba(74,108,247,0.15)', border: '1px solid rgba(74,108,247,0.3)', borderRadius: 4, color: '#4a6cf7', fontSize: 11, cursor: 'pointer' }}>连接</button>
          )}
        </div>
      </div>

      {/* Canvas 画布 */}
      <div style={{ position: 'relative', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden', background: '#111' }}>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{
            width: '100%',
            aspectRatio: '16/9',
            cursor: 'crosshair',
            outline: 'none',
            display: 'block',
          }}
        />
        {status === 'disconnected' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
            <button onClick={connectWS} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #4a6cf7, #6a3de8)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>
              连接到 SPICE 查看器
            </button>
          </div>
        )}
      </div>

      {/* 操作提示 */}
      {status === 'connected' && (
        <div style={{ marginTop: 8, color: '#666', fontSize: 11, textAlign: 'center' }}>
          点击 canvas 后可使用键盘/鼠标操作远程桌面 · 滚轮缩放
        </div>
      )}
    </div>
  );
};

export default SpiceWebViewer;
