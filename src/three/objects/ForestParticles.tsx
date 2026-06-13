import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import vertexShader from '../shaders/forestParticles.vert.glsl'
import fragmentShader from '../shaders/forestParticles.frag.glsl'

const PARTICLE_COUNT = 800

interface Props {
  scrollRef: MutableRefObject<number>
}

const ForestParticles = ({ scrollRef }: Props) => {
  const timeRef = useRef(0)

  const { positions, scales, randomOffsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const scales = new Float32Array(PARTICLE_COUNT)
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3)

    for (let index = 0; index < PARTICLE_COUNT; index++) {
      positions[index * 3] = (Math.random() - 0.5) * 24
      positions[index * 3 + 1] = (Math.random() - 0.5) * 14
      positions[index * 3 + 2] = (Math.random() - 0.5) * 12 - 2

      scales[index] = 0.1 + Math.random() * 0.3

      randomOffsets[index * 3] = Math.random()
      randomOffsets[index * 3 + 1] = Math.random()
      randomOffsets[index * 3 + 2] = Math.random()
    }

    return { positions, scales, randomOffsets }
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 3 },
      uColor: { value: new THREE.Color('#a8d878') },
      uOpacity: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    timeRef.current += delta
    uniforms.uTime.value = timeRef.current

    const { currentZone, blend } = getZoneTransition(scrollRef.current)
    const opacity =
      currentZone === 0 ? blend :
      currentZone === 1 ? 1 - blend :
      0
    uniforms.uOpacity.value = 0.3 * opacity
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-aScale" array={scales} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-aRandomOffset" array={randomOffsets} count={PARTICLE_COUNT} itemSize={3} />
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

export default ForestParticles
