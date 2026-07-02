/**
 * 水印服务
 * 支持: 明水印/暗水印、动态水印、防截屏
 */

import type { WatermarkConfig } from '@/types';

class WatermarkService {
  private canvas: HTMLCanvasElement | null = null;
  private watermarkDiv: HTMLDivElement | null = null;
  private config: WatermarkConfig | null = null;
  private animationFrameId: number | null = null;

  /** 初始化水印 */
  init(config: WatermarkConfig, targetElement?: HTMLElement): void {
    this.config = config;
    this.remove();

    if (!config.enabled) return;

    const container = targetElement || document.body;
    this.watermarkDiv = document.createElement('div');
    this.watermarkDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
      overflow: hidden;
    `;

    this.generateWatermarkCanvas();
    if (this.canvas) {
      this.watermarkDiv.appendChild(this.canvas);
    }

    container.appendChild(this.watermarkDiv);

    if (config.dynamic) {
      this.startDynamicUpdate();
    }
  }

  /** 生成水印 Canvas */
  private generateWatermarkCanvas(): void {
    if (!this.config) return;

    this.canvas = document.createElement('canvas');
    const density = this.config.density || 20;
    const canvasSize = 400;

    this.canvas.width = canvasSize;
    this.canvas.height = canvasSize;
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    const fontSize = this.config.fontSize || 16;
    const opacity = this.config.opacity || 0.1;
    const rotation = this.config.rotation || -30;
    const content = this.buildWatermarkContent();

    ctx.font = `${fontSize}px "Microsoft YaHei", sans-serif`;
    ctx.fillStyle = this.config.fontColor || '#cccccc';
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Generate watermark pattern
    const cols = Math.ceil(canvasSize / (fontSize * 8));
    const rows = Math.ceil(canvasSize / (fontSize * 6));

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.save();
        const x = col * fontSize * 8 + (row % 2) * fontSize * 4;
        const y = row * fontSize * 6;
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(content, 0, 0);
        ctx.restore();
      }
    }
  }

  /** 构建水印内容 */
  private buildWatermarkContent(): string {
    if (!this.config) return '';

    let content = this.config.content || '';

    if (this.config.dynamic) {
      const parts: string[] = [];
      if (this.config.userName) parts.push(this.config.userName);
      if (this.config.userId) parts.push(this.config.userId);
      if (this.config.timestamp) {
        const time = new Date(this.config.timestamp);
        parts.push(time.toLocaleString('zh-CN'));
      } else {
        parts.push(new Date().toLocaleString('zh-CN'));
      }
      if (parts.length > 0) {
        content = parts.join(' | ');
      }
    }

    return content;
  }

  /** 动态更新水印（防截屏追溯） */
  private startDynamicUpdate(): void {
    const update = () => {
      this.generateWatermarkCanvas();
      if (this.watermarkDiv && this.canvas) {
        const oldCanvas = this.watermarkDiv.querySelector('canvas');
        if (oldCanvas) {
          this.watermarkDiv.removeChild(oldCanvas);
        }
        this.watermarkDiv.appendChild(this.canvas);
      }
      this.animationFrameId = requestAnimationFrame(update);
    };

    // Update every 30 seconds
    const intervalId = setInterval(() => {
      if (this.config?.dynamic) {
        this.generateWatermarkCanvas();
      }
    }, 30000);
    (this as any).__intervalId = intervalId;
  }

  /** 暗水印（隐式截屏追溯） */
  embedBlindWatermark(imageData: ImageData, userId: string): ImageData {
    // 暗水印嵌入：在图像数据中嵌入不可见标识
    const data = imageData.data;
    const watermark = this.stringToBits(userId);

    for (let i = 0; i < watermark.length && i * 4 < data.length; i++) {
      // 在蓝色通道最低位嵌入
      data[i * 4 + 2] = (data[i * 4 + 2] & 0xfe) | watermark[i];
    }

    return imageData;
  }

  /** 提取暗水印 */
  extractBlindWatermark(imageData: ImageData): string {
    const data = imageData.data;
    const bits: number[] = [];
    const maxBits = Math.min(256, Math.floor(data.length / 4));

    for (let i = 0; i < maxBits; i++) {
      bits.push(data[i * 4 + 2] & 0x01);
    }

    return this.bitsToString(bits);
  }

  /** 移除水印 */
  remove(): void {
    if (this.watermarkDiv && this.watermarkDiv.parentNode) {
      this.watermarkDiv.parentNode.removeChild(this.watermarkDiv);
    }
    this.watermarkDiv = null;
    this.canvas = null;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const intervalId = (this as any).__intervalId;
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  private stringToBits(str: string): number[] {
    const bits: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      for (let j = 7; j >= 0; j--) {
        bits.push((charCode >> j) & 1);
      }
    }
    return bits;
  }

  private bitsToString(bits: number[]): string {
    const chars: string[] = [];
    for (let i = 0; i + 7 < bits.length; i += 8) {
      let charCode = 0;
      for (let j = 0; j < 8; j++) {
        charCode = (charCode << 1) | bits[i + j];
      }
      if (charCode > 0 && charCode < 128) {
        chars.push(String.fromCharCode(charCode));
      }
    }
    return chars.join('');
  }
}

export const watermarkService = new WatermarkService();
