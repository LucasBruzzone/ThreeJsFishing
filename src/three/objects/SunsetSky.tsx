import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import vertexShader from '../shaders/sunsetSky.vert.glsl'
import fragmentShader from '../shaders/sunsetSky.frag.glsl'

interface Props {
  scrollRef: MutableRefObject<number>
}

const SunsetSky = ({ scrollRef }: Props) => {
  const meshRef = useRef<THREE.Mesh>(null)

  const uniforms = useMemo(
    () => ({ uOpacity: { value: 1 } }),
    [],
  )

  useFrame(() => {
    const { currentZone, blend } = getZoneTransition(scrollRef.current)
    uniforms.uOpacity.value = currentZone === 0 ? 1 - blend : 0
  })

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]} renderOrder={-1}>
      <sphereGeometry args={[80, 32, 16]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default SunsetSky
