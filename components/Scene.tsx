'use client';

import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { Html, PerformanceMonitor } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/lenis';
import { prefersReducedMotion } from '@/lib/useReducedMotion';
import { RimLight, StudioEnv } from '@/components/StudioEnv';
import { poseRig, useBudsRig, type BudsRig } from '@/lib/budsModel';
import { heroSpin, stepSpin } from '@/lib/dragSpin';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

type Pose = {
  x: number;
  y: number;
  s: number;
  rx: number;
  ry: number;
  lid: number;
  lift: number;
  spread: number;
  bx: number;
  by: number;
  led: number;
  hot: number;
};

const OPEN_LID = 1.95;

const DESKTOP: Record<'hero' | 'open' | 'lift' | 'design' | 'sound', Pose> = {
  hero: { x: 0, y: -0.56, s: 1.25, rx: 0.5, ry: -0.55, lid: 0, lift: 0, spread: 0, bx: 0, by: 0, led: 0.3, hot: 0 },
  open: { x: 0.85, y: -0.5, s: 1.4, rx: 0.62, ry: -0.3, lid: OPEN_LID, lift: 0, spread: 0, bx: 0, by: 0, led: 2.4, hot: 0 },
  lift: { x: 0.85, y: -0.75, s: 1.4, rx: 0.42, ry: -0.18, lid: OPEN_LID, lift: 2.1, spread: 0.5, bx: 0.8, by: 0.2, led: 2.4, hot: 0 },
  design: { x: 0.38, y: -2.6, s: 1.9, rx: 0.08, ry: 0, lid: 0, lift: 6.8, spread: 1.15, bx: 1.57, by: 0.4, led: 0, hot: 1 },
  sound: { x: 0.95, y: -2.6, s: 1.7, rx: 0.05, ry: -0.35, lid: 0, lift: 7.7, spread: 0.85, bx: 1.57, by: 1.05, led: 0, hot: 0 },
};

const MOBILE: typeof DESKTOP = {
  hero: { x: 0, y: -0.6, s: 0.9, rx: 0.5, ry: -0.55, lid: 0, lift: 0, spread: 0, bx: 0, by: 0, led: 0.3, hot: 0 },
  open: { x: 0, y: -0.95, s: 0.8, rx: 0.62, ry: -0.3, lid: OPEN_LID, lift: 0, spread: 0, bx: 0, by: 0, led: 2.4, hot: 0 },
  lift: { x: 0, y: -1.05, s: 0.8, rx: 0.42, ry: -0.18, lid: OPEN_LID, lift: 2.1, spread: 0.5, bx: 0.8, by: 0.2, led: 2.4, hot: 0 },
  design: { x: -0.05, y: -1.95, s: 1.0, rx: 0.08, ry: 0, lid: 0, lift: 8.8, spread: 0.75, bx: 1.57, by: 0.4, led: 0, hot: 1 },
  sound: { x: 0, y: -2.4, s: 0.95, rx: 0.05, ry: -0.35, lid: 0, lift: 8.9, spread: 0.5, bx: 1.57, by: 1.05, led: 0, hot: 0 },
};

const pose: Pose = { ...DESKTOP.hero };

const HOTSPOTS = [
  { key: 'blade', title: 'Metal blade', text: 'A stabilized blade with a premium metal finish.' },
  { key: 'pinch', title: 'Pinch control', text: 'An engraved area you can find by touch.' },
  { key: 'tip', title: 'Canal fit', text: 'Seals in sound, keeps noise out.' },
] as const;

function Hotspots({ rig }: { rig: BudsRig }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const anchors = useMemo(() => {
    const b = rig.budBox;
    const c = b.getCenter(new THREE.Vector3());
    return {
      blade: new THREE.Vector3(c.x, b.max.y, b.max.z * 0.62),
      pinch: new THREE.Vector3(c.x, b.max.y * 0.9, c.z + (b.max.z - c.z) * 0.15),
      tip: new THREE.Vector3(b.max.x * 0.92, c.y, b.min.z * 0.5),
    };
  }, [rig]);

  useFrame(() => {
    const v = pose.hot;
    refs.current.forEach((el, i) => {
      if (!el) return;
      const k = Math.min(1, Math.max(0, v * 3 - i * 0.6));
      el.style.opacity = String(k);
      el.style.transform = `translateY(${(1 - k) * 10}px)`;
      el.style.visibility = k <= 0.01 ? 'hidden' : 'visible';
    });
  });

  return createPortal(
    <>
      {HOTSPOTS.map((h, i) => (
        <Html key={h.key} position={anchors[h.key]} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
          <div
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="hotspot"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <span className="hotspot__dot" />
            <span className="hotspot__line" />
            <span className="hotspot__card">
              <strong>{h.title}</strong>
              <em>{h.text}</em>
            </span>
          </div>
        </Html>
      ))}
    </>,
    rig.budR
  );
}

function Buds() {
  const rig = useBudsRig('white');
  const reduce = useMemo(() => prefersReducedMotion(), []);
  const frameRef = useRef({ ...DESKTOP.hero });

  useEffect(() => {
    document.documentElement.dataset.loaded = '1';
  }, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    stepSpin(heroSpin, dt);
    const p = pose;
    const t = state.clock.elapsedTime;
    const bob = reduce ? 0 : Math.sin(t * 1.1) * 0.025;
    const sway = reduce ? 0 : Math.sin(t * 0.9) * 0.04 * Math.min(1, p.lift / 5);
    const frame = frameRef.current;
    Object.assign(frame, p);
    frame.y = p.y + bob;
    frame.rx = p.rx + heroSpin.pitch;
    frame.ry = p.ry + heroSpin.yaw;
    poseRig(rig, frame, sway);
  });

  useGSAP(() => {
    const mm = gsap.matchMedia();
    const build = (P: typeof DESKTOP) => {
      Object.assign(pose, P.hero);
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: 'power2.inOut' },
        scrollTrigger: { trigger: '#stage', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true },
      });
      tl.to(pose, { ...P.open }, 0)
        .to(pose, { ...P.lift }, 1.6)
        .to(pose, { ...P.design, duration: 1.4 }, 2.8)
        .to(pose, { hot: 1, duration: 0.6 }, 4.2)
        .to(pose, { ...P.sound, duration: 1.2 }, 5.2)
        .to({ idle: 0 }, { idle: 1, duration: 0.6 }, 6.4);
    };
    mm.add('(min-width: 1024px)', () => build(DESKTOP));
    mm.add('(max-width: 1023px)', () => build(MOBILE));
    return () => mm.revert();
  }, []);

  return (
    <>
      <primitive object={rig.root} />
      <Hotspots rig={rig} />
    </>
  );
}

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: prefersReducedMotion() ? 1 : 0.1 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      setLenis(null);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
  return null;
}

function CameraRig() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState(1.25);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = document.getElementById('stage');
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <SmoothScroll />
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 6], fov: 30 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))} />
        <CameraRig />
        <StudioEnv intensity={0.9} />
        <RimLight />
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 4]} intensity={2.2} />
        <directionalLight position={[-4, -2, -3]} intensity={1.2} color="#7dd3fc" />
        <Suspense fallback={null}>
          <Buds />
        </Suspense>
      </Canvas>
    </>
  );
}
