import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, FrontSide, Mesh, MeshBasicMaterial, Points, PointsMaterial } from 'three'

import { HOOK_SPLASH_T, HOOK_SPLASH_POINT } from '../config/hookTrajectory'

interface Props {
  scrollRef: MutableRefObject<number>
}

// Duration of the splash effect in scroll-progress units. Short enough that
// it reads as an instantaneous burst, long enough to be felt.
const SPLASH_DURATION = 0.04
const DROPLET_COUNT = 28

const Splash = ({ scrollRef }: Props) => {
  const ringRef = useRef<Mesh>(null)
  const ringMaterialRef = useRef<MeshBasicMaterial>(null)
  const dropletsRef = useRef<Points>(null)
  const dropletMaterialRef = useRef<PointsMaterial>(null)

  const { dropletGeometry, dropletVelocities } = useMemo(() => {
    const positions = new Float32Array(DROPLET_COUNT * 3)
    const velocities = new Float32Array(DROPLET_COUNT * 3)
    for (let index = 0; index < DROPLET_COUNT; index++) {
      const angle = (index / DROPLET_COUNT) * Math.PI * 2 + Math.random() * 0.3
      const spread = 0.4 + Math.random() * 0.6
      velocities[index * 3 + 0] = Math.cos(angle) * spread
      velocities[index * 3 + 1] = 0.8 + Math.random() * 0.7
      velocities[index * 3 + 2] = Math.sin(angle) * spread
    }
    const bufferGeometry = new BufferGeometry()
    bufferGeometry.setAttribute('position', new BufferAttribute(positions, 3))
    return { dropletGeometry: bufferGeometry, dropletVelocities: velocities }
  }, [])

  useFrame(() => {
    const ring = ringRef.current
    const ringMaterial = ringMaterialRef.current
    const droplets = dropletsRef.current
    const dropletMaterial = dropletMaterialRef.current
    if (!ring || !ringMaterial || !droplets || !dropletMaterial) return

    const scrollProgress = scrollRef.current
    const effectProgress = (scrollProgress - HOOK_SPLASH_T) / SPLASH_DURATION

    if (effectProgress < 0 || effectProgress > 1) {
      ring.visible = false
      droplets.visible = false
      return
    }

    ring.visible = true
    droplets.visible = true

    // Ring expands and fades.
    const scale = 0.2 + effectProgress * 2.4
    ring.scale.set(scale, scale, scale)
    ringMaterial.opacity = (1 - effectProgress) * 0.85

    // Droplets fly outward and arc downward under gravity, fading near the end.
    const positionArray = droplets.geometry.attributes.position.array as Float32Array
    for (let index = 0; index < DROPLET_COUNT; index++) {
      const velocityX = dropletVelocities[index * 3 + 0]
      const velocityY = dropletVelocities[index * 3 + 1]
      const velocityZ = dropletVelocities[index * 3 + 2]
      positionArray[index * 3 + 0] = velocityX * effectProgress
      positionArray[index * 3 + 1] = velocityY * effectProgress - 1.5 * effectProgress * effectProgress
      positionArray[index * 3 + 2] = velocityZ * effectProgress
    }
    droplets.geometry.attributes.position.needsUpdate = true
    dropletMaterial.opacity = (1 - effectProgress) * 0.9
  })

  return (
    <group position={HOOK_SPLASH_POINT.toArray()}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.18, 0.24, 32]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          fog={false}
          side={FrontSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={dropletsRef} geometry={dropletGeometry} visible={false}>
        <pointsMaterial
          ref={dropletMaterialRef}
          color="#ffffff"
          size={0.08}
          transparent
          opacity={0}
          fog={false}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

export default Splash
