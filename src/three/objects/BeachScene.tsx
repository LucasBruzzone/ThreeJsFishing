import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import FishingCharacter from './FishingCharacter'
import PalmTree from './PalmTree'
import waterVertexShader from '../shaders/water.vert.glsl'
import waterFragmentShader from '../shaders/water.frag.glsl'

interface Props {
  scrollRef: MutableRefObject<number>
}

const BeachScene = ({ scrollRef }: Props) => {
  const timeRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)

  const waterUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    }),
    [],
  )

  useFrame((_, delta) => {
    timeRef.current += delta
    waterUniforms.uTime.value = timeRef.current

    const { currentZone, blend } = getZoneTransition(scrollRef.current)
    const opacity = currentZone === 0 ? 1 - blend * 0.8 : 0
    waterUniforms.uOpacity.value = opacity

    if (groupRef.current) {
      groupRef.current.visible = opacity > 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 2]}>
        <planeGeometry args={[30, 12, 1, 1]} />
        <meshStandardMaterial color="#c8a97a" roughness={1} metalness={0} />
      </mesh>

      {/* Water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.0, -8]}>
        <planeGeometry args={[40, 30, 48, 48]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={waterUniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Shore foam line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, -1.5]}>
        <planeGeometry args={[30, 1.5, 1, 1]} />
        <meshStandardMaterial color="#d4e8ee" transparent opacity={0.35} roughness={1} />
      </mesh>

      <PalmTree position={[-4, -1.05, 1]} rotation={[0.12, 0.3, 0.08]} />
      <PalmTree position={[-6.5, -1.05, -1]} rotation={[0.08, 0.6, -0.06]} scale={1.2} />
      <PalmTree position={[5, -1.05, 0.5]} rotation={[-0.06, -0.4, 0.1]} scale={0.9} />

      <FishingCharacter scrollRef={scrollRef} />
    </group>
  )
}

export default BeachScene
