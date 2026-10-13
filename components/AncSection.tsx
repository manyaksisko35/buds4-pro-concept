'use client';

import { useEffect, useRef, useState } from 'react';
import { AncDemo, type AncMode } from '@/lib/ancAudio';
import { useReducedMotion } from '@/lib/useReducedMotion';

const MODES: { id: AncMode; label: string; note: string }[] = [
  { id: 'off', label: 'Off', note: 'Everything around you, all at once.' },
  { id: 'ambient', label: 'Ambient', note: 'Hear voices and announcements clearly.' },
  { id: 'anc', label: 'Adaptive ANC', note: 'Noise fades. Your music stays.' },
];

const LEVEL: Record<AncMode, number> = { off: 1, ambient: 0.55, anc: 0.06 };

type Dot = { a: number; r: number; s: number; p: number };

function useNoiseField(canvas: React.RefObject<HTMLCanvasElement | null>, mode: AncMode, reduce: boolean) {
  const target = useRef(LEVEL[mode]);
  const modeRef = useRef(mode);
  useEffect(() => {
    target.current = LEVEL[mode];
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dots: Dot[] = Array.from({ length: 220 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.32 + Math.random() * 0.68,
      s: (Math.random() - 0.5) * 0.6,
      p: Math.random() * Math.PI * 2,
    }));
    let level = target.current;
    let raf = 0;
    let visible = false;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      level = reduce ? target.current : level + (target.current - level) * Math.min(1, dt * 4);
      const L = level;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) / 2;
      const quiet = 1 - L;

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.3 + quiet * 0.5));
      g.addColorStop(0, `rgba(125, 211, 252, ${0.1 + quiet * 0.18})`);
      g.addColorStop(1, 'rgba(125, 211, 252, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const t = now / 1000;
      const warm = modeRef.current === 'ambient';
      for (const d of dots) {
        d.a += d.s * dt * (0.4 + L);
        const jitter = Math.sin(t * 9 + d.p) * 0.05 * L;
        const rr = (d.r + jitter + quiet * 0.35 * d.r) * R;
        if (rr >= R) continue;
        const x = cx + Math.cos(d.a) * rr;
        const y = cy + Math.sin(d.a) * rr;
        const alpha = Math.min(1, 0.2 + 0.65 * L);
        ctx.fillStyle = warm ? `rgba(253, 186, 116, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
        const size = 1 + L * 1.6;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }

      for (let i = 0; i < 3; i++) {
        const k = (t * 0.35 + i / 3) % 1;
        ctx.strokeStyle = `rgba(125, 211, 252, ${(1 - k) * 0.4 * quiet})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.14 + k * 0.42), 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#e9ecef';
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.07, 0, Math.PI * 2);
      ctx.fill();

      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    });
    io.observe(cv);
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    cv.addEventListener('redraw', redraw);
    return () => {
      io.disconnect();
      cv.removeEventListener('redraw', redraw);
      cancelAnimationFrame(raf);
    };
  }, [canvas, reduce]);

  useEffect(() => {
    if (!reduce) return;
    const cv = canvas.current;
    if (cv) cv.dispatchEvent(new Event('redraw'));
  }, [mode, reduce, canvas]);
}

export default function AncSection() {
  const [mode, setMode] = useState<AncMode>('off');
  const [playing, setPlaying] = useState(false);
  const demo = useRef<AncDemo | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useNoiseField(canvas, mode, reduce);

  useEffect(() => {
    demo.current?.setMode(mode);
  }, [mode]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && demo.current) {
        demo.current.stop();
        demo.current = null;
        setPlaying(false);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      demo.current?.stop();
      demo.current = null;
    };
  }, []);

  const toggle = () => {
    if (demo.current) {
      demo.current.stop();
      demo.current = null;
      setPlaying(false);
    } else {
      demo.current = new AncDemo(mode);
      setPlaying(true);
    }
  };

  const current = MODES.find((m) => m.id === mode)!;

  return (
    <section ref={sectionRef} id="anc" className="sg-ambient amb-cyan relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center max-w-7xl mx-auto">
        <div>
          <p className="sg-eyebrow mb-3 lg:mb-5">Noise control</p>
          <h2 className="sg-title">
            Quiet that <strong className="sg-ai">fits you.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-w-md">
            Enhanced Adaptive ANC and Adaptive EQ analyze how the Buds sit and the shape of your ear, then tune noise
            cancelling in real time.
          </p>

          <div className="mt-8 inline-flex p-1 rounded-full border border-white/12 bg-white/5" role="radiogroup" aria-label="Noise control mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-full px-4 lg:px-5 py-2 text-sm transition-colors ${
                  mode === m.id ? 'bg-white text-black font-semibold' : 'text-white/70 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/55 h-5" aria-live="polite">
            {current.note}
          </p>

          <button onClick={toggle} className={`mt-6 sg-btn ${playing ? 'sg-btn--ghost' : ''}`} aria-pressed={playing}>
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
                <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
                <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
                <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
              </svg>
            )}
            {playing ? 'Stop the demo' : 'Hear the difference'}
          </button>
          <p className="mt-3 text-xs text-white/40">Best with headphones. Lower your volume first. Sound is synthesized in your browser.</p>
        </div>

        <div className="relative aspect-square w-full max-w-[560px] mx-auto rounded-[32px] border border-white/10 bg-[#07080b] overflow-hidden">
          <canvas ref={canvas} className="absolute inset-0 w-full h-full" aria-hidden />
          <div className="absolute inset-x-0 bottom-5 flex justify-center">
            <span className="rounded-full bg-black/60 border border-white/10 px-4 py-1.5 text-xs text-white/70">
              {mode === 'anc' ? 'Noise reduced' : mode === 'ambient' ? 'Voices let through' : 'Unfiltered noise'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
