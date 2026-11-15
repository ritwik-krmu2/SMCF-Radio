import React, { useEffect, useRef } from 'react';

interface Waveform3DProps {
  isPlaying: boolean;
  color?: string;
  height?: number;
}

export const Waveform3D: React.FC<Waveform3DProps> = ({
  isPlaying,
  color = '#00FF00',
  height = 70,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      step += isPlaying ? 0.05 : 0.01;

      const w = (canvas.width = canvas.clientWidth * window.devicePixelRatio);
      const h = (canvas.height = canvas.clientHeight * window.devicePixelRatio);
      ctx.clearRect(0, 0, w, h);

      const numBars = 42;
      const barWidth = (w / numBars) * 0.55;
      const spacing = w / numBars;

      for (let i = 0; i < numBars; i++) {
        const x = i * spacing + spacing / 4;
        const phase = step + i * 0.22;
        const amplitude = isPlaying ? (Math.sin(phase) * 0.45 + 0.55) : 0.15;
        const barHeight = Math.max(6, amplitude * (h * 0.75));
        const y = (h - barHeight) / 2;

        // Gradient for depth: Electric Lime #00FF00 & Matrix Green
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#00FF00'); // Pure Electric Lime #00FF00
        gradient.addColorStop(0.5, '#00DD00'); // Radio Matrix Green
        gradient.addColorStop(1, '#059669'); // Rich Emerald Base

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2]);
        ctx.fill();
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="w-full relative flex items-center justify-center overflow-hidden py-1">
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        className="w-full block"
      />
    </div>
  );
};
