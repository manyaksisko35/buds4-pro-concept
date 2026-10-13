import { SPECS } from '@/lib/specs';

export default function Specs() {
  return (
    <section id="specs" className="relative z-10 bg-[#030303] px-6 lg:px-[8%] pt-24 lg:pt-32 pb-12">
      <div className="max-w-6xl mx-auto">
        <p className="sg-eyebrow mb-3 lg:mb-5">Specs</p>
        <h2 className="sg-title mb-10 lg:mb-16">
          Galaxy Buds4 <strong>Pro</strong>
        </h2>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
          {SPECS.map((g) => (
            <div key={g.group}>
              <h3 className="text-lg font-semibold mb-3">{g.group}</h3>
              <dl className="divide-y divide-white/10 border-y border-white/10">
                {g.rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[0.9fr_1.4fr] gap-4 py-3 text-sm">
                    <dt className="text-white/50 font-light">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-white/40 max-w-3xl">
          Specifications from Samsung&apos;s Galaxy Buds4 series announcement and product pages. Some features need a
          compatible Galaxy device.
        </p>

        <footer className="mt-20 lg:mt-28 pt-8 border-t border-white/10 flex flex-col gap-2 md:flex-row md:justify-between text-xs text-white/60">
          <span className="tracking-[0.3em]">SAMSUNG</span>
          <span className="md:text-right">
            Fan-made concept. Not affiliated with Samsung. Designed and built by Hasan Alp Güngör.
            <br />
            3D model:{' '}
            <a
              href="https://sketchfab.com/3d-models/sumsung-buds-4-pro-67456ae938ac40d8999b27266a59189d"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              &quot;SUMSUNG Buds 4 Pro&quot;
            </a>{' '}
            by{' '}
            <a href="https://sketchfab.com/zhe_kan" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              zhe_kan
            </a>
            , licensed under{' '}
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              CC BY-NC-SA 4.0
            </a>
            ; modified (earbuds separated, lid rigged, compressed).
          </span>
        </footer>
      </div>
    </section>
  );
}
