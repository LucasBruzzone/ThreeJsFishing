import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { HOOK_SPLASH_T, HOOK_SPLASH_POINT } from '../config/hookTrajectory'

interface Props {
  scrollRef: MutableRefObject<number>
}

// Duration of the splash effect in scroll-progress units. Short enough that
// it reads as an instantaneous burst, long enough to be felt.
const SPLASH_DURATION = 0.04
const DROPLET_COUNT = 28

const Splash = ({ scrollRef }: Props) => {
  const ringRef = useRef<THREE.Mesh>(null)
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const dropletsRef = useRef<THREE.Points>(null)
  const dropletMatRef = useRef<THREE.PointsMaterial>(null)

  const { dropletGeometry, dropletVelocities } = useMemo(() => {
    const positions = new Float32Array(DROPLET_COUNT * 3)
    const velocities = new Float32Array(DROPLET_COUNT * 3)
    for (let i = 0; i < DROPLET_COUNT; i++) {
      const angle = (i / DROPLET_COUNT) * Math.PI * 2 + Math.random() * 0.3
      const spread = 0.4 + Math.random() * 0.6
      velocities[i * 3 + 0] = Math.cos(angle) * spread
      velocities[i * 3 + 1] = 0.8 + Math.random() * 0.7
      velocities[i * 3 + 2] = Math.sin(angle) * spread
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { dropletGeometry: geo, dropletVelocities: velocities }
  }, [])

  useFrame(() => {
    const ring = ringRef.current
    const ringMat = ringMatRef.current
    const droplets = dropletsRef.current
    const dropletMat = dropletMatRef.current
    if (!ring || !ringMat || !droplets || !dropletMat) return

    const t = scrollRef.current
    const fxT = (t - HOOK_SPLASH_T) / SPLASH_DURATION

    if (fxT < 0 || fxT > 1) {
      ring.visible = false
      droplets.visible = false
      return
    }

    ring.visible = true
    droplets.visible = true

    // Ring expands and fades.
    const scale = 0.2 + fxT * 2.4
    ring.scale.set(scale, scale, scale)
    ringMat.opacity = (1 - fxT) * 0.85

    // Droplets fly outward and arc downward under gravity, fading near the end.
    const arr = droplets.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < DROPLET_COUNT; i++) {
      const vx = dropletVelocities[i * 3 + 0]
      const vy = dropletVelocities[i * 3 + 1]
      const vz = dropletVelocities[i * 3 + 2]
      arr[i * 3 + 0] = vx * fxT
      arr[i * 3 + 1] = vy * fxT - 1.5 * fxT * fxT
      arr[i * 3 + 2] = vz * fxT
    }
    droplets.geometry.attributes.position.needsUpdate = true
    dropletMat.opacity = (1 - fxT) * 0.9
  })

  return (
    <group position={HOOK_SPLASH_POINT.toArray()}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.18, 0.24, 32]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          fog={false}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={dropletsRef} geometry={dropletGeometry} visible={false}>
        <pointsMaterial
          ref={dropletMatRef}
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
