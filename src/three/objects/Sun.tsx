import { useMemo } from 'react'
import * as THREE from 'three'

import { SUN_POSITION } from '../config/sun'
import haloVertexShader from '../shaders/sunHalo.vert.glsl'
import haloFragmentShader from '../shaders/sunHalo.frag.glsl'

const Sun = () => {
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

  return (
    <group position={SUN_POSITION.toArray()}>
      {/* Outer atmospheric scatter — wide, soft */}
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

      {/* Mid glow — tighter */}
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

      {/* Sun disc — small, bright */}
      <mesh position={[0, 0, 0.1]} renderOrder={12}>
        <circleGeometry args={[1.6, 64]} />
        <meshBasicMaterial color="#fff4d0" toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>

      {/* Bright pinpoint core */}
      <mesh position={[0, 0, 0.12]} renderOrder={13}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
    </group>
  )
}

export default Sun
