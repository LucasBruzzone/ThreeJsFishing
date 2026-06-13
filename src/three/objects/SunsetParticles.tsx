import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import vertexShader from '../shaders/sunsetParticles.vert.glsl'
import fragmentShader from '../shaders/sunsetParticles.frag.glsl'

const PARTICLE_COUNT = 1200

interface Props {
  scrollRef: MutableRefObject<number>
}

const SunsetParticles = ({ scrollRef }: Props) => {
  const meshRef = useRef<THREE.Points>(null)
  const timeRef = useRef(0)

  const { positions, scales, randomOffsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const scales = new Float32Array(PARTICLE_COUNT)
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3)

    for (let index = 0; index < PARTICLE_COUNT; index++) {
      positions[index * 3] = (Math.random() - 0.5) * 20
      positions[index * 3 + 1] = (Math.random() - 0.5) * 12
      positions[index * 3 + 2] = (Math.random() - 0.5) * 10 - 2

      scales[index] = 0.2 + Math.random() * 0.5

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
      uSize: { value: 4 },
      uColorA: { value: new THREE.Color('#e8952a') },
      uColorB: { value: new THREE.Color('#fde8c0') },
      uOpacity: { value: 0.35 },
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

export default SunsetParticles
