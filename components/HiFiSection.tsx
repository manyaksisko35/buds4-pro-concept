'use client';

import { useCallback, useRef } from 'react';
import { useCanvasLoop } from '@/lib/useCanvasLoop';
import { useReducedMotion } from '@/lib/useReducedMotion';

const wave = (x: number, t: number) =>
  Math.sin(x * 2.1 + t) * 0.55 + Math.sin(x * 5.3 - t * 1.4) * 0.25 + Math.sin(x * 11.7 + t * 0.7) * 0.12;

export default function HiFiSection() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const split = useRef(0.5);
  const reduce = useReducedMotion();

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const mid = h / 2;
    const amp = h * 0.34;
    const sx = w * split.current;
    const tt = reduce ? 0 : t * 0.6;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (h / 8) * i);
      ctx.lineTo(w, (h / 8) * i);
      ctx.stroke();
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, sx, h);
    ctx.clip();
    const levels = 7;
    const step = 22;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += step) {
      const v = Math.round(wave(x / w * 6, tt) * levels) / levels;
      const y = mid - v * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      ctx.lineTo(x + step, y);
    }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, 0, w - sx, h);
    ctx.clip();
    const g = ctx.createLinearGradient(sx, 0, w, 0);
    g.addColorStop(0, '#7dd3fc');
    g.addColorStop(0.6, '#a78bfa');
    g.addColorStop(1, '#f0abfc');
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = mid - wave(x / w * 6, tt) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(sx - 1, 0, 2, h);
    ctx.beginPath();
    ctx.arc(sx, mid, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '600 13px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⇆', sx, mid + 1);
  }, [reduce]);

  useCanvasLoop(canvas, draw, !reduce);

  const drag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    split.current = Math.min(0.95, Math.max(0.05, (e.clientX - r.left) / r.width));
    if (reduce) e.currentTarget.dispatchEvent(new Event('redraw'));
  };

  return (
    <section id="hifi" className="sg-ambient amb-violet relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="sg-eyebrow mb-3 lg:mb-5">Hi-Fi</p>
          <h2 className="sg-title">
            24-bit / 96 kHz. <strong className="sg-ai">Every detail.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6">
            With the Samsung Seamless Codec, compatible Galaxy devices stream up to 24-bit / 96 kHz audio, so music
            keeps the texture the artist recorded.
          </p>
        </div>
        <div className="mt-10 lg:mt-14 relative rounded-[28px] border border-white/10 bg-[#07080b] overflow-hidden">
          <canvas
            ref={canvas}
            onPointerDown={drag}
            onPointerMove={drag}
            className="block w-full h-[260px] lg:h-[360px] touch-pan-y cursor-ew-resize"
            role="img"
            aria-label="A stepped low-resolution waveform beside a smooth high-resolution waveform"
          />
          <span className="absolute top-4 left-5 rounded-full bg-black/60 px-3 py-1 text-xs text-white/60">Lower resolution</span>
          <span className="absolute top-4 right-5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">24-bit / 96 kHz</span>
        </div>
        <p className="mt-3 text-xs text-white/40">
          Illustration. Requires a compatible Galaxy device with Ultra High Quality audio turned on.
        </p>
      </div>
    </section>
  );
}
