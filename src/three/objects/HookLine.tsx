import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { hookWorldPosition, rodTipWorldPosition } from '../state/hookState'

const ROPE_RADIUS = 0.0018
const LINE_UP = new THREE.Vector3(0, 1, 0)
// Below this Y the candle is underwater. We then draw the rope going straight
// up from the candle (toward the unseen surface) instead of diagonally to the
// rod tip far away on the beach — the side-on camera makes the diagonal read
// as a confusing slash across the frame.
const WATER_SURFACE_Y = -1.15
const UNDERWATER_ROPE_LENGTH = 80
// hookWorldPosition is the candle's BASE in world space (Hook.tsx lifts the
// model so its bottom sits there). The rope should attach to the candle's
// TOP — otherwise the cylinder geometrically passes through the candle body
// and the segment inside/below the wax is visible when scrolling, which
// reads as "a piece of line left below" while reeling.
const CANDLE_HEIGHT = 0.5

const HookLine = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(
    () => new THREE.CylinderGeometry(ROPE_RADIUS, ROPE_RADIUS, 1, 8, 1, true),
    [],
  )

  const ropeBottom = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const midpoint = useMemo(() => new THREE.Vector3(), [])
  const direction = useMemo(() => new THREE.Vector3(), [])
  const quat = useMemo(() => new THREE.Quaternion(), [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    if (hookWorldPosition.y < WATER_SURFACE_Y) {
      // Underwater: rope attaches to the candle's TOP and goes straight up.
      ropeBottom.set(hookWorldPosition.x, hookWorldPosition.y + CANDLE_HEIGHT, hookWorldPosition.z)
      target.set(ropeBottom.x, ropeBottom.y + UNDERWATER_ROPE_LENGTH, ropeBottom.z)
    } else {
      // Above water: rope goes diagonally to the rod tip. Anchor at the
      // hook position itself — at cast scale the candle is tiny enough
      // that the bottom-vs-top difference isn't readable.
      ropeBottom.copy(hookWorldPosition)
      target.copy(rodTipWorldPosition)
    }

    direction.subVectors(target, ropeBottom)
    const length = direction.length()
    if (length < 0.001) {
      mesh.visible = false
      return
    }
    mesh.visible = true

    midpoint.addVectors(ropeBottom, target).multiplyScalar(0.5)
    mesh.position.copy(midpoint)

    direction.divideScalar(length)
    quat.setFromUnitVectors(LINE_UP, direction)
    mesh.quaternion.copy(quat)

    mesh.scale.set(1, length, 1)
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial color="#e8e2cc" transparent opacity={0.75} toneMapped={false} fog={false} />
    </mesh>
  )
}

export default HookLine
