'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { RimLight, SoftShadow, StudioEnv } from '@/components/StudioEnv';
import ARViewer from '@/components/ARViewer';
import { BUDS_COLORS, applyBudsColor, poseRig, useBudsRig } from '@/lib/budsModel';
import { createSpin, stepSpin, useDragSpin } from '@/lib/dragSpin';
import { prefersReducedMotion } from '@/lib/useReducedMotion';
import { PRICE } from '@/lib/specs';

const spin = createSpin();

function Product({ color }: { color: string }) {
  const rig = useBudsRig('white');
  const invalidate = useThree((s) => s.invalidate);
  const turn = useRef(0);
  const reduce = useRef(prefersReducedMotion());

  const frame = useRef({ x: 0, y: -0.12, s: 1.25, rx: 0.42, ry: -0.5, lid: 1.95, lift: 0, spread: 0, bx: 0, by: 0, led: 2 });

  useEffect(() => {
    applyBudsColor(rig, color);
    invalidate();
  }, [rig, color, invalidate]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    stepSpin(spin, dt);
    if (!reduce.current && !spin.dragging) turn.current += dt * 0.25;
    const f = frame.current;
    f.rx = 0.42 + spin.pitch;
    f.ry = -0.5 + Math.sin(turn.current) * 0.45 + spin.yaw;
    poseRig(rig, f);
  });

  return (
    <>
      <primitive object={rig.root} />
      <SoftShadow y={-0.62} width={1.9} depth={1.2} opacity={0.55} />
    </>
  );
}

export default function ColorsSection() {
  const [color, setColor] = useState('white');
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pick = useCallback(() => spin, []);
  useDragSpin(stageRef, pick);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const mount = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '150% 0px' });
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    mount.observe(el);
    vis.observe(el);
    return () => {
      mount.disconnect();
      vis.disconnect();
    };
  }, []);

  const current = BUDS_COLORS.find((c) => c.id === color) ?? BUDS_COLORS[0];

  return (
    <section ref={sectionRef} id="colors" className="sg-ambient amb-silver relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="text-center mb-6 lg:mb-10">
        <p className="sg-eyebrow mb-3 lg:mb-5">Colors</p>
        <h2 className="sg-title">
          Pick your <strong className="sg-ai">finish.</strong>
        </h2>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 max-w-6xl mx-auto">
        <div ref={stageRef} className="relative w-full max-w-[560px] h-[44svh] lg:h-[60svh] touch-pan-y select-none cursor-grab data-[dragging]:cursor-grabbing">
          {mounted && (
            <Canvas
              frameloop={visible ? 'always' : 'never'}
              camera={{ position: [0, 0.75, 5.2], fov: 30 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ camera }) => camera.lookAt(0, -0.05, 0)}
            >
              <StudioEnv intensity={1} />
              <RimLight />
              <ambientLight intensity={0.6} />
              <directionalLight position={[3, 4, 4]} intensity={2} />
              <Suspense fallback={null}>
                <Product color={color} />
              </Suspense>
            </Canvas>
          )}
          <p className="absolute bottom-1 inset-x-0 text-center text-xs text-white/40 pointer-events-none">Drag to rotate</p>
        </div>

        <div className="w-full max-w-sm">
          <p className="text-white/50 text-sm mb-1">Galaxy Buds4 Pro</p>
          <p className="text-3xl lg:text-4xl font-semibold mb-6">{current.name}</p>
          <p className="sg-eyebrow !text-[0.65rem] mb-3">Color</p>
          <div className="flex gap-3 mb-8" role="radiogroup" aria-label="Color">
            {BUDS_COLORS.map((c) => (
              <button
                key={c.id}
                role="radio"
                aria-checked={c.id === color}
                aria-label={c.name}
                onClick={() => setColor(c.id)}
                className={`w-11 h-11 rounded-full border transition-transform ${
                  c.id === color ? 'border-white scale-110 ring-2 ring-white/40 ring-offset-2 ring-offset-black' : 'border-white/25'
                }`}
                style={{ background: c.swatch }}
              />
            ))}
          </div>
          <div className="flex items-end justify-between border-t border-white/10 pt-5 mb-5">
            <div>
              <p className="text-white/50 text-sm">Price</p>
              <p className="text-3xl font-semibold tabular-nums">{PRICE}</p>
            </div>
            <a href="#specs" className="sg-btn">
              Continue
            </a>
          </div>
          <ARViewer colorId={current.id} colorName={current.name} className="w-full justify-center" />
          <p className="mt-4 text-[0.7rem] text-white/40">Samsung US list price at launch. Availability and colors vary by market.</p>
        </div>
      </div>
    </section>
  );
}
