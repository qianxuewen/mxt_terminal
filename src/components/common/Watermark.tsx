import React, { useEffect, useRef } from 'react';
import type { WatermarkConfig } from '@/types';

interface WatermarkProps {
  config: WatermarkConfig;
}

/**
 * 水印组件 - 支持明暗水印、动态水印
 */
const Watermark: React.FC<WatermarkProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!config.enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawWatermark = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (config.style === 'light') {
        ctx.fillStyle = `rgba(255, 255, 255, ${config.opacity})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${config.opacity})`;
      }

      ctx.font = `${config.fontSize}px "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const content = config.dynamic
        ? `${config.content} | ${config.userName || ''} | ${new Date().toLocaleString('zh-CN')}`
        : config.content;

      const density = config.density || 20;
      const spacingX = Math.max(canvas.width / (density / 2), 150);
      const spacingY = Math.max(canvas.height / (density / 2), 100);

      for (let y = -spacingY; y < canvas.height + spacingY; y += spacingY) {
        for (let x = -spacingX; x < canvas.width + spacingX; x += spacingX) {
          ctx.save();
          ctx.translate(x + (y % 2) * spacingX / 2, y);
          ctx.rotate((config.rotation * Math.PI) / 180);
          ctx.globalAlpha = config.opacity;
          ctx.fillText(content, 0, 0);
          ctx.restore();
        }
      }
    };

    drawWatermark();

    // Dynamic update
    let intervalId: ReturnType<typeof setInterval>;
    if (config.dynamic) {
      intervalId = setInterval(drawWatermark, 30000);
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawWatermark();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (intervalId) clearInterval(intervalId);
    };
  }, [config]);

  if (!config.enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2147483647,
      }}
    />
  );
};

export default Watermark;
