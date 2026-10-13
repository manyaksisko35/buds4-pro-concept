'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RimLight, SoftShadow, StudioEnv } from '@/components/StudioEnv';
import { poseRig, useBudsRig } from '@/lib/budsModel';

const progress = { p: 0 };
let requestFrame: () => void = () => {};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};

function Bridge() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    requestFrame = () => invalidate();
    invalidate();
    return () => {
      requestFrame = () => {};
    };
  }, [invalidate]);
  return null;
}

function Pad() {
  const ring = useRef<THREE.MeshStandardMaterial>(null);
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.6, metalness: 0.2 }), []);
  useFrame(() => {
    const m = ring.current;
    if (!m) return;
    m.emissiveIntensity = 0.2 + smooth((progress.p - 0.3) / 0.15) * 2.4;
  });
  return (
    <group position={[0, -0.42, 0]}>
      <mesh material={body}>
        <cylinderGeometry args={[0.95, 1.0, 0.08, 64]} />
      </mesh>
      <mesh position={[0, 0.041, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.78, 0.84, 64]} />
        <meshStandardMaterial ref={ring} color="#0f172a" emissive="#5eead4" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function ChargingCase() {
  const rig = useBudsRig('white');
  const frame = useRef({ x: 0, y: 1.6, s: 1.15, rx: 0.32, ry: -0.9, lid: 0, lift: 0, spread: 0, bx: 0, by: 0, led: 0 });
  const shadow = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progress.p;
    const land = smooth(p / 0.32);
    const f = frame.current;
    const restY = -0.42 + 0.042 + (rig.height * f.s) / 2;
    f.y = THREE.MathUtils.lerp(1.9, restY, land);
    f.ry = -0.9 + land * 0.55;
    f.rx = 0.32 * (1 - land);
    f.led = smooth((p - 0.3) / 0.1) * (0.6 + 0.4 * Math.sin(p * 60));
    poseRig(rig, f);
    const sh = shadow.current;
    if (sh) {
      sh.visible = land > 0.05;
      sh.scale.setScalar(0.6 + land * 0.4);
    }
  });

  return (
    <>
      <primitive object={rig.root} />
      <group ref={shadow} position={[0, -0.375, 0]}>
        <SoftShadow y={0} width={1.4} depth={1.1} opacity={0.55} />
      </group>
    </>
  );
}

export default function ChargingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const mount = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '150% 0px' });
    const vis = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '20% 0px' });
    mount.observe(el);
    vis.observe(el);
    return () => {
      mount.disconnect();
      vis.disconnect();
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const sec = sectionRef.current;
      if (!sec) return;
      const p = clamp01(-sec.getBoundingClientRect().top / Math.max(1, sec.offsetHeight - window.innerHeight));
      if (p === progress.p) return;
      progress.p = p;
      requestFrame();
      const charge = Math.round(18 + smooth((p - 0.35) / 0.55) * 82);
      if (pctRef.current) pctRef.current.textContent = String(charge);
      if (barRef.current) barRef.current.style.transform = `scaleX(${charge / 100})`;
      if (statusRef.current) statusRef.current.textContent = p < 0.3 ? 'Place the case on the pad' : charge >= 100 ? 'Fully charged' : 'Charging wirelessly';
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
    <section ref={sectionRef} id="charging" className="relative z-10 h-[220svh] bg-[#030303]">
      <div className="sg-ambient amb-cyan sticky top-0 h-svh flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-16 px-6 lg:px-[8%] pt-20 pb-8">
        <div className="max-w-md lg:order-2 text-center lg:text-left">
          <p className="sg-eyebrow mb-3 lg:mb-5">Wireless charging</p>
          <h2 className="sg-title">
            Just set it <strong className="sg-ai">down.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-lg:hidden">
            The case charges over USB-C or wirelessly. Drop it on a charging pad and the light lets you know it&apos;s
            topping up.
          </p>
          <div className="mt-6 lg:mt-8 sg-card !rounded-2xl px-5 py-4 text-left">
            <div className="flex items-baseline justify-between">
              <span ref={statusRef} className="text-sm text-white/60">
                Place the case on the pad
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                <span ref={pctRef}>18</span>
                <span className="text-sm text-white/50">%</span>
              </span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div ref={barRef} className="h-full origin-left rounded-full bg-gradient-to-r from-teal-300 to-sky-400" style={{ transform: 'scaleX(0.18)' }} />
            </div>
          </div>
          <p className="mt-3 text-[0.7rem] text-white/40">Illustration. Wireless charger sold separately.</p>
        </div>

        <div className="relative w-full max-w-[560px] h-[42svh] lg:h-[62svh] lg:order-1">
          {mounted && (
            <Canvas
              frameloop={near ? 'demand' : 'never'}
              camera={{ position: [0, 1.5, 4.6], fov: 30 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
            >
              <Bridge />
              <StudioEnv intensity={0.9} />
              <RimLight />
              <ambientLight intensity={0.6} />
              <directionalLight position={[3, 4, 4]} intensity={2} />
              <Pad />
              <Suspense fallback={null}>
                <ChargingCase />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>
    </section>
  );
}
