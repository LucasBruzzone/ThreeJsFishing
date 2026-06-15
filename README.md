# ThreeJsFishing

An interactive scroll-driven Three.js experience: a sunset beach, a fishing cast, a splash, and a descent through five underwater zones. Built with React Three Fiber, GLSL shaders, and a single 0–1 scroll progress value flowing from Lenis to every component.

## Demo

Run it locally (instructions below). Scroll slowly: a fishing character casts a line on the beach at sunset, a candle hooks off the rod, flies into the ocean, and descends through five atmospheric zones illuminated by its flame.

## What's interesting in here

- **Single ref for every scroll-driven motion.** `MutableRefObject<number>` holds the 0–1 progress; every `useFrame` callback reads from it. Zero React state in the render loop, zero re-renders during scroll.
- **Mathematically locked cast release.** The hook detaches from the rod at the exact frame of peak hand-bone velocity in the Mixamo cast clip (measured by sampling). The release scroll position is derived at module load from the animation clip fraction and zone count, so all three timings stay in sync forever. See `src/three/config/hookTrajectory.ts`.
- **Five-zone fog/lighting/post pipeline.** Each zone has its own fog color, ambient + directional lights, bloom intensity, chromatic aberration. `useZoneTransition()` interpolates everything based on scroll position.
- **Frame-order matters.** The camera follows the hook. If `SceneController` runs before `FishingRod` writes `hookWorldPosition`, the camera lags by one frame and the descent judders. Scene-graph order is deliberate; see comment in `src/three/scenes/WorldScene.tsx`.
- **Custom GLSL shaders** for the flame, sunset sky, water surface, sun halo, and particle systems.

## Tech stack

| Layer | Library |
|---|---|
| Build | Vite + `vite-plugin-glsl` |
| UI | React 18 + TypeScript (strict) |
| 3D | Three.js + react-three-fiber + drei |
| Post-processing | @react-three/postprocessing |
| Scroll | Lenis |

## Run locally

```bash
npm install --legacy-peer-deps
npm run dev
```

Opens at `http://localhost:5173` (or 5174 if 5173 is in use).

```bash
npm run build      # production bundle
npm run preview    # serve the production build locally
npm run lint
```

## Project layout

```
src/
├── App.tsx                     # Lenis init, scroll ref, mounts WorldScene
├── App.module.css              # section heights (drives total scroll length)
├── components/
│   └── DepthIndicator.tsx      # right-side dot indicator for current zone
├── three/
│   ├── scenes/
│   │   └── WorldScene.tsx      # single R3F Canvas; ORDER matters here
│   ├── config/
│   │   ├── zones.ts            # five zone definitions (camera, fog)
│   │   ├── lighting.ts         # per-zone ambient + directional lights
│   │   ├── postprocessing.ts   # per-zone bloom / chroma / vignette
│   │   ├── hookTrajectory.ts   # scroll milestones + flightArc + descentEase
│   │   └── sun.ts              # sun world position
│   ├── state/
│   │   └── hookState.ts        # shared Vector3s (hook + rod tip world pos)
│   ├── hooks/
│   │   ├── useScrollProgress.ts
│   │   └── useZoneTransition.ts
│   ├── objects/                # one component per visual element
│   │   ├── SceneController.tsx
│   │   ├── BeachScene.tsx
│   │   ├── FishingCharacter.tsx
│   │   ├── FishingRod.tsx
│   │   ├── Candle.tsx
│   │   ├── HookLine.tsx
│   │   ├── Splash.tsx
│   │   ├── Bubbles.tsx
│   │   ├── Sun.tsx
│   │   ├── SunsetSky.tsx
│   │   ├── SunsetParticles.tsx
│   │   ├── ForestParticles.tsx
│   │   ├── UnderwaterParticles.tsx
│   │   ├── DynamicBloom.tsx
│   │   └── PalmTree.tsx
│   └── shaders/                # GLSL files (imported via vite-plugin-glsl)
└── public/
    └── models/                 # fishing-idle.glb, fishing-cast.glb, candle.glb
```

A deeper writeup lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Credits

- Character animations: [Mixamo](https://mixamo.com) (`fishing-idle.glb`, `fishing-cast.glb`).
- Candle model: [Sketchfab](https://sketchfab.com) — "Candle Low" by Batuhan13 (CC license).
- Smooth scroll: [Lenis](https://github.com/darkroomengineering/lenis).

## License

MIT — see [LICENSE](./LICENSE).
