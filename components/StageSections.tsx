'use client';

const DRIVERS = [
  { mm: 11, label: 'Woofer', note: 'Wider than ever on a Buds Pro, for deep, controlled bass.' },
  { mm: 5.5, label: 'Tweeter', note: 'A dedicated driver for crisp, detailed highs.' },
];

function Drivers() {
  const scale = 9;
  return (
    <div className="mt-8 lg:mt-10 flex items-end gap-6 lg:gap-10">
      {DRIVERS.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-3">
          <div className="driver" style={{ width: d.mm * scale, height: d.mm * scale }}>
            <span />
            <span />
            <span />
          </div>
          <p className="text-2xl lg:text-3xl font-semibold tabular-nums">
            {d.mm}
            <span className="text-sm text-white/50"> mm</span>
          </p>
          <p className="sg-eyebrow !text-[0.6rem]">{d.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function StageSections() {
  return (
    <>
      <section id="open" className="relative h-[200svh]">
        <div className="sticky top-0 h-svh flex items-start lg:items-center px-6 lg:px-[8%] pt-24 lg:pt-0">
          <div className="max-w-md">
            <p className="sg-eyebrow mb-3 lg:mb-5">Case</p>
            <h2 className="sg-title">
              Clear on the outside. <strong>Ready inside.</strong>
            </h2>
            <p className="sg-lead mt-4 lg:mt-6">
              A new transparent clamshell cradle makes storing and charging more intuitive. Flip it open and your Buds
              are right there.
            </p>
          </div>
        </div>
      </section>

      <section id="design" className="relative h-[250svh]">
        <div className="sticky top-0 h-svh flex items-start px-6 lg:px-[8%] pt-24 lg:pt-[18svh]">
          <div className="max-w-sm">
            <p className="sg-eyebrow mb-3 lg:mb-5">Design</p>
            <h2 className="sg-title">
              The blade, <strong>refined.</strong>
            </h2>
            <p className="sg-lead mt-4 lg:mt-6 max-lg:hidden">
              The blade is back, now stabilized and finished in metal, with an engraved spot for pinch controls. A
              canal fit seals the sound in.
            </p>
          </div>
        </div>
      </section>

      <section id="sound" className="relative h-[200svh]">
        <div className="sticky top-0 h-svh flex items-start lg:items-center px-6 lg:px-[8%] pt-24 lg:pt-0">
          <div className="max-w-md">
            <p className="sg-eyebrow mb-3 lg:mb-5">Sound</p>
            <h2 className="sg-title">
              Two drivers. <strong>One rich sound.</strong>
            </h2>
            <p className="sg-lead mt-4 lg:mt-6">
              A wider woofer raises the effective speaker area by nearly 20% over the previous generation, paired with
              a dedicated tweeter.
            </p>
            <Drivers />
          </div>
        </div>
      </section>
    </>
  );
}
