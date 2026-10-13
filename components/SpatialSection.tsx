'use client';

import { useEffect, useRef, useState } from 'react';
import { SpatialDemo } from '@/lib/spatialAudio';
import { useReducedMotion } from '@/lib/useReducedMotion';

const R = 70;
const deg = (r: number) => (r * 180) / Math.PI;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

type Orientation = { alpha: number | null };
type PermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> };

export default function SpatialSection() {
  const [playing, setPlaying] = useState(false);
  const [tracking, setTracking] = useState(true);
  const [gyro, setGyro] = useState(false);
  const reduce = useReducedMotion();

  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const srcRef = useRef<SVGGElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const demo = useRef<SpatialDemo | null>(null);
  const st = useRef({ angle: 0.9, yaw: 0, targetYaw: 0, dragging: false, lastInput: 0 });
  const trackingRef = useRef(tracking);
  const playingRef = useRef(playing);

  useEffect(() => {
    trackingRef.current = tracking;
    playingRef.current = playing;
  }, [tracking, playing]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let raf = 0;
    let visible = false;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (!s.dragging && playingRef.current && !reduce) s.angle = wrap(s.angle + dt * 0.55);
      if (now - s.lastInput > 2500) s.targetYaw = 0;
      s.yaw += wrap(s.targetYaw - s.yaw) * Math.min(1, dt * 8);
      const shown = trackingRef.current ? s.angle : s.angle + s.yaw;
      if (headRef.current) headRef.current.setAttribute('transform', `rotate(${deg(s.yaw)})`);
      if (srcRef.current) srcRef.current.setAttribute('transform', `translate(${Math.sin(shown) * R} ${-Math.cos(shown) * R})`);
      demo.current?.setScene(s.angle, trackingRef.current ? s.yaw : 0);
      if (visible) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(draw);
    });
    io.observe(card);

    const local = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      return { x: e.clientX - (r.left + r.width / 2), y: e.clientY - (r.top + r.height / 2), size: r.width };
    };
    const down = (e: PointerEvent) => {
      const p = local(e);
      const dist = Math.hypot(p.x, p.y) / (p.size / 2);
      if (dist < 0.45) return;
      st.current.dragging = true;
      card.setPointerCapture(e.pointerId);
      move(e);
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      const a = Math.atan2(p.x, -p.y);
      const s = st.current;
      if (s.dragging) {
        s.angle = trackingRef.current ? a : wrap(a - s.yaw);
      } else if (e.pointerType === 'mouse') {
        s.targetYaw = Math.max(-1.3, Math.min(1.3, a));
        s.lastInput = performance.now();
      }
    };
    const up = () => {
      st.current.dragging = false;
    };
    card.addEventListener('pointerdown', down);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', up);
    card.addEventListener('pointercancel', up);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      card.removeEventListener('pointerdown', down);
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', up);
      card.removeEventListener('pointercancel', up);
    };
  }, [reduce]);

  useEffect(() => {
    if (!gyro) return;
    let base: number | null = null;
    const on = (e: Orientation) => {
      if (e.alpha == null) return;
      base ??= e.alpha;
      const s = st.current;
      s.targetYaw = Math.max(-1.4, Math.min(1.4, wrap(((base - e.alpha) * Math.PI) / 180)));
      s.lastInput = performance.now();
    };
    window.addEventListener('deviceorientation', on);
    return () => window.removeEventListener('deviceorientation', on);
  }, [gyro]);

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
      demo.current = new SpatialDemo();
      setPlaying(true);
    }
  };

  const enableGyro = async () => {
    const api = (window as unknown as { DeviceOrientationEvent?: PermissionApi }).DeviceOrientationEvent;
    try {
      if (api?.requestPermission && (await api.requestPermission()) !== 'granted') return;
      setGyro(true);
    } catch {
      setGyro(false);
    }
  };

  return (
    <section ref={sectionRef} id="spatial" className="sg-ambient amb-teal relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center max-w-7xl mx-auto">
        <div
          ref={cardRef}
          className="order-2 lg:order-1 relative aspect-square w-full max-w-[540px] mx-auto rounded-full border border-white/10 bg-[radial-gradient(circle,#0d1417_0%,#07080b_70%)] touch-none select-none cursor-crosshair"
          role="img"
          aria-label="Top view of a listener's head with a sound source circling around it"
        >
          <svg viewBox="-100 -100 200 200" className="absolute inset-0 w-full h-full" aria-hidden>
            <circle r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeDasharray="2 4" />
            <circle r={R * 0.55} fill="none" stroke="rgba(255,255,255,0.06)" />
            <text y={-R - 9} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.45)" letterSpacing="1.5">
              FRONT
            </text>
            <g ref={headRef}>
              <path d="M0 -27 L5 -19 L-5 -19 Z" fill="rgba(255,255,255,0.5)" />
              <ellipse rx="17" ry="20" fill="#1c2226" stroke="rgba(255,255,255,0.35)" />
              <ellipse cx="-18.5" rx="3.5" ry="6" fill="#1c2226" stroke="rgba(255,255,255,0.35)" />
              <ellipse cx="18.5" rx="3.5" ry="6" fill="#1c2226" stroke="rgba(255,255,255,0.35)" />
              <circle cx="-19" r="2.2" fill="#5eead4" />
              <circle cx="19" r="2.2" fill="#5eead4" />
            </g>
            <g ref={srcRef}>
              <circle r="14" fill="none" stroke="rgba(94,234,212,0.35)" className={playing && !reduce ? 'spatial-pulse' : ''} />
              <circle r="8" fill="#5eead4" />
              <path d="M-2.5 -3.5 V3.5 M0 -5 V5 M2.5 -2.5 V2.5" stroke="#04211c" strokeWidth="1.3" strokeLinecap="round" />
            </g>
          </svg>
          <p className="absolute bottom-[9%] inset-x-0 text-center text-[0.7rem] text-white/45 pointer-events-none">
            Drag the sound around you
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <p className="sg-eyebrow mb-3 lg:mb-5">360 Audio</p>
          <h2 className="sg-title">
            Sound all <strong className="sg-ai">around you.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-w-md">
            360 Audio with head tracking places sound in the space around you. Turn your head and it stays where it
            belongs, like a real room.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={toggle} className={`sg-btn ${playing ? 'sg-btn--ghost' : ''}`} aria-pressed={playing}>
              {playing ? 'Stop' : 'Listen in 360'}
            </button>
            <button
              onClick={() => setTracking((v) => !v)}
              aria-pressed={tracking}
              className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 pl-2 pr-5 py-2 text-sm"
            >
              <span className={`relative w-11 h-6 rounded-full transition-colors ${tracking ? 'bg-teal-400' : 'bg-white/20'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${tracking ? 'translate-x-5' : ''}`} />
              </span>
              Head tracking {tracking ? 'on' : 'off'}
            </button>
          </div>
          <p className="mt-4 text-sm text-white/55 max-w-md">
            <span className="max-lg:hidden">Move your pointer around the circle to turn your head. </span>
            <span className="lg:hidden">
              {gyro ? 'Turn your phone to turn your head.' : (
                <button onClick={enableGyro} className="underline underline-offset-4">
                  Use your phone&apos;s motion to turn your head
                </button>
              )}
            </span>{' '}
            {tracking ? 'With tracking on, the sound stays put.' : 'With tracking off, the sound turns with you.'}
          </p>
          <p className="mt-3 text-xs text-white/40">
            Use headphones. Sound is synthesized and positioned in your browser. 360 Audio requires a compatible Galaxy
            device.
          </p>
        </div>
      </div>
    </section>
  );
}
