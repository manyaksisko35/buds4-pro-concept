'use client';

import { useEffect, useState } from 'react';

export type Section = { id: string; label: string };

export const SECTIONS: Section[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'open', label: 'The case' },
  { id: 'design', label: 'Design' },
  { id: 'sound', label: 'Sound' },
  { id: 'anc', label: 'Noise control' },
  { id: 'spatial', label: '360 Audio' },
  { id: 'hifi', label: 'Hi-Fi' },
  { id: 'controls', label: 'Pinch controls' },
  { id: 'calls', label: 'Calls' },
  { id: 'battery', label: 'Battery' },
  { id: 'charging', label: 'Wireless charging' },
  { id: 'water', label: 'IP57' },
  { id: 'colors', label: 'Colors' },
  { id: 'ecosystem', label: 'Galaxy ecosystem' },
  { id: 'specs', label: 'Specs' },
];

export function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
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
  return active;
}

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);
