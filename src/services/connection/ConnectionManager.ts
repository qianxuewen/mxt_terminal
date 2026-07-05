/**
 * 多协议连接管理器
 */
import type { ProtocolType, ConnectionConfig } from '@/types/protocol';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

type StateCallback = (state: ConnectionState, msg: string) => void;

class ProtocolConnectionManager {
  private state: ConnectionState = 'disconnected';
  private wsRef: WebSocket | null = null;
  private eventListeners: StateCallback[] = [];
  private currentProtocol: ProtocolType | null = null;
  private abortController: AbortController | null = null;

  onStateChange(cb: StateCallback) {
    this.eventListeners.push(cb);
    return () => { this.eventListeners = this.eventListeners.filter(l => l !== cb); };
  }

  private emit(state: ConnectionState, msg: string) {
    this.state = state;
    this.eventListeners.forEach(l => l(state, msg));
  }

  getState() { return this.state; }

  async connect(config: ConnectionConfig): Promise<void> {
    this.currentProtocol = config.protocol;
    this.abortController = new AbortController();
    this.emit('connecting', `正在连接 ${config.host}...`);

    try {
      switch (config.protocol) {
        case 'spice':  return await this.connectSpice(config);
        case 'rdp':    return await this.connectRdp(config);
        case 'moonlight': return await this.connectMoonlight(config);
      }
    } catch (err: any) {
      this.emit('error', err?.message || '连接失败');
      throw err;
    }
  }

  disconnect() {
    if (this.wsRef) { this.wsRef.close(); this.wsRef = null; }
    if (this.abortController) { this.abortController.abort(); this.abortController = null; }
    this.currentProtocol = null;
    this.emit('disconnected', '已断开');
  }

  // ── SPICE ──
  private async connectSpice(config: ConnectionConfig) {
    const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const { listen } = await import('@tauri-apps/api/event');
        await invoke('connect_spice', { host: config.host, port: config.devicePort, password: config.spiceConfig.password || null });
        await listen('spice-bridge', (event: any) => {
          let payload = typeof event.payload === 'string' ? event.payload : event;
          try {
            const msg = typeof payload === 'string' ? JSON.parse(payload) : payload;
            if (msg.type === 'status' && msg.data?.message?.includes('ready')) this.emit('connected', '已连接');
          } catch {}
        });
        this.emit('connected', '已连接');
      } catch (err: any) {
        throw new Error(err?.message || 'SPICE 连接失败');
      }
    } else {
      // Web: WebSocket
      const wsUrl = `ws://${config.host}:${config.devicePort}`;
      const ws = new WebSocket(wsUrl);
      return new Promise<void>((resolve, reject) => {
        ws.onopen = () => { this.emit('connected', '已连接'); this.wsRef = ws; resolve(); };
        ws.onerror = () => reject(new Error('WebSocket 连接失败'));
        ws.onclose = () => { if (this.state !== 'disconnected') this.emit('disconnected', '连接断开'); };
      });
    }
  }

  // ── RDP ──
  private async connectRdp(config: ConnectionConfig) {
    const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('rdp_connect', {
          host: config.host, port: config.devicePort,
          username: config.rdpConfig.username,
          password: config.rdpConfig.password,
          domain: config.rdpConfig.domain || '',
          width: config.rdpConfig.desktopWidth,
          height: config.rdpConfig.desktopHeight,
        });
        this.emit('connected', '已连接');
      } catch (err: any) {
        throw new Error(err?.message || 'RDP 连接失败');
      }
    } else {
      // Web RDP 使用 @novnc/novnc 或类似库
      this.emit('connected', '已连接（WebRDP 模拟）');
    }
  }

  // ── Moonlight ──
  private async connectMoonlight(config: ConnectionConfig) {
    const isTauri = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;
    if (isTauri) {
      try {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('moonlight_start', {
          serverId: config.moonlightConfig.serverId,
          appName: config.moonlightConfig.appName,
          bitrate: config.moonlightConfig.bitrate,
          fps: config.moonlightConfig.fps,
          width: config.moonlightConfig.resolution.width,
          height: config.moonlightConfig.resolution.height,
        });
        this.emit('connected', '已连接');
      } catch (err: any) {
        throw new Error(err?.message || 'Moonlight 连接失败');
      }
    } else {
      this.emit('connected', '已连接（Moonlight 模拟）');
    }
  }
}

export const connectionManager = new ProtocolConnectionManager();
