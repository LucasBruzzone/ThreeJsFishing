import { useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { SUN_POSITION } from '../config/sun'
import { HOOK_HANG_END, HOOK_SPLASH_T } from '../config/hookTrajectory'
import haloVertexShader from '../shaders/sunHalo.vert.glsl'
import haloFragmentShader from '../shaders/sunHalo.frag.glsl'

interface Props {
  scrollRef: MutableRefObject<number>
}

// Sun is a hero-only element. Between HOOK_HANG_END (cast launches) and
// HOOK_SPLASH_T (line hits water) the whole sun shrinks to zero scale and
// the group hides — so it doesn't float as a disc against the underwater
// view. Disc/core stay fully opaque to preserve the bright cream highlight
// on the halos (turning them transparent causes them to dim against the
// additively-blended halos behind).
const Sun = ({ scrollRef }: Props) => {
  const groupRef = useRef<THREE.Group>(null)

  const outerUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#ff6a1a') },
      uIntensity: { value: 1.0 },
      uFalloff: { value: 2.2 },
    }),
    [],
  )

  const midUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#ffb060') },
      uIntensity: { value: 1.2 },
      uFalloff: { value: 3.0 },
    }),
    [],
  )

  useFrame(() => {
    const t = scrollRef.current
    const fade = THREE.MathUtils.clamp(
      1 - (t - HOOK_HANG_END) / (HOOK_SPLASH_T - HOOK_HANG_END),
      0,
      1,
    )
    if (groupRef.current) {
      groupRef.current.visible = fade > 0.01
      groupRef.current.scale.setScalar(fade)
    }
    outerUniforms.uIntensity.value = 1.0 * fade
    midUniforms.uIntensity.value = 1.2 * fade
  })

  return (
    <group ref={groupRef} position={SUN_POSITION.toArray()}>
      <mesh renderOrder={10}>
        <planeGeometry args={[18, 18, 1, 1]} />
        <shaderMaterial
          vertexShader={haloVertexShader}
          fragmentShader={haloFragmentShader}
          uniforms={outerUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.05]} renderOrder={11}>
        <planeGeometry args={[7, 7, 1, 1]} />
        <shaderMaterial
          vertexShader={haloVertexShader}
          fragmentShader={haloFragmentShader}
          uniforms={midUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.1]} renderOrder={12}>
        <circleGeometry args={[1.6, 64]} />
        <meshBasicMaterial color="#fff4d0" toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>

      <mesh position={[0, 0, 0.12]} renderOrder={13}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
    </group>
  )
}

export default Sun
