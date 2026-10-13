import Image from 'next/image';
import { S26_SITE } from '@/lib/links';

const PERKS = [
  { title: '24-bit Hi-Fi', text: 'Samsung Seamless Codec streams up to 24-bit / 96 kHz from a Galaxy phone.' },
  { title: 'Super Clear Call', text: 'Super wideband calls on compatible Galaxy devices.' },
  { title: '360 Audio', text: 'Head-tracked spatial sound with compatible Galaxy devices.' },
];

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="sg-ambient amb-violet relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto">
        <p className="sg-eyebrow mb-3 lg:mb-5">Galaxy ecosystem</p>
        <h2 className="sg-title max-w-3xl">
          Better with <strong className="sg-ai">Galaxy S26 Ultra.</strong>
        </h2>
        <div className="mt-10 lg:mt-14 grid lg:grid-cols-[1.25fr_1fr] gap-6 lg:gap-10 items-stretch">
          <a
            href={S26_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-[28px] border border-white/10"
          >
            <Image
              src="/ecosystem/s26-ultra.webp"
              alt="Galaxy S26 Ultra concept site"
              width={960}
              height={600}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7 bg-gradient-to-t from-black/85 to-transparent flex items-end justify-between gap-4">
              <div>
                <p className="sg-eyebrow !text-[0.6rem] mb-1">Concept</p>
                <p className="text-xl lg:text-2xl font-semibold">Galaxy S26 Ultra</p>
              </div>
              <span className="sg-btn !py-2.5 !px-5 text-sm shrink-0">
                Explore
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <path d="M3 9L9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.6" fill="none" />
                </svg>
              </span>
            </div>
          </a>
          <div className="grid gap-3 content-center">
            {PERKS.map((p) => (
              <div key={p.title} className="sg-card !rounded-2xl px-5 py-4">
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-white/55 font-light mt-1">{p.text}</p>
              </div>
            ))}
            <p className="text-xs text-white/40 mt-1">Feature availability depends on device and software version.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
