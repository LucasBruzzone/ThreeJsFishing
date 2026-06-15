# Architecture

A deep dive into how ThreeJsFishing is wired together. Reads top-down — start at the scroll source, end at the render passes.

## 1. Tech stack

| Dep | Why it's here |
|---|---|
| Vite + `vite-plugin-glsl` | Fast ESM bundling, GLSL files import as strings. |
| React 18 + TypeScript strict | UI shell; type safety across all scroll-driven hooks. |
| Three.js 0.169 | Core 3D engine. |
| react-three-fiber 8.17 | Declarative scene graph + `useFrame` per-frame callback. |
| drei 9.114 | `useGLTF`, `useAnimations`, `Environment`, ergonomics. |
| @react-three/postprocessing 2.16 + postprocessing 6.36 | EffectComposer, Bloom, ChromaticAberration, Vignette, Noise. |
| Lenis 1.1 | Smooth wheel scroll; emits normalized `progress` (0–1). |
| Howler, GSAP, maath | Installed for future use, currently unused. |

## 2. Top-level wiring: scroll progress flow

```
src/main.tsx → App.tsx → WorldScene.tsx → Canvas children
```

Path of the scroll value:

1. `src/three/hooks/useScrollProgress.ts` creates `progressRef: MutableRefObject<number>` initialized to `0`. Inside `useEffect`, a Lenis instance is spawned. Every `scroll` event writes `instance.progress` into `progressRef.current`. A `requestAnimationFrame` loop drives Lenis's RAF ticker.
2. `src/App.tsx:11` calls `useScrollProgress()` and passes the ref to `<WorldScene>`. A separate `useEffect` reads the ref via RAF and calls `setActiveZone(currentZone)` only when the zone index actually changes, so only the `<DepthIndicator>` re-renders.
3. Every `useFrame` callback inside the Canvas reads `scrollRef.current`. No subscriptions, no re-renders.

**Why a ref instead of state?** Scroll fires at display refresh rate (60–120 Hz). Setting state on every event would re-render the whole tree. A ref is a stable container; mutation doesn't trigger React reconciliation. Three.js animations happen inside `useFrame`, fully decoupled.

## 3. Scene graph: component order is part of the API

`src/three/scenes/WorldScene.tsx:42-55` mounts these children, in this order:

1. `SunsetSky` — gradient sky sphere; fades out as you leave zone 0
2. `BeachScene` → contains `FishingCharacter` → contains `FishingRod`
3. `Candle` — the "hook"; reads `hookWorldPosition`
4. `HookLine` — rope from candle to rod tip
5. **`SceneController` — camera + lights + fog**
6. `SunsetParticles`, `ForestParticles`, `UnderwaterParticles`, `Bubbles`, `Splash` (visual atmospheres)

**Why this order?** r3f executes `useFrame` callbacks in JSX/mount order. `FishingRod` *writes* `hookWorldPosition`; `Candle` and `SceneController` *read* it. If `SceneController` runs before `FishingRod`, the camera follows last frame's hook position — visible as judder during the descent. Mounting `BeachScene + Candle` before `SceneController` guarantees fresh data per frame.

## 4. Scroll-driven state: hook lifecycle

**Shared state** (`src/three/state/hookState.ts`):
- `hookWorldPosition: Vector3` — written by `FishingRod`, read by `Candle`, `HookLine`, `SceneController`.
- `rodTipWorldPosition: Vector3` — written by `FishingRod`, read by `HookLine`.

**Lifecycle phases** (`src/three/config/hookTrajectory.ts`, consumed in `FishingRod.tsx:74-92`):

| Phase | Scroll range | Hook position |
|---|---|---|
| Hang | `0 → HOOK_HANG_END` | rod tip − 0.85 Y (dangle from rod) |
| Flight | `HOOK_HANG_END → HOOK_SPLASH_T` | quadratic Bézier from launchPoint to `HOOK_SPLASH_POINT` |
| Sink | `HOOK_SPLASH_T → HOOK_SINK_END` | eased lerp from splash point to `HOOK_SINK_END_POINT` |
| Rest | `> HOOK_SINK_END` | `HOOK_SINK_END_POINT` |

**The release-timing derivation** (`hookTrajectory.ts:22`):
```ts
export const HOOK_HANG_END = (CAST_RELEASE_CLIP_FRAC * CAST_SCRUB_END) / (ZONE_COUNT - 1)
```
Translated to English: the Mixamo cast clip reaches peak hand-bone velocity at clip fraction `0.22` (measured by sampling the bone position at 50 evenly-spaced times). `FishingCharacter` maps zone-0 progress to clip fraction via `clipFrac = blend / CAST_SCRUB_END`, where `blend = scroll * (ZONE_COUNT - 1)`. Solving for the scroll value at which the clip is at frame 0.22 gives `≈ 0.052`. Computing this at module init means: tune the scrub end, change the zone count, swap the clip — and the rod, hook, character, and camera all stay locked to the same release instant.

**Quadratic Bézier without per-frame allocation** (`hookTrajectory.ts:37-55`): module-scope scratch vectors (`apexScratch`, `lerpedStart`, `lerpedEnd`) are mutated in `flightArc()`. Allocating three new `Vector3`s every frame at 60 fps would create GC pressure.

## 5. Zones, lighting, post-processing

Five zones (`src/three/config/zones.ts`): **sunset → surface → shallow → mid → abyss**. Each has `cameraPosition`, `cameraTarget`, `fogColor`, `fogNear`, `fogFar`. Y values range from `+1.4` (beach) to `-50` (abyss target).

`WATER_SURFACE_Y = -1.15` is exported from `zones.ts` as the single source of truth. `BeachScene` positions the ocean plane there; `HookLine` uses it to switch the rope from "diagonal to rod tip" to "straight up" once the candle crosses it.

`useZoneTransition(progress)` (`src/three/hooks/useZoneTransition.ts`):
```ts
const scaled = progress * (ZONE_COUNT - 1)
const currentZone = Math.min(Math.floor(scaled), ZONE_COUNT - 2)
const blend = scaled - currentZone  // 0–1 within the current pair
```
Every visual element calls this and lerps its own config between `currentZone` and `nextZone`. Examples:
- `SceneController.tsx:55-82`: fog color/near/far, ambient + directional light color/intensity/position.
- `DynamicBloom.tsx`: bloom intensity, threshold, radius.

Lighting per zone (`src/three/config/lighting.ts`) shifts from warm sunset (`#fde8c0` ambient, `#f5a623` directional) to cold abyss (`#000408` ambient, `#00aaff` directional cyan). Post (`postprocessing.ts`) ramps bloom from `0.4` in sunset to `1.2` in abyss so the candle flame pierces the dark.

## 6. Animation pipeline

Two Mixamo clips loaded via drei `useGLTF`:
- `fishing-idle.glb` — looped idle; weight stays at 1 except during cast.
- `fishing-cast.glb` — one-shot cast motion; `paused = true`, scrubbed by setting `castAction.time` every frame.

`FishingCharacter.tsx:39-59`:
1. If `currentZone !== 0`, idle weight = 1, cast weight = 0 (no cast outside the hero).
2. Otherwise, `clipProgress = clamp(blend / CAST_SCRUB_END, 0, 1)`.
3. `castAction.time = clipProgress * castAction.getClip().duration` — scrub to a specific frame.
4. Weight hard-switches at `blend > 0.03` (frame 0 of cast clip is a T-pose-ish neutral; blending through it produces an "arms-out limbo" artifact).

Scrubbing instead of `play()` is essential: scroll can move forward and backward; the animation has to follow.

## 7. Rod + candle + rope

**Rod attachment** (`FishingRod.tsx:40-65`): on mount, the component traverses the character skeleton, finds the bone whose name ends in `RightHand` (excluding finger bones), and `.add()`s the rod group as a child. Rod position/rotation in the bone's local frame are then static.

**Per-frame** (`FishingRod.tsx:67-93`): the rod group is forced to update its world matrix; `ROD_TIP_LOCAL` (a fixed point at `0.85 * ROD_LENGTH` along the rod) is multiplied by the world matrix to extract `rodTipWorldPosition`. The phase machine then writes `hookWorldPosition` (hang, flightArc, descentEase, or rest depending on scroll).

**Candle** (`Candle.tsx`):
- `groupRef.position.copy(hookWorldPosition)` every frame.
- During flight, rotates the candle to face velocity (`Quaternion.setFromUnitVectors(VERTICAL, velocity.normalize())`).
- Scales from `0.5` (compact during cast) to `1.0` (full size underwater) over a `0.04`-scroll window after splash.
- Two lights: a `pointLight` for omnidirectional warm glow (intensity ramps from `1.2` to `18` post-splash), and a `spotLight` for the downward cone (the spotLight target is assigned in a `useEffect` because passing `target={ref.current}` captures `null` on first render and never re-applies).
- Custom flame shader; `uTime` uniform drives wobble + flicker.

**Rope** (`HookLine.tsx`):
- Underwater (`hookWorldPosition.y < WATER_SURFACE_Y`): anchored at the candle's TOP (`hookWorldPosition + CANDLE_HEIGHT`) and goes straight up. Anchoring at the base would route the line geometrically through the candle body, visible when reeling.
- Above water: anchored at `hookWorldPosition`, points at `rodTipWorldPosition`. Diagonal.
- The cylinder mesh's length scale equals the distance; quaternion aligns its Y axis to the direction.

## 8. Performance decisions

- **Bubbles early-out** (`Bubbles.tsx:43-71`): when invisible (in the hero), skip the entire 220-particle update + GPU upload.
- **Module-scope scratch vectors** in `flightArc()` — no per-frame allocations.
- **No allocations inside any `useFrame`** — every `Vector3`, `Quaternion`, `Color` is `useMemo`'d or module-scope. Particle position arrays are pre-allocated via `useMemo` and mutated in-place.
- **DPR clamp `[1, 1.5]`** (`WorldScene.tsx:33`): caps rendering at 1.5× device pixel ratio. Skips wasted work on retina screens for an effect that doesn't benefit from 3× sharpness.
- **`antialias: false`** — motion + bloom mask aliasing for free.
- **`powerPreference: 'high-performance'`** — hints WebGL to use the discrete GPU on laptops.

## 9. Custom shaders

All in `src/three/shaders/`, imported as strings via `vite-plugin-glsl`.

| Shader | Purpose |
|---|---|
| `flame.{vert,frag}.glsl` | Wobble + flicker; additive blending. Drives the candle flame. |
| `sunsetSky.{vert,frag}.glsl` | Vertical gradient sky sphere with `uOpacity` fade. |
| `sunHalo.{vert,frag}.glsl` | Radial falloff for the sun's two halo planes. |
| `water.{vert,frag}.glsl` | Layered sine wave displacement + sun reflection + foam. |
| `sunsetParticles.*` / `forestParticles.*` / `underwaterParticles.*` | Soft circular sprites with per-zone color drift. |

## 10. Known limitations

- **Audio not wired.** Howler is installed but no SFX integration. Splash, wind, underwater ambience would all fit naturally.
- **Mobile not tuned.** Touch scroll works via Lenis, but no DPR / particle-count / shader-quality tier; lower-end devices will struggle.
- **No model LOD or progressive loading.** Models preload synchronously via drei; slow connections see a blank screen.
- **No reverse-scroll polish.** The cast animation scrubs cleanly backward but the spot light + bubble fades aren't designed for it.
- **Third-party assets bundled.** The Mixamo and Sketchfab models are in `public/models/` — keep their licenses in mind if forking.
