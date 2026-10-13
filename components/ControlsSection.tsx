'use client';

import { useEffect, useRef, useState } from 'react';

const TRACKS = [
  { title: 'Midnight Drive', artist: 'Lumen' },
  { title: 'Paper Planes', artist: 'Kite Theory' },
  { title: 'Slow Tide', artist: 'Hana Ro' },
  { title: 'Neon Bloom', artist: 'Velvet Static' },
];
const MODES = ['Adaptive ANC', 'Ambient sound', 'Off'] as const;

type Gesture = 'pinch' | 'double' | 'triple' | 'hold' | 'up' | 'down';

const GESTURES: { id: Gesture; label: string; action: string }[] = [
  { id: 'pinch', label: 'Pinch', action: 'Play or pause' },
  { id: 'double', label: 'Pinch twice', action: 'Next track' },
  { id: 'triple', label: 'Pinch three times', action: 'Previous track' },
  { id: 'hold', label: 'Pinch and hold', action: 'Switch noise control' },
  { id: 'up', label: 'Swipe up', action: 'Volume up' },
  { id: 'down', label: 'Swipe down', action: 'Volume down' },
];

export default function ControlsSection() {
  const [playing, setPlaying] = useState(true);
  const [track, setTrack] = useState(0);
  const [mode, setMode] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [last, setLast] = useState<Gesture | null>(null);
  const [pulse, setPulse] = useState({ n: 0, key: 0 });
  const taps = useRef(0);
  const tapTimer = useRef(0);
  const holdTimer = useRef(0);
  const held = useRef(false);
  const startY = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(tapTimer.current);
      window.clearTimeout(holdTimer.current);
    },
    []
  );

  const run = (g: Gesture) => {
    setLast(g);
    const n = g === 'double' ? 2 : g === 'triple' ? 3 : 1;
    setPulse((p) => ({ n, key: p.key + 1 }));
    if (g === 'pinch') setPlaying((v) => !v);
    if (g === 'double') {
      setTrack((t) => (t + 1) % TRACKS.length);
      setPlaying(true);
    }
    if (g === 'triple') {
      setTrack((t) => (t - 1 + TRACKS.length) % TRACKS.length);
      setPlaying(true);
    }
    if (g === 'hold') setMode((m) => (m + 1) % MODES.length);
    if (g === 'up') setVolume((v) => Math.min(1, v + 0.15));
    if (g === 'down') setVolume((v) => Math.max(0, v - 0.15));
  };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    held.current = false;
    startY.current = e.clientY;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      taps.current = 0;
      run('hold');
    }, 650);
  };
  const onUp = (e: React.PointerEvent) => {
    window.clearTimeout(holdTimer.current);
    if (held.current) return;
    const dy = e.clientY - startY.current;
    if (Math.abs(dy) > 28) {
      taps.current = 0;
      run(dy < 0 ? 'up' : 'down');
      return;
    }
    taps.current += 1;
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => {
      const n = taps.current;
      taps.current = 0;
      run(n >= 3 ? 'triple' : n === 2 ? 'double' : 'pinch');
    }, 330);
  };

  const t = TRACKS[track];
  const lastInfo = GESTURES.find((g) => g.id === last);

  return (
    <section id="controls" className="sg-ambient amb-indigo relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="sg-eyebrow mb-3 lg:mb-5">Controls</p>
          <h2 className="sg-title">
            Pinch, <strong className="sg-ai">don&apos;t tap.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-w-md">
            An engraved area on the blade shows your fingers where to go. Try it: pinch, swipe or hold the glowing
            spot.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-2 max-w-md">
            {GESTURES.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => run(g.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${
                    last === g.id ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                  }`}
                >
                  <span className="block text-sm font-semibold">{g.label}</span>
                  <span className="block text-xs text-white/50">{g.action}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/40">Illustration of typical controls. Gestures can be customized in the Galaxy Wearable app.</p>
        </div>

        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-8 lg:gap-12">
          <div className="relative h-[340px] lg:h-[420px] aspect-[1/3]">
            <svg viewBox="0 0 120 360" className="absolute inset-0 w-full h-full" aria-hidden>
              <defs>
                <linearGradient id="blade-metal" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6b7078" />
                  <stop offset="0.35" stopColor="#d9dde2" />
                  <stop offset="0.55" stopColor="#9aa0a8" />
                  <stop offset="1" stopColor="#5d6168" />
                </linearGradient>
                <radialGradient id="bud-body" cx="0.4" cy="0.35">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#c9ccd0" />
                </radialGradient>
              </defs>
              <ellipse cx="60" cy="62" rx="54" ry="52" fill="url(#bud-body)" />
              <path d="M38 70 Q60 52 82 70 L76 338 Q60 352 44 338 Z" fill="url(#blade-metal)" />
              <circle cx="60" cy="80" r="9" fill="#2a2d31" stroke="#9aa0a8" strokeWidth="2" />
              <rect x="47" y="180" width="26" height="70" rx="13" fill="none" stroke="rgba(255,255,255,0.55)" strokeDasharray="3 3" />
            </svg>
            <button
              aria-label="Pinch area. Click to pinch, click twice or three times, hold, or drag up and down to swipe."
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={() => window.clearTimeout(holdTimer.current)}
              className="pinch-zone absolute left-[36%] w-[28%] top-[48%] h-[22%] rounded-full touch-none"
            >
              <span key={pulse.key} className="pinch-ring" style={{ ['--n' as string]: pulse.n }} />
            </button>
          </div>

          <div className="w-full max-w-[300px] sg-card !rounded-3xl p-5" aria-live="polite">
            <div className="aspect-square rounded-2xl mb-4 flex items-end p-4 bg-[linear-gradient(135deg,#0ea5e9,#8b5cf6_55%,#ec4899)]" style={{ filter: `hue-rotate(${track * 70}deg)` }}>
              <span className={`eq ${playing ? 'eq--on' : ''}`} aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <p className="font-semibold truncate">{t.title}</p>
            <p className="text-sm text-white/50 truncate">{t.artist}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <span className="rounded-full border border-white/15 px-2.5 py-1">{MODES[mode]}</span>
              <span>{playing ? 'Playing' : 'Paused'}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50" aria-hidden>
                <path d="M4 9v6h4l5 4V5L8 9H4z" />
              </svg>
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-white transition-[width] duration-300" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
            <p className="mt-4 text-xs text-white/45 h-4">{lastInfo ? `${lastInfo.label} → ${lastInfo.action}` : 'Waiting for a gesture'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
