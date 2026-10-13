'use client';

import { useCallback, useRef } from 'react';
import { heroSpin, useDragSpin } from '@/lib/dragSpin';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const pick = useCallback(() => heroSpin, []);
  useDragSpin(ref, pick);

  return (
    <section
      ref={ref}
      id="overview"
      className="relative h-svh w-full flex flex-col items-center text-center px-4 pt-[18svh] lg:pt-[16svh] touch-pan-y select-none cursor-grab data-[dragging]:cursor-grabbing"
    >
      <p className="hero-in sg-eyebrow mb-4 lg:mb-6">Galaxy AI ready</p>
      <h1 className="hero-in hero-in--2 sg-title text-[13vw] lg:text-[7.5vw]">
        Galaxy Buds4 <strong>Pro</strong>
      </h1>
      <p className="hero-in hero-in--3 mt-4 lg:mt-5 text-base lg:text-2xl font-light text-white/70">
        The <span className="sg-ai font-semibold">ultimate sound</span>, shaped by a new blade.
      </p>
      <div className="hero-in hero-in--4 absolute bottom-8 flex flex-col items-center gap-3 text-white/50">
        <span className="sg-eyebrow !text-[0.65rem]">Drag to spin · Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}
