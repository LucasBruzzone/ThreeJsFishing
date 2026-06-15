import { type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

import SunsetParticles from '../objects/SunsetParticles'
import SunsetSky from '../objects/SunsetSky'
import BeachScene from '../objects/BeachScene'
import ForestParticles from '../objects/ForestParticles'
import UnderwaterParticles from '../objects/UnderwaterParticles'
import Bubbles from '../objects/Bubbles'
import Candle from '../objects/Candle'
import HookLine from '../objects/HookLine'
import Splash from '../objects/Splash'
import SceneController from '../objects/SceneController'
import DynamicBloom from '../objects/DynamicBloom'
import { ZONE_POST } from '../config/postprocessing'
import { ZONES } from '../config/zones'

interface Props {
  scrollRef: MutableRefObject<number>
}

const post = ZONE_POST[0]
const initialZone = ZONES[0]
const initialBackground = initialZone.fogColor.clone()

const WorldScene = ({ scrollRef }: Props) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: initialZone.cameraPosition.toArray(), fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      scene={{ background: initialBackground }}
    >
      <fog attach="fog" args={[initialZone.fogColor.clone(), initialZone.fogNear, initialZone.fogFar]} />

      <Environment preset="sunset" environmentIntensity={0.6} />

      {/* BeachScene (FishingRod) writes hookWorldPosition; Candle reads it.
          Both must run BEFORE SceneController so the camera frames the hook
          using THIS frame's position — not last frame's. Reordering avoids
          a 1-frame lag that shows up as judder during the descent. */}
      <SunsetSky scrollRef={scrollRef} />
      <BeachScene scrollRef={scrollRef} />
      <Candle scrollRef={scrollRef} />
      <HookLine />
      <SceneController scrollRef={scrollRef} />
      <SunsetParticles scrollRef={scrollRef} />
      <ForestParticles scrollRef={scrollRef} />
      <UnderwaterParticles scrollRef={scrollRef} />
      <Bubbles scrollRef={scrollRef} />
      <Splash scrollRef={scrollRef} />

      <EffectComposer>
        <DynamicBloom scrollRef={scrollRef} />
        <ChromaticAberration
          offset={new Vector2(post.chromaticAberrationOffset, post.chromaticAberrationOffset)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette
          offset={post.vignetteOffset}
          darkness={post.vignetteDarkness}
          blendFunction={BlendFunction.NORMAL}
        />
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  </div>
)

export default WorldScene
