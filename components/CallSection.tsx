'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvasLoop } from '@/lib/useCanvasLoop';
import { useReducedMotion } from '@/lib/useReducedMotion';

const POINTS = [
  { title: 'Voice Pickup Unit', text: 'Senses the vibration of your own voice, so the Buds know when it is you speaking.' },
  { title: 'DNN noise reduction', text: 'A deep neural network filters wind, traffic and chatter around your voice.' },
  { title: 'Three mics per earbud', text: 'Two high-SNR mics and one more work together to capture you clearly.' },
];

const rand = (i: number) => {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

export default function CallSection() {
  const [clear, setClear] = useState(true);
  const level = useRef(0.12);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const target = clear ? 0.08 : 1;
      level.current = reduce ? target : level.current + (target - level.current) * 0.08;
      const mid = h / 2;
      const tt = reduce ? 2 : t;
      const bars = Math.floor(w / 6);
      for (let i = 0; i < bars; i++) {
        const x = i * 6 + 3;
        const p = i / bars;
        const syll = Math.max(0, Math.sin(p * 18 - tt * 3.2)) * Math.max(0, Math.sin(p * 3.1 + tt * 0.6) + 0.35);
        const voice = syll * h * 0.28;
        const n = (rand(i + Math.floor(tt * 14) * 997) * 0.8 + 0.2) * h * 0.22 * level.current;
        ctx.fillStyle = 'rgba(253, 164, 175, 0.55)';
        ctx.fillRect(x - 1.5, mid - n, 3, n * 2);
        const g = ctx.createLinearGradient(0, mid - voice, 0, mid + voice);
        g.addColorStop(0, '#7dd3fc');
        g.addColorStop(1, '#a78bfa');
        ctx.fillStyle = g;
        ctx.fillRect(x - 1.5, mid - voice, 3, Math.max(1, voice * 2));
      }
    },
    [clear, reduce]
  );
  useCanvasLoop(canvas, draw, !reduce);

  return (
    <section id="calls" className="sg-ambient amb-indigo relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="sg-eyebrow mb-3 lg:mb-5">Calls</p>
          <h2 className="sg-title">
            Heard loud and <strong className="sg-ai">clear.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-w-md">
            Super Clear Call combines sensor fusion with AI noise reduction, so the person on the other end hears you,
            not the street.
          </p>
          <div className="mt-8 grid gap-3">
            {POINTS.map((p) => (
              <div key={p.title} className="sg-card !rounded-2xl px-5 py-4">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-white/55 font-light mt-1">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="relative rounded-[28px] border border-white/10 bg-[#07080b] overflow-hidden">
            <canvas ref={canvas} className="block w-full h-[240px] lg:h-[320px]" role="img" aria-label={clear ? 'Voice waveform with background noise removed' : 'Voice waveform buried in background noise'} />
            <div className="absolute top-4 left-5 flex gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <i className="w-2 h-2 rounded-full bg-sky-300" /> Your voice
              </span>
              <span className="flex items-center gap-1.5">
                <i className="w-2 h-2 rounded-full bg-rose-300/70" /> Background noise
              </span>
            </div>
          </div>
          <button
            onClick={() => setClear((v) => !v)}
            aria-pressed={clear}
            className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 pl-2 pr-5 py-2 text-sm"
          >
            <span className={`relative w-11 h-6 rounded-full transition-colors ${clear ? 'bg-sky-400' : 'bg-white/20'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${clear ? 'translate-x-5' : ''}`} />
            </span>
            Super Clear Call {clear ? 'on' : 'off'}
          </button>
          <p className="mt-3 text-xs text-white/40">Illustration. Super Clear Call works with compatible Galaxy devices.</p>
        </div>
      </div>
    </section>
  );
}
