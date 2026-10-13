# Galaxy Buds4 Pro — Concept Site

An interactive, scroll-driven product page for the Samsung Galaxy Buds4 Pro, built with Next.js, React Three Fiber and GSAP. The case opens as you scroll, the earbuds lift out and turn to show their blade, and every feature has its own live demo, including noise cancelling you can actually hear.

> Fan-made concept. Not affiliated with or endorsed by Samsung.

![Hero](docs/screenshots/desktop-hero.jpg)

## Highlights

- **Scroll-driven 3D story:** a single real-time model carries the page. The clamshell lid swings open on a real hinge, the earbuds rise out of the cradle, the case drops away and the buds turn to face you.
- **Interactive hotspots:** labels pinned to points on the 3D earbud (metal blade, pinch control, canal fit) that follow it as it moves.
- **Hear the ANC:** switch between Off, Ambient and Adaptive ANC while a city soundscape and music play. All of it is synthesized live with the Web Audio API, no audio files.
- **360 Audio you can hear:** a melody positioned around your head with HRTF spatial audio. Drag the sound around you, and turn your head with the pointer or, on a phone, with the gyroscope. With head tracking on, the sound stays put in the room.
- **Pinch controls:** pinch, double pinch, triple pinch, hold or swipe on the engraved spot of the blade, and a "now playing" card reacts.
- **Wireless charging:** the closed case lands on a charging pad as you scroll, the pad lights up and the charge fills.
- **Hi-Fi slider:** drag between a stepped low-resolution waveform and a smooth 24-bit / 96 kHz one.
- **Super Clear Call:** a live voice waveform that shows the background noise drop away when you toggle the feature.
- **Battery and IP57:** rings that fill as you scroll, plus an animated rain field.
- **Colors + AR:** switch between White, Black and Pink Gold, spin the case, then place it on your desk at real size (51 × 51 × 28.3 mm) in AR.
- **Drag to spin** in the hero and in the color picker, with inertia and a soft snap back.
- **Buds4 Pro vs Buds3 Pro:** headline gains and a side-by-side spec table that reveals row by row.
- **Section dots:** a side navigator that shows where you are and jumps to any section.
- **Watch the film:** one button runs the whole page as an auto-scrolling tour you can pause or exit.
- **Galaxy ecosystem:** links to its sister projects, the [Galaxy S26 Ultra](https://s26-ultra-concept.vercel.app) and [Galaxy Watch Ultra2](https://watch-ultra2-concept.vercel.app) concept sites.

## Screenshots

| | |
|---|---|
| ![Open](docs/screenshots/desktop-open.jpg) | ![Design](docs/screenshots/desktop-design.jpg) |
| **The case opens** as you scroll | **Design hotspots** pinned to the 3D earbud |
| ![Sound](docs/screenshots/desktop-sound.jpg) | ![ANC](docs/screenshots/desktop-anc.jpg) |
| **Two drivers:** 11 mm woofer + 5.5 mm tweeter | **Adaptive ANC:** see and hear it |
| ![360 Audio](docs/screenshots/desktop-spatial.jpg) | ![Hi-Fi](docs/screenshots/desktop-hifi.jpg) |
| **360 Audio:** drag the sound, turn your head | **24-bit / 96 kHz:** drag to compare |
| ![Pinch controls](docs/screenshots/desktop-controls.jpg) | ![Calls](docs/screenshots/desktop-calls.jpg) |
| **Pinch controls:** try the gestures | **Super Clear Call:** noise removed |
| ![Battery](docs/screenshots/desktop-battery.jpg) | ![Wireless charging](docs/screenshots/desktop-charging.jpg) |
| **Battery:** 6 h, 26 h with the case | **Wireless charging:** the case lands on a pad |
| ![IP57](docs/screenshots/desktop-water.jpg) | ![Compare](docs/screenshots/desktop-compare.jpg) |
| **IP57** earbuds | **Compare:** Buds4 Pro vs Buds3 Pro |
| ![Ecosystem](docs/screenshots/desktop-ecosystem.jpg) | |
| **Galaxy ecosystem:** better with S26 Ultra | |
| ![Colors](docs/screenshots/desktop-colors.jpg) | ![AR](docs/screenshots/desktop-ar.jpg) |
| **Colors:** White, Black and Pink Gold | **AR:** place it on your desk |

### Mobile

<p>
  <img src="docs/screenshots/mobile-hero.jpg" width="24%" alt="Mobile hero" />
  <img src="docs/screenshots/mobile-design.jpg" width="24%" alt="Mobile design" />
  <img src="docs/screenshots/mobile-anc.jpg" width="24%" alt="Mobile ANC" />
  <img src="docs/screenshots/mobile-colors.jpg" width="24%" alt="Mobile colors" />
</p>

## How it works

- **Model pipeline:** the source model ships both earbuds as one mesh and a lid with no hinge. A [glTF Transform](https://gltf-transform.dev) script splits the earbuds into left and right by geometry, renames the parts and Draco-compresses the file (2.1 MB to 224 KB). A second script makes the AR files at real scale, without Draco or transmission, one per color.
- **Rigging at runtime:** the lid is re-parented to a pivot on its back edge, and each earbud to a pivot at its own center, so the scroll timeline only animates a handful of numbers.
- **One timeline:** GSAP ScrollTrigger scrubs a single pose object (case position, scale and rotation, lid angle, earbud lift, spread and tilt). Desktop and mobile get their own poses via `gsap.matchMedia`.
- **Performance:** one shared canvas for the story, which stops rendering once it scrolls out of view. The glass lid uses a light clear-coat material instead of real transmission. Canvas 2D demos only animate while visible. Adaptive pixel ratio. Respects `prefers-reduced-motion`.

## Tech stack

- [Next.js 16](https://nextjs.org), React 19, TypeScript, [Tailwind CSS v4](https://tailwindcss.com)
- [three.js](https://threejs.org), [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- [GSAP ScrollTrigger](https://gsap.com/scrolltrigger), [Lenis](https://lenis.darkroom.engineering)
- Web Audio API (synthesis, HRTF spatial audio), Device Orientation API, Canvas 2D
- [&lt;model-viewer&gt;](https://modelviewer.dev) for AR

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). AR needs HTTPS on a real phone, so test it on a deployed URL.

## Credits

- Specifications: Samsung's Galaxy Buds4 series announcement and product pages.
- 3D model: ["SUMSUNG Buds 4 Pro"](https://sketchfab.com/3d-models/sumsung-buds-4-pro-67456ae938ac40d8999b27266a59189d) by [zhe_kan](https://sketchfab.com/zhe_kan) on Sketchfab, licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Modified: earbuds separated, lid rigged, materials adjusted, compressed. The modified model files in `public/model` are shared under the same license.
- [&lt;model-viewer&gt;](https://github.com/google/model-viewer) by Google, Apache-2.0.
- Font: [Outfit](https://fonts.google.com/specimen/Outfit) (SIL Open Font License).

Samsung, Galaxy and related marks are trademarks of Samsung Electronics Co., Ltd. This is a non-commercial portfolio project.

Designed and built by **Hasan Alp Güngör**.
