'use client';

import { useEffect, useRef } from 'react';
import { GAINS, ROWS } from '@/lib/compare';

export default function CompareSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>('[data-row]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          (e.target as HTMLElement).dataset.shown = '';
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    items.forEach((it) => io.observe(it));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="compare" className="sg-ambient amb-cyan relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 lg:mb-14">
          <p className="sg-eyebrow mb-3 lg:mb-5">Compare</p>
          <h2 className="sg-title">
            <strong>Buds4 Pro</strong> vs Buds3 Pro
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-10 lg:mb-14">
          {GAINS.map((g, i) => (
            <div key={g.label} data-row className="cmp-reveal sg-card !rounded-2xl p-4 lg:p-6 text-center" style={{ transitionDelay: `${i * 80}ms` }}>
              <p className="sg-ai text-2xl lg:text-4xl font-semibold">{g.value}</p>
              <p className="text-white/55 text-xs lg:text-sm font-light mt-1">{g.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[0.8fr_1fr_1fr] gap-x-3 lg:gap-x-6 pb-3 border-b border-white/15">
          <span />
          <span className="text-sm lg:text-lg font-semibold">Galaxy Buds4 Pro</span>
          <span className="text-sm lg:text-lg font-light text-white/60">Galaxy Buds3 Pro</span>
        </div>
        <dl className="divide-y divide-white/10">
          {ROWS.map((r) => (
            <div key={r.label} data-row className="cmp-reveal grid grid-cols-[0.8fr_1fr_1fr] gap-x-3 lg:gap-x-6 py-3 lg:py-4 text-xs lg:text-base">
              <dt className="text-white/45 font-light">{r.label}</dt>
              <dd className={r.up ? 'font-semibold text-cyan-200' : 'font-medium'}>{r.pro4}</dd>
              <dd className="text-white/60 font-light">{r.pro3}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-white/40 max-w-3xl">
          Figures per Samsung. Speaker area compared with the previous generation. Battery life with ANC on; results
          vary with settings and usage.
        </p>
      </div>
    </section>
  );
}
