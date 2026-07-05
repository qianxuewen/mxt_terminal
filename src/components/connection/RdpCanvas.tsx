import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/components/common/Toast';
import { theme, inputStyle, labelStyle, cardStyle } from '@/theme';

interface RdpCanvasProps {
  host: string;
  port: number;
}

/** RDP 连接 — 外部客户端模式（仿 Windows 远程桌面） */
const RdpCanvas: React.FC<RdpCanvasProps> = ({ host, port }) => {
  const { settings } = useSettingsStore();
  const [status, setStatus] = useState('准备连接...');
  const [connected, setConnected] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [rdpUser, setRdpUser] = useState('');
  const [rdpDomain, setRdpDomain] = useState('');
  const [rdpWidth] = useState(1920);
  const [rdpHeight] = useState(1080);
  const [rdpFullscreen, setRdpFullscreen] = useState(true);
  const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;

  /** 生成 .rdp 文件内容 */
  const generateRdpFile = () => {
    return [
      `full address:s:${host}:${port}`,
      `username:s:${rdpUser || ''}`,
      `domain:s:${rdpDomain || ''}`,
      `screen mode id:i:${rdpFullscreen ? 2 : 1}`,
      `desktopwidth:i:${rdpWidth}`,
      `desktopheight:i:${rdpHeight}`,
      `session bpp:i:32`,
      `prompt for credentials:i:0`,
      `authentication level:i:2`,
      `connection type:i:2`,
      `allow desktop composition:i:1`,
      `allow font smoothing:i:1`,
      `disable wallpaper:i:0`,
      `disable full window drag:i:0`,
      `disable menu anims:i:0`,
      `disable themes:i:0`,
      `alternate shell:s:`,
      `shell working directory:s:`,
      `use multimon:i:0`,
      `redirectprinters:i:1`,
      `redirectclipboard:i:1`,
      `devicestoredirect:s:*`,
      `drivestoredirect:s:*`,
      `audiomode:i:0`,
      `camerastoredirect:s:*`,
      '', // 末尾空行
    ].join('\r\n');
  };

  const downloadRdpFile = () => {
    const content = generateRdpFile();
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${host}.rdp`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('RDP 文件已下载，请用远程桌面打开');
  };

  const launchRdp = async () => {
    setStatus('正在启动远程桌面客户端...');
    setShowConfig(false);

    if (!isTauri) {
      // 浏览器：下载 .rdp 文件
      downloadRdpFile();
      setConnected(true);
      setStatus('RDP 文件已生成');
      return;
    }

    try {
      // 生成 .rdp 文件内容
      const rdpContent = generateRdpFile();
      const { invoke } = await import('@tauri-apps/api/tauri');
      // 写入临时文件并用 mstsc.exe 打开
      const { writeTextFile, BaseDirectory } = await import('@tauri-apps/api/fs');
      const path = `${host}.rdp`;
      await writeTextFile(path, rdpContent, { dir: BaseDirectory.Temp });
      // 调用 shell 打开 mstsc
      const { open } = await import('@tauri-apps/api/shell');
      // 使用 cmd /c start mstsc 打开
      await invoke('rdp_connect', {
        host, port,
        username: rdpUser,
        domain: rdpDomain,
        width: rdpWidth,
        height: rdpHeight,
        fullscreen: rdpFullscreen,
        rdpContent,
      });
      setConnected(true);
      setStatus('RDP 客户端已启动');
      toast.success('远程桌面连接已启动');
    } catch (err: any) {
      // Tauri 命令失败时回退到下载 .rdp 文件
      downloadRdpFile();
      setConnected(true);
      setStatus('RDP 文件已生成');
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a14' }}>
      {showConfig ? (
        /* 连接前配置界面（仿 Windows RDP） */
        <div style={{ ...cardStyle, width: 420, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🖥</div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: theme.textPrimary }}>远程桌面连接</h2>
            <p style={{ margin: 0, color: theme.textTertiary, fontSize: 13 }}>{host}:{port}</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>用户名</label>
            <input style={inputStyle} value={rdpUser} onChange={(e) => setRdpUser(e.target.value)} placeholder="留空则在 RDP 客户端中输入" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>域（可选）</label>
            <input style={inputStyle} value={rdpDomain} onChange={(e) => setRdpDomain(e.target.value)} placeholder="域名" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: theme.textSecondary, fontSize: 14 }}>
              <input type="checkbox" checked={rdpFullscreen} onChange={(e) => setRdpFullscreen(e.target.checked)} style={{ accentColor: theme.primary }} />
              全屏显示
            </label>
          </div>

          <button onClick={launchRdp} style={{ width: '100%', padding: '12px', background: theme.gradientPrimary, border: 'none', borderRadius: 8, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            🪟 连接
          </button>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <span style={{ color: theme.textTertiary, fontSize: 11 }}>将启动系统远程桌面客户端（mstsc.exe）</span>
          </div>
        </div>
      ) : (
        /* 连接后状态 */
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🪟</div>
          <div style={{ color: '#52c41a', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>远程桌面连接已启动</div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{host}:{port}</div>
          {!isTauri && (
            <div style={{ color: theme.textTertiary, fontSize: 12, marginTop: 8 }}>
              请打开下载的 .rdp 文件进行连接
            </div>
          )}
          <div style={{ color: theme.textTertiary, fontSize: 12 }}>可在悬浮球中管理连接</div>
        </div>
      )}
    </div>
  );
};

export default RdpCanvas;
