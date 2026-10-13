'use client';

import { useEffect, useRef } from 'react';

const RINGS = [
  { id: 'buds', hours: 6, max: 26, label: 'Earbuds', note: 'per charge, ANC on' },
  { id: 'case', hours: 26, max: 26, label: 'With the case', note: 'total, ANC on' },
];

const FACTS = [
  { value: '61 mAh', label: 'per earbud' },
  { value: '530 mAh', label: 'charging case' },
  { value: 'USB-C', label: 'and wireless charging' },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const C = 2 * Math.PI * 88;

export default function BatterySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const arcRefs = useRef<(SVGCircleElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      if (!sec) return;
      const p = clamp01(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - window.innerHeight));
      const k = clamp01((p - 0.08) / 0.6);
      const e = k * k * (3 - 2 * k);
      RINGS.forEach((r, i) => {
        const frac = (r.hours / r.max) * e;
        const arc = arcRefs.current[i];
        if (arc) arc.style.strokeDashoffset = String(C * (1 - frac));
        const n = numRefs.current[i];
        if (n) n.textContent = String(Math.round(r.hours * e));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="battery" className="relative z-10 h-[220svh] bg-[#030303]">
      <div className="sg-ambient amb-teal sticky top-0 h-svh flex flex-col items-center justify-center gap-8 lg:gap-12 px-6 pt-16">
        <div className="text-center">
          <p className="sg-eyebrow mb-3 lg:mb-5">Battery</p>
          <h2 className="sg-title">
            Up to <strong className="sg-ai">26 hours</strong> with the case.
          </h2>
        </div>
        <div className="flex gap-6 lg:gap-20">
          {RINGS.map((r, i) => (
            <div key={r.id} className="flex flex-col items-center gap-3">
              <div className="relative w-[38vw] max-w-[220px] aspect-square">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden>
                  <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <circle
                    ref={(el) => {
                      arcRefs.current[i] = el;
                    }}
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke={`url(#bat-${r.id})`}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C}
                  />
                  <defs>
                    <linearGradient id={`bat-${r.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#5eead4" />
                      <stop offset="1" stopColor="#7dd3fc" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl lg:text-6xl font-semibold tabular-nums">
                    <span
                      ref={(el) => {
                        numRefs.current[i] = el;
                      }}
                    >
                      0
                    </span>
                    <span className="text-lg lg:text-2xl text-white/50">h</span>
                  </p>
                </div>
              </div>
              <p className="font-semibold text-sm lg:text-lg">{r.label}</p>
              <p className="text-white/45 text-xs lg:text-sm -mt-2">{r.note}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 lg:gap-4 w-full max-w-3xl">
          {FACTS.map((f) => (
            <div key={f.label} className="sg-card !rounded-2xl p-3 lg:p-5 text-center">
              <p className="text-lg lg:text-2xl font-semibold">{f.value}</p>
              <p className="text-white/50 text-[0.65rem] lg:text-sm font-light">{f.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[0.65rem] lg:text-xs text-white/45 text-center max-w-xl">
          Battery figures per Samsung, with ANC on. Actual results vary with settings, usage and environment.
        </p>
      </div>
    </section>
  );
}
