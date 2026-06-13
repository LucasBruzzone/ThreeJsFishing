import { type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import SunsetParticles from '../objects/SunsetParticles'
import ForestParticles from '../objects/ForestParticles'
import UnderwaterParticles from '../objects/UnderwaterParticles'
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

      <SceneController scrollRef={scrollRef} />
      <SunsetParticles scrollRef={scrollRef} />
      <ForestParticles scrollRef={scrollRef} />
      <UnderwaterParticles scrollRef={scrollRef} />

      <EffectComposer>
        <DynamicBloom scrollRef={scrollRef} />
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
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </Canvas>
  </div>
)

export default WorldScene
