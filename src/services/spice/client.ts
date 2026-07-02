/**
 * SPICE 协议客户端服务
 *
 * 在桌面端 (Tauri) 使用原生 SPICE 客户端 (spice-client-gtk / spice-client)
 * 在 Web 端使用 spice-html5 或 WebSocket 代理
 *
 * SPICE 默认连接: 192.168.201.131:5900
 */

import type { SPICEConfig, ConnectionMetrics, ClipboardContentType } from '@/types';

export type SPICEEventType =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'metrics'
  | 'clipboard'
  | 'file-transfer'
  | 'usb-attach'
  | 'usb-detach'
  | 'cursor-change'
  | 'display-change';

export interface SPICEEvent {
  type: SPICEEventType;
  data?: any;
  timestamp: number;
}

export type SPICEConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';

type EventCallback = (event: SPICEEvent) => void;

class SPICEClient {
  private status: SPICEConnectionStatus = 'idle';
  private config: SPICEConfig | null = null;
  private listeners: Map<SPICEEventType, EventCallback[]> = new Map();
  private metricsInterval: ReturnType<typeof setInterval> | null = null;

  /** 建立 SPICE 连接 */
  async connect(config: SPICEConfig): Promise<void> {
    this.status = 'connecting';
    this.config = config;
    this.emit({ type: 'connected', timestamp: Date.now() });

    try {
      // === 平台分发 ===
      // Tauri Desktop: 调用 Rust FFI -> spice-client-gtk (Linux) / spice-client (Windows)
      //   await window.__TAURI__.invoke('spice_connect', { config })
      // Web: 使用 spice-html5 或 WebSocket 代理
      //   const wsUrl = `ws://${config.host}:${config.port}`
      //   this.ws = new WebSocket(wsUrl)

      // 模拟连接延迟
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.status = 'connected';
      this.emit({ type: 'connected', data: { connectionId: `spice-${Date.now()}` }, timestamp: Date.now() });

      // 启动指标监控
      this.startMetricsMonitoring();

      console.log(`[SPICE] Connected to ${config.host}:${config.port}`);
    } catch (error: any) {
      this.status = 'error';
      this.emit({ type: 'error', data: { message: error.message }, timestamp: Date.now() });
      throw error;
    }
  }

  /** 断开 SPICE 连接 */
  async disconnect(): Promise<void> {
    this.status = 'disconnecting';
    this.stopMetricsMonitoring();

    try {
      // Tauri Desktop: await window.__TAURI__.invoke('spice_disconnect')
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      this.status = 'disconnected';
      this.config = null;
      this.emit({ type: 'disconnected', timestamp: Date.now() });
    }
  }

  /** 发送剪贴板数据 */
  sendClipboardData(content: string, type: ClipboardContentType): void {
    // Tauri: window.__TAURI__.invoke('spice_clipboard_send', { content, type })
    // Web: this.ws?.send(JSON.stringify({ type: 'clipboard', content, mimeType: type }))
    this.emit({ type: 'clipboard', data: { content, type }, timestamp: Date.now() });
  }

  /** USB 设备重定向 */
  async usbDeviceAttach(deviceId: string): Promise<void> {
    // Tauri: window.__TAURI__.invoke('spice_usb_attach', { deviceId })
    await new Promise((r) => setTimeout(r, 500));
    this.emit({ type: 'usb-attach', data: { deviceId }, timestamp: Date.now() });
  }

  async usbDeviceDetach(deviceId: string): Promise<void> {
    // Tauri: window.__TAURI__.invoke('spice_usb_detach', { deviceId })
    await new Promise((r) => setTimeout(r, 300));
    this.emit({ type: 'usb-detach', data: { deviceId }, timestamp: Date.now() });
  }

  /** 切换显示模式 */
  setDisplayMode(mode: 'window' | 'fullscreen'): void {
    // Tauri: window.__TAURI__.invoke('spice_set_display_mode', { mode })
    console.log(`[SPICE] Display mode: ${mode}`);
  }

  /** 调整画面质量 */
  setQuality(quality: 'low' | 'medium' | 'high' | 'lossless'): void {
    const qualityMap = { low: 30, medium: 50, high: 80, lossless: 100 };
    // Tauri: window.__TAURI__.invoke('spice_set_quality', { quality: qualityMap[quality] })
    console.log(`[SPICE] Quality set to ${quality} (${qualityMap[quality]}%)`);
  }

  /** 设置分辨率 */
  setResolution(width: number, height: number): void {
    // Tauri: window.__TAURI__.invoke('spice_set_resolution', { width, height })
    console.log(`[SPICE] Resolution: ${width}x${height}`);
  }

  /** 获取当前连接状态 */
  getStatus(): SPICEConnectionStatus {
    return this.status;
  }

  /** 获取连接配置 */
  getConfig(): SPICEConfig | null {
    return this.config;
  }

  /** 事件监听 */
  on(eventType: SPICEEventType, callback: EventCallback): () => void {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.push(callback);
    this.listeners.set(eventType, callbacks);

    return () => {
      const cbs = this.listeners.get(eventType) || [];
      this.listeners.set(
        eventType,
        cbs.filter((cb) => cb !== callback)
      );
    };
  }

  /** 发送屏幕输入（键盘/鼠标） */
  sendKeyboardEvent(key: string, pressed: boolean): void {
    // Tauri: window.__TAURI__.invoke('spice_keyboard', { key, pressed })
    // Web: this.ws?.send(JSON.stringify({ type: 'keyboard', key, down: pressed }))
  }

  sendMouseEvent(x: number, y: number, buttons: number, wheelMotion?: number): void {
    // Tauri: window.__TAURI__.invoke('spice_mouse', { x, y, buttons, wheelMotion })
  }

  /** 文件传输通道 */
  async sendFileChunk(chunk: ArrayBuffer, offset: number, total: number): Promise<void> {
    // Tauri: window.__TAURI__.invoke('spice_file_transfer', { data: Array.from(new Uint8Array(chunk)), offset, total })
    await Promise.resolve();
  }

  // ========== Private ==========

  private emit(event: SPICEEvent): void {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach((cb) => cb(event));
  }

  private startMetricsMonitoring(): void {
    if (this.metricsInterval) return;

    this.metricsInterval = setInterval(() => {
      if (this.status !== 'connected') return;

      const metrics: ConnectionMetrics = {
        fps: Math.floor(Math.random() * 30) + 30,
        latency: Math.floor(Math.random() * 20) + 5,
        bandwidth: Math.floor(Math.random() * 50) + 20,
        packetsLost: Math.random() * 0.5,
        cpuUsage: Math.floor(Math.random() * 30) + 10,
        memoryUsage: Math.floor(Math.random() * 20) + 30,
        frameWidth: 1920,
        frameHeight: 1080,
        codec: 'h264',
        rtt: Math.floor(Math.random() * 10) + 5,
        jitter: Math.random() * 2,
      };

      this.emit({ type: 'metrics', data: metrics, timestamp: Date.now() });
    }, 2000);
  }

  private stopMetricsMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
}

// Singleton instance
export const spiceClient = new SPICEClient();
