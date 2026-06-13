import { type MutableRefObject } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import SunsetParticles from '../objects/SunsetParticles'
import { ZONE_POST } from '../config/postprocessing'
import { ZONE_LIGHTS } from '../config/lighting'
import { ZONES } from '../config/zones'

interface Props {
  scrollRef: MutableRefObject<number>
}

const post = ZONE_POST[0]
const lights = ZONE_LIGHTS[0]
const zone = ZONES[0]

const WorldScene = ({ scrollRef }: Props) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: zone.cameraPosition.toArray(), fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: `#${zone.fogColor.getHexString()}` }}
    >
      <fog attach="fog" args={[zone.fogColor, zone.fogNear, zone.fogFar]} />
      <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />
      <directionalLight
        intensity={lights.directionalIntensity}
        color={lights.directionalColor}
        position={lights.directionalPosition}
      />

      <SunsetParticles scrollRef={scrollRef} />

      <EffectComposer>
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
