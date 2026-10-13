const DROPS = Array.from({ length: 36 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * n) * 10000;
    return x - Math.floor(x);
  };
  const q = (v: number) => Math.round(v * 100) / 100;
  return { left: q(r(12.9) * 100), delay: q(r(78.2) * 3), dur: q(1.6 + r(39.4) * 1.6), size: Math.round(4 + r(5.1) * 6) };
});

export default function WaterSection() {
  return (
    <section id="water" className="sg-ambient amb-night relative z-10 bg-[#030303] overflow-hidden px-6 lg:px-[8%] py-28 lg:py-40">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {DROPS.map((d, i) => (
          <span
            key={i}
            className="drop"
            style={{ left: `${d.left}%`, width: d.size, height: d.size * 1.6, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
          />
        ))}
      </div>
      <div className="relative max-w-5xl mx-auto text-center">
        <p className="sg-eyebrow mb-3 lg:mb-5">Durability</p>
        <p className="sg-title text-[24vw] lg:text-[13rem] leading-none sg-ai">IP57</p>
        <h2 className="sg-title mt-4">
          Rain or sweat, <strong>keep going.</strong>
        </h2>
        <p className="sg-lead mt-4 lg:mt-6 max-w-xl mx-auto">
          The earbuds are rated IP57 for dust and water resistance, up from IP54 on Galaxy Buds4.
        </p>
        <p className="mt-6 text-xs text-white/40 max-w-lg mx-auto">
          IP57 per IEC 60529: protected against dust and temporary immersion in fresh water. The charging case is not
          water resistant. Dry the earbuds before charging.
        </p>
      </div>
    </section>
  );
}
