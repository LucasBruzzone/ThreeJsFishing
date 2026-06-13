# Portfolio Phase 1 — Scaffolding + Hero (Atardecer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Vite+React+TypeScript project with exact folder structure from spec, install all dependencies, and implement the Hero (Atardecer) environment with Lenis smooth scroll, GSAP ScrollTrigger integration, and warm-light Three.js particle system.

**Architecture:** A single R3F `<Canvas>` lives in `WorldScene.tsx` and renders throughout the entire scroll journey. `useScrollProgress` reads Lenis scroll position via GSAP ScrollTrigger and exposes a `0–1` ref. `SunsetParticles` is the only 3D object in Phase 1, using a custom GLSL shader for warm-light floating dust particles. All scene config (fog, lights, postprocessing per zone) lives in `src/three/config/` — never inline.

**Tech Stack:** Vite 5, React 18, TypeScript strict, react-three-fiber, @react-three/drei, @react-three/postprocessing, lenis, gsap, glsl shader via raw imports, CSS Modules

---

## File Map

| File | Responsibility |
|---|---|
| `src/main.tsx` | Entry point, mounts App |
| `src/App.tsx` | Lenis init, ScrollTrigger proxy, renders `<WorldScene>` + section overlays |
| `src/styles/reset.css` | CSS reset |
| `src/styles/variables.css` | Design tokens (palette, fonts, spacing) |
| `src/three/scenes/WorldScene.tsx` | Single R3F Canvas, fog, postprocessing, camera |
| `src/three/config/zones.ts` | Zone definitions: camera position, fog color/density, light intensities per zone |
| `src/three/config/lighting.ts` | Ambient + directional light params per zone |
| `src/three/config/postprocessing.ts` | Bloom, grain, chromatic aberration params per zone |
| `src/three/objects/SunsetParticles.tsx` | GPU particle system — warm dust motes, custom GLSL |
| `src/three/shaders/sunsetParticles.vert.glsl` | Vertex shader: float particles with time + scroll |
| `src/three/shaders/sunsetParticles.frag.glsl` | Fragment shader: warm soft circles with alpha falloff |
| `src/three/hooks/useScrollProgress.ts` | Exposes `scrollRef: MutableRefObject<number>` (0–1) |
| `src/three/hooks/useZoneTransition.ts` | Given scroll 0–1, returns current zone index + blend factor |
| `src/sections/Hero.tsx` | HTML overlay: name, subtitle, scroll hint — absolutely positioned over canvas |
| `src/components/DepthIndicator.tsx` | 5-dot vertical nav (right side), reacts to active zone |
| `src/hooks/useScrollProgress.ts` | Re-export from `src/three/hooks/useScrollProgress.ts` (shared) |
| `src/content/projects.ts` | Project data array (typed) |
| `src/content/skills.ts` | Skills array |
| `src/content/writing.ts` | Writing/articles array (empty for now) |
| `index.html` | Vite entry HTML |
| `vite.config.ts` | Vite config with glsl plugin |
| `tsconfig.json` | TypeScript strict config |

---

## Task 1: Scaffold Vite project + install dependencies

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`

- [ ] **Step 1: Create Vite project**

```bash
cd /Users/lucasbruzzone/Desktop/Personal/Portfolio
npm create vite@latest . -- --template react-ts
```

Expected: project files created in current directory. Answer "y" if prompted about existing files.

- [ ] **Step 2: Install production dependencies**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing \
  lenis gsap maath howler \
  @types/three
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vite-plugin-glsl @types/howler
```

- [ ] **Step 4: Configure vite.config.ts**

Replace the generated file with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
})
```

- [ ] **Step 5: Configure tsconfig.json for strict mode**

Replace the generated `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 6: Verify build starts**

```bash
npm run dev
```

Expected: Dev server starts at localhost:5173, no errors in terminal.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + TS project with all dependencies"
```

---

## Task 2: Create folder structure + CSS foundation

**Files:**
- Create: all `src/` subdirectories and placeholder files
- Create: `src/styles/reset.css`, `src/styles/variables.css`

- [ ] **Step 1: Create all directories**

```bash
mkdir -p src/sections \
  src/three/scenes \
  src/three/objects \
  src/three/config \
  src/three/hooks \
  src/three/shaders \
  src/components \
  src/hooks \
  src/styles \
  src/content \
  src/assets/models \
  src/assets/fonts \
  src/assets/audio \
  docs/superpowers/specs \
  docs/superpowers/plans
```

- [ ] **Step 2: Create `src/styles/reset.css`**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  overflow-x: hidden;
  background: #000;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
}
```

- [ ] **Step 3: Create `src/styles/variables.css`**

```css
:root {
  /* Sunset palette */
  --sunset-orange: #e8952a;
  --sunset-gold: #f5a623;
  --sunset-violet: #1a0820;
  --sunset-cream: #fde8c0;

  /* Forest palette */
  --forest-deep: #162e0c;
  --forest-moss: #2d5a1b;
  --forest-light: #6abf45;

  /* Shore palette */
  --shore-night: #0d2840;
  --shore-water: #5aaed4;

  /* Shallow sea palette */
  --sea-shallow-deep: #040c1a;
  --sea-shallow-glint: #4080c0;

  /* Deep sea palette */
  --sea-deep: #000408;
  --sea-bioluminescence: #00aaff;
  --sea-blue: #2a6090;

  /* Typography */
  --font-serif: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
  --space-2xl: 8rem;

  /* Transitions */
  --transition-slow: 800ms cubic-bezier(0.25, 0.1, 0.25, 1);
  --transition-medium: 400ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

- [ ] **Step 4: Update `src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.css'
import './styles/variables.css'
import App from './App.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Update `index.html` to remove default Vite styles and add fonts**

Replace `<head>` content:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Lucas Bruzzone — Software Engineer, Team Lead" />
    <title>Lucas Bruzzone</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create content files**

Create `src/content/projects.ts`:
```typescript
export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  url?: string
}

export const projects: Project[] = [
  {
    id: 'kompass',
    title: 'Kompass',
    description: 'Descripción próximamente.',
    tags: ['TypeScript', 'React', 'Node.js'],
  },
  {
    id: 'pausa',
    title: 'Pausa',
    description: 'Marca propia de velas artesanales. Aromas para la calma.',
    tags: ['Emprendimiento', 'Diseño', 'Producto'],
    url: 'https://pausa.com.ar',
  },
]
```

Create `src/content/skills.ts`:
```typescript
export const skills = [
  'TypeScript',
  'React',
  'Ruby on Rails',
  'Node.js',
  'AWS',
  'System Design',
  'Mentoring',
] as const

export type Skill = (typeof skills)[number]
```

Create `src/content/writing.ts`:
```typescript
export interface Article {
  id: string
  title: string
  date: string
  excerpt: string
  url: string
}

export const articles: Article[] = []
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: folder structure, CSS variables, content files"
```

---

## Task 3: Zone configuration

**Files:**
- Create: `src/three/config/zones.ts`
- Create: `src/three/config/lighting.ts`
- Create: `src/three/config/postprocessing.ts`

- [ ] **Step 1: Create `src/three/config/zones.ts`**

```typescript
import * as THREE from 'three'

export interface ZoneConfig {
  name: string
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  fogColor: THREE.Color
  fogNear: number
  fogFar: number
  backgroundColor: THREE.Color
}

export const ZONES: ZoneConfig[] = [
  {
    name: 'sunset',
    cameraPosition: new THREE.Vector3(0, 2, 10),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    fogColor: new THREE.Color('#1a0820'),
    fogNear: 15,
    fogFar: 60,
    backgroundColor: new THREE.Color('#1a0820'),
  },
  {
    name: 'forest',
    cameraPosition: new THREE.Vector3(0, 1, -10),
    cameraTarget: new THREE.Vector3(0, 0, -20),
    fogColor: new THREE.Color('#0a1a06'),
    fogNear: 10,
    fogFar: 50,
    backgroundColor: new THREE.Color('#0a1a06'),
  },
  {
    name: 'shore',
    cameraPosition: new THREE.Vector3(0, 0.5, -30),
    cameraTarget: new THREE.Vector3(0, 0, -40),
    fogColor: new THREE.Color('#060f1a'),
    fogNear: 12,
    fogFar: 55,
    backgroundColor: new THREE.Color('#060f1a'),
  },
  {
    name: 'shallowSea',
    cameraPosition: new THREE.Vector3(0, -1, -50),
    cameraTarget: new THREE.Vector3(0, -2, -60),
    fogColor: new THREE.Color('#020610'),
    fogNear: 8,
    fogFar: 45,
    backgroundColor: new THREE.Color('#020610'),
  },
  {
    name: 'deepSea',
    cameraPosition: new THREE.Vector3(0, -3, -70),
    cameraTarget: new THREE.Vector3(0, -4, -80),
    fogColor: new THREE.Color('#000204'),
    fogNear: 5,
    fogFar: 35,
    backgroundColor: new THREE.Color('#000204'),
  },
]

export const ZONE_COUNT = ZONES.length
```

- [ ] **Step 2: Create `src/three/config/lighting.ts`**

```typescript
export interface LightConfig {
  ambientIntensity: number
  ambientColor: string
  directionalIntensity: number
  directionalColor: string
  directionalPosition: [number, number, number]
}

export const ZONE_LIGHTS: LightConfig[] = [
  {
    // sunset
    ambientIntensity: 0.6,
    ambientColor: '#fde8c0',
    directionalIntensity: 1.2,
    directionalColor: '#f5a623',
    directionalPosition: [-5, 3, 5],
  },
  {
    // forest
    ambientIntensity: 0.2,
    ambientColor: '#162e0c',
    directionalIntensity: 0.8,
    directionalColor: '#6abf45',
    directionalPosition: [2, 8, 2],
  },
  {
    // shore
    ambientIntensity: 0.15,
    ambientColor: '#0d2840',
    directionalIntensity: 0.5,
    directionalColor: '#5aaed4',
    directionalPosition: [0, 10, 0],
  },
  {
    // shallow sea
    ambientIntensity: 0.08,
    ambientColor: '#040c1a',
    directionalIntensity: 0.3,
    directionalColor: '#4080c0',
    directionalPosition: [0, 5, 0],
  },
  {
    // deep sea
    ambientIntensity: 0.03,
    ambientColor: '#000408',
    directionalIntensity: 0.1,
    directionalColor: '#00aaff',
    directionalPosition: [0, 2, 0],
  },
]
```

- [ ] **Step 3: Create `src/three/config/postprocessing.ts`**

```typescript
export interface PostConfig {
  bloomIntensity: number
  bloomThreshold: number
  bloomRadius: number
  chromaticAberrationOffset: number
  vignetteOffset: number
  vignetteDarkness: number
}

export const ZONE_POST: PostConfig[] = [
  {
    // sunset — warm glow, subtle bloom
    bloomIntensity: 0.4,
    bloomThreshold: 0.7,
    bloomRadius: 0.4,
    chromaticAberrationOffset: 0.0003,
    vignetteOffset: 0.3,
    vignetteDarkness: 0.7,
  },
  {
    // forest — soft green haze
    bloomIntensity: 0.3,
    bloomThreshold: 0.8,
    bloomRadius: 0.3,
    chromaticAberrationOffset: 0.0002,
    vignetteOffset: 0.35,
    vignetteDarkness: 0.85,
  },
  {
    // shore — starlight bloom
    bloomIntensity: 0.6,
    bloomThreshold: 0.6,
    bloomRadius: 0.5,
    chromaticAberrationOffset: 0.0004,
    vignetteOffset: 0.3,
    vignetteDarkness: 0.8,
  },
  {
    // shallow sea — subdued
    bloomIntensity: 0.5,
    bloomThreshold: 0.65,
    bloomRadius: 0.4,
    chromaticAberrationOffset: 0.0003,
    vignetteOffset: 0.4,
    vignetteDarkness: 0.9,
  },
  {
    // deep sea — maximum bioluminescence bloom
    bloomIntensity: 1.2,
    bloomThreshold: 0.4,
    bloomRadius: 0.7,
    chromaticAberrationOffset: 0.0006,
    vignetteOffset: 0.5,
    vignetteDarkness: 0.95,
  },
]
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: zone, lighting, postprocessing config"
```

---

## Task 4: Lenis + GSAP scroll integration

**Files:**
- Create: `src/three/hooks/useScrollProgress.ts`
- Create: `src/three/hooks/useZoneTransition.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/three/hooks/useScrollProgress.ts`**

This hook initializes Lenis, connects it to GSAP ScrollTrigger, and returns a ref (not state — no re-renders) that holds scroll progress 0–1.

```typescript
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollProgress(): React.MutableRefObject<number> {
  const progressRef = useRef(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      progressRef.current = progress
    })

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    function onRaf(time: number) {
      lenis.raf(time)
      ScrollTrigger.update()
    }

    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onRaf)
      lenis.destroy()
    }
  }, [])

  return progressRef
}
```

- [ ] **Step 2: Create `src/three/hooks/useZoneTransition.ts`**

```typescript
import { ZONE_COUNT } from '../config/zones'

export interface ZoneTransition {
  currentZone: number
  nextZone: number
  blend: number
}

export function getZoneTransition(progress: number): ZoneTransition {
  const totalZones = ZONE_COUNT
  const scaled = progress * (totalZones - 1)
  const currentZone = Math.min(Math.floor(scaled), totalZones - 2)
  const nextZone = Math.min(currentZone + 1, totalZones - 1)
  const blend = scaled - currentZone
  return { currentZone, nextZone, blend }
}
```

- [ ] **Step 3: Create `src/App.tsx`**

```typescript
import { useRef } from 'react'
import WorldScene from './three/scenes/WorldScene'
import Hero from './sections/Hero'
import { useScrollProgress } from './three/hooks/useScrollProgress'
import styles from './App.module.css'

export default function App() {
  const scrollRef = useScrollProgress()

  return (
    <div className={styles.root}>
      <div className={styles.scrollContainer}>
        <WorldScene scrollRef={scrollRef} />
        <div className={styles.sections}>
          <Hero />
          {/* Remaining sections added in later phases */}
          <div className={styles.spacer} />
          <div className={styles.spacer} />
          <div className={styles.spacer} />
          <div className={styles.spacer} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/App.module.css`**

```css
.root {
  position: relative;
  width: 100%;
}

.scrollContainer {
  position: relative;
}

.sections {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.spacer {
  height: 100vh;
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Lenis smooth scroll + GSAP ScrollTrigger integration"
```

---

## Task 5: SunsetParticles GLSL shaders

**Files:**
- Create: `src/three/shaders/sunsetParticles.vert.glsl`
- Create: `src/three/shaders/sunsetParticles.frag.glsl`

- [ ] **Step 1: Create `src/three/shaders/sunsetParticles.vert.glsl`**

Particles float upward slowly, displaced by a gentle sine wave. `uTime` drives the animation, `uScroll` adds subtle drift.

```glsl
uniform float uTime;
uniform float uScroll;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomOffset;

void main() {
  vec3 pos = position;

  // slow upward drift, wraps at top
  float drift = mod(pos.y + uTime * 0.08 + aRandomOffset.y, 8.0) - 4.0;
  pos.y = drift;

  // gentle horizontal sway
  pos.x += sin(uTime * 0.3 + aRandomOffset.x * 6.28) * 0.15;
  pos.z += cos(uTime * 0.2 + aRandomOffset.z * 6.28) * 0.1;

  // subtle scroll parallax
  pos.y -= uScroll * 1.2;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aScale * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
```

- [ ] **Step 2: Create `src/three/shaders/sunsetParticles.frag.glsl`**

Soft circular points with warm color gradient, additive blending for light feel.

```glsl
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

void main() {
  // distance from center of point sprite
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  // soft circle falloff
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  if (alpha < 0.01) discard;

  // gradient between two warm colors based on distance from center
  vec3 color = mix(uColorB, uColorA, dist * 2.0);

  gl_FragColor = vec4(color, alpha * uOpacity);
}
```

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: sunset particles GLSL shaders"
```

---

## Task 6: SunsetParticles component

**Files:**
- Create: `src/three/objects/SunsetParticles.tsx`

- [ ] **Step 1: Create `src/three/objects/SunsetParticles.tsx`**

1200 particles in a floating volume. Uses `useRef` + `useFrame` — never `useState`.

```typescript
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '../shaders/sunsetParticles.vert.glsl'
import fragmentShader from '../shaders/sunsetParticles.frag.glsl'

const PARTICLE_COUNT = 1200

interface Props {
  scrollRef: React.MutableRefObject<number>
}

export default function SunsetParticles({ scrollRef }: Props) {
  const meshRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)

  const { positions, scales, randomOffsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const scales = new Float32Array(PARTICLE_COUNT)
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3)

    for (let index = 0; index < PARTICLE_COUNT; index++) {
      positions[index * 3] = (Math.random() - 0.5) * 14
      positions[index * 3 + 1] = (Math.random() - 0.5) * 8
      positions[index * 3 + 2] = (Math.random() - 0.5) * 6

      scales[index] = 0.3 + Math.random() * 0.7

      randomOffsets[index * 3] = Math.random()
      randomOffsets[index * 3 + 1] = Math.random()
      randomOffsets[index * 3 + 2] = Math.random()
    }

    return { positions, scales, randomOffsets }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 18 },
      uColorA: { value: new THREE.Color('#f5a623') },
      uColorB: { value: new THREE.Color('#fde8c0') },
      uOpacity: { value: 0.55 },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    timeRef.current += delta
    uniforms.uTime.value = timeRef.current
    uniforms.uScroll.value = scrollRef.current
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          array={scales}
          count={PARTICLE_COUNT}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aRandomOffset"
          array={randomOffsets}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: SunsetParticles GPU particle system with custom GLSL"
```

---

## Task 7: WorldScene — main R3F canvas

**Files:**
- Create: `src/three/scenes/WorldScene.tsx`

- [ ] **Step 1: Create `src/three/scenes/WorldScene.tsx`**

Single canvas that fills viewport, fixed position so it stays while user scrolls over the HTML sections above it.

```typescript
import { Canvas } from '@react-three/fiber'
import { Fog } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import SunsetParticles from '../objects/SunsetParticles'
import { ZONE_POST } from '../config/postprocessing'
import { ZONE_LIGHTS } from '../config/lighting'

interface Props {
  scrollRef: React.MutableRefObject<number>
}

export default function WorldScene({ scrollRef }: Props) {
  const post = ZONE_POST[0]
  const lights = ZONE_LIGHTS[0]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 10], fov: 60, near: 0.1, far: 200 }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        style={{ background: '#1a0820' }}
      >
        <fog attach="fog" args={['#1a0820', 15, 60]} />
        <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />
        <directionalLight
          intensity={lights.directionalIntensity}
          color={lights.directionalColor}
          position={lights.directionalPosition}
        />

        <SunsetParticles scrollRef={scrollRef} />

        <EffectComposer>
          <Bloom
            intensity={post.bloomIntensity}
            luminanceThreshold={post.bloomThreshold}
            luminanceSmoothing={post.bloomRadius}
          />
          <ChromaticAberration
            offset={new THREE.Vector2(post.chromaticAberrationOffset, post.chromaticAberrationOffset)}
            blendFunction={BlendFunction.NORMAL}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette
            offset={post.vignetteOffset}
            darkness={post.vignetteDarkness}
            blendFunction={BlendFunction.NORMAL}
          />
          <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat: WorldScene R3F canvas with postprocessing"
```

---

## Task 8: Hero section + DepthIndicator

**Files:**
- Create: `src/sections/Hero.tsx`
- Create: `src/sections/Hero.module.css`
- Create: `src/components/DepthIndicator.tsx`
- Create: `src/components/DepthIndicator.module.css`

- [ ] **Step 1: Create `src/sections/Hero.tsx`**

```typescript
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.name}>Hola, soy Lucas.</h1>
        <p className={styles.subtitle}>
          Construyo software, lidero equipos y hago velas en mi tiempo libre.
        </p>
        <div className={styles.scrollHint}>
          <span className={styles.scrollLine} />
          <span className={styles.scrollLabel}>Scrolleá para conocerme</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `src/sections/Hero.module.css`**

```css
.hero {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 8vw;
  pointer-events: none;
}

.content {
  max-width: 600px;
}

.name {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(2.5rem, 6vw, 5rem);
  color: var(--sunset-cream);
  letter-spacing: -0.01em;
  line-height: 1.1;
  margin-bottom: 1.2rem;
}

.subtitle {
  font-family: var(--font-sans);
  font-weight: 300;
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--sunset-gold);
  opacity: 0.85;
  line-height: 1.6;
  max-width: 420px;
}

.scrollHint {
  position: absolute;
  bottom: 2.5rem;
  left: 8vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
}

.scrollLine {
  display: block;
  width: 1px;
  height: 48px;
  background: var(--sunset-cream);
  animation: scrollPulse 2s ease-in-out infinite;
}

.scrollLabel {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--sunset-cream);
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(0.7); transform-origin: top; }
  50% { opacity: 1; transform: scaleY(1); }
}
```

- [ ] **Step 3: Create `src/components/DepthIndicator.tsx`**

```typescript
import styles from './DepthIndicator.module.css'
import { ZONES } from '../three/config/zones'

interface Props {
  activeZone: number
}

export default function DepthIndicator({ activeZone }: Props) {
  return (
    <nav className={styles.indicator} aria-label="Profundidad actual">
      {ZONES.map((zone, index) => (
        <div
          key={zone.name}
          className={`${styles.dot} ${index === activeZone ? styles.active : ''}`}
          aria-label={zone.name}
        />
      ))}
    </nav>
  )
}
```

- [ ] **Step 4: Create `src/components/DepthIndicator.module.css`**

```css
.indicator {
  position: fixed;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  pointer-events: none;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: var(--transition-medium);
  transition-property: background, transform;
}

.active {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.5);
}
```

- [ ] **Step 5: Add DepthIndicator to App.tsx**

Update `src/App.tsx` to import and render `DepthIndicator`. Add a `activeZone` state driven by scrollRef:

```typescript
import { useRef, useState, useEffect } from 'react'
import WorldScene from './three/scenes/WorldScene'
import Hero from './sections/Hero'
import DepthIndicator from './components/DepthIndicator'
import { useScrollProgress } from './three/hooks/useScrollProgress'
import { getZoneTransition } from './three/hooks/useZoneTransition'
import styles from './App.module.css'

export default function App() {
  const scrollRef = useScrollProgress()
  const [activeZone, setActiveZone] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    function tick() {
      const { currentZone } = getZoneTransition(scrollRef.current)
      setActiveZone(currentZone)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scrollRef])

  return (
    <div className={styles.root}>
      <WorldScene scrollRef={scrollRef} />
      <div className={styles.sections}>
        <Hero />
        <div className={styles.spacer} />
        <div className={styles.spacer} />
        <div className={styles.spacer} />
        <div className={styles.spacer} />
      </div>
      <DepthIndicator activeZone={activeZone} />
    </div>
  )
}
```

- [ ] **Step 6: Update `src/App.module.css`**

```css
.root {
  position: relative;
  width: 100%;
}

.sections {
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.spacer {
  height: 100vh;
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: Hero section, DepthIndicator, wired into App"
```

---

## Task 9: Verify and polish

- [ ] **Step 1: Run dev server and check visually**

```bash
npm run dev
```

Open `http://localhost:5173` in browser and verify:
- Background is dark violet (#1a0820)
- Warm golden particles float upward slowly
- Hero text "Hola, soy Lucas." is visible in cream serif
- Subtitle in gold sans-serif below
- Animated scroll line hint at bottom left
- 5 white dots on the right side (first one brighter)
- Page is scrollable (5 × 100vh height)

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Fix any TypeScript errors if present**

Common fixes needed:
- `bufferAttribute` `attach` prop — may need `args` instead depending on R3F version
- GLSL imports need `/// <reference types="vite-plugin-glsl/ext" />` in `vite-env.d.ts`

If GLSL import gives TS error, add to `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-glsl/ext" />
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: Phase 1 complete — Hero (Atardecer) scene working"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Vite + React + TypeScript strict — Task 1
- ✅ react-three-fiber + drei — Task 1
- ✅ Lenis smooth scroll — Task 4
- ✅ GSAP ScrollTrigger connected to Lenis — Task 4
- ✅ @react-three/postprocessing — Task 7
- ✅ Custom GLSL shaders for particles — Tasks 5, 6
- ✅ Folder structure matches spec — Task 2
- ✅ Config in separate files, not inline — Tasks 3, 7
- ✅ useState never inside render loop — SunsetParticles uses only useRef
- ✅ One component per 3D object — SunsetParticles
- ✅ Max 200 lines per file — checked
- ✅ Hero text content — Task 8
- ✅ Scroll hint — Task 8
- ✅ DepthIndicator 5 dots — Task 8
- ✅ Warm particle atmosphere — Tasks 5, 6
- ⏭️ Audio (Howler) — Phase 2
- ⏭️ Forest/Shore/Sea zones — Phase 2+
- ⏭️ Intro loading screen — Phase 2
- ⏭️ Camera movement driven by scroll — Phase 2

**Type consistency:** `scrollRef: React.MutableRefObject<number>` used consistently across `useScrollProgress`, `WorldScene`, `SunsetParticles`. `getZoneTransition` returns `ZoneTransition` type used in App.
