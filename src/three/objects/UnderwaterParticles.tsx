import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import vertexShader from '../shaders/underwaterParticles.vert.glsl'
import fragmentShader from '../shaders/underwaterParticles.frag.glsl'

const PARTICLE_COUNT = 600

interface Props {
  scrollRef: MutableRefObject<number>
}

const ZONE_COLORS = [
  new THREE.Color('#5aaed4'),
  new THREE.Color('#2a6080'),
  new THREE.Color('#0a1a40'),
]

const UnderwaterParticles = ({ scrollRef }: Props) => {
  const timeRef = useRef(0)

  const { positions, scales, randomOffsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const scales = new Float32Array(PARTICLE_COUNT)
    const randomOffsets = new Float32Array(PARTICLE_COUNT * 3)

    for (let index = 0; index < PARTICLE_COUNT; index++) {
      positions[index * 3] = (Math.random() - 0.5) * 28
      positions[index * 3 + 1] = (Math.random() - 0.5) * 16
      positions[index * 3 + 2] = (Math.random() - 0.5) * 14 - 2

      scales[index] = 0.15 + Math.random() * 0.4

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
      uColor: { value: ZONE_COLORS[0].clone() },
      uOpacity: { value: 0 },
    }),
    [],
  )

  useFrame((_, delta) => {
    timeRef.current += delta
    uniforms.uTime.value = timeRef.current

    const { currentZone, blend } = getZoneTransition(scrollRef.current)

    const opacity =
      currentZone === 1 ? blend :
      currentZone === 2 ? 1 :
      currentZone === 3 ? 1 - blend :
      0
    uniforms.uOpacity.value = 0.25 * opacity

    const colorIndex = Math.min(Math.max(currentZone - 2, 0), ZONE_COLORS.length - 1)
    const nextColorIndex = Math.min(colorIndex + 1, ZONE_COLORS.length - 1)
    uniforms.uColor.value.lerpColors(ZONE_COLORS[colorIndex], ZONE_COLORS[nextColorIndex], blend)
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

export default UnderwaterParticles
