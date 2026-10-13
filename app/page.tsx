'use client';

import Scene from '@/components/Scene';
import HeroGlow from '@/components/HeroGlow';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ScrollProgress';
import HeadlineReveal from '@/components/HeadlineReveal';
import AmbientPause from '@/components/AmbientPause';
import FilmTour from '@/components/FilmTour';
import Hero from '@/components/Hero';
import StageSections from '@/components/StageSections';
import AncSection from '@/components/AncSection';
import SpatialSection from '@/components/SpatialSection';
import ControlsSection from '@/components/ControlsSection';
import ChargingSection from '@/components/ChargingSection';
import EcosystemSection from '@/components/EcosystemSection';
import HiFiSection from '@/components/HiFiSection';
import CallSection from '@/components/CallSection';
import BatterySection from '@/components/BatterySection';
import WaterSection from '@/components/WaterSection';
import ColorsSection from '@/components/ColorsSection';
import Specs from '@/components/Specs';

export default function Home() {
  return (
    <>
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-black focus:font-semibold"
      >
        Skip to content
      </a>
      <Navbar />
      <ScrollProgress />
      <HeadlineReveal />
      <AmbientPause />
      <FilmTour />

      <main id="stage" className="relative w-full bg-[#030303]">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <HeroGlow />
          <Scene />
        </div>
        <div className="relative z-10">
          <Hero />
          <StageSections />
        </div>
      </main>

      <AncSection />
      <SpatialSection />
      <HiFiSection />
      <ControlsSection />
      <CallSection />
      <BatterySection />
      <ChargingSection />
      <WaterSection />
      <ColorsSection />
      <EcosystemSection />
      <Specs />
    </>
  );
}
