import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Group } from 'three'

import { SUN_POSITION } from '../config/sun'
import { WATER_SURFACE_Y } from '../config/zones'
import { getZoneTransition } from '../hooks/useZoneTransition'
import FishingCharacter from './FishingCharacter'
import PalmTree from './PalmTree'
import Sun from './Sun'
import waterVertexShader from '../shaders/water.vert.glsl'
import waterFragmentShader from '../shaders/water.frag.glsl'

interface Props {
  scrollRef: MutableRefObject<number>
}

const SAND_Y = -1.0
const SHORE_Z = -5

const BeachScene = ({ scrollRef }: Props) => {
  const timeRef = useRef(0)
  const groupRef = useRef<Group>(null)

  const waterUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uSunPosition: { value: SUN_POSITION.clone() },
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
      <Sun scrollRef={scrollRef} />


      {/* Sand beach */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SAND_Y, 1.5]}>
        <planeGeometry args={[40, 13, 1, 1]} />
        <meshStandardMaterial color="#e0bd7e" roughness={1} metalness={0} />
      </mesh>

      {/* Wet sand strip just before water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SAND_Y - 0.01, SHORE_Z + 0.5]}>
        <planeGeometry args={[40, 2, 1, 1]} />
        <meshStandardMaterial color="#8c7250" roughness={0.6} metalness={0} />
      </mesh>

      {/* Foam line at the shore */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SAND_Y + 0.01, SHORE_Z]}>
        <planeGeometry args={[40, 0.6, 1, 1]} />
        <meshStandardMaterial color="#f4f8fa" transparent opacity={0.7} roughness={1} />
      </mesh>

      {/* Ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_SURFACE_Y, -25]}>
        <planeGeometry args={[120, 40, 64, 64]} />
        <shaderMaterial
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          uniforms={waterUniforms}
          transparent
          side={DoubleSide}
        />
      </mesh>

      <PalmTree position={[-5, SAND_Y, 2]} rotation={[0.12, 0.3, 0.08]} />
      <PalmTree position={[-8, SAND_Y, -0.5]} rotation={[0.08, 0.6, -0.06]} scale={1.2} />
      <PalmTree position={[6, SAND_Y, 1]} rotation={[-0.06, -0.4, 0.1]} scale={0.95} />

      <FishingCharacter scrollRef={scrollRef} />
    </group>
  )
}

export default BeachScene
