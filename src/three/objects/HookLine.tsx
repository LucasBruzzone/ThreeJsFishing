import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { CylinderGeometry, Mesh, Quaternion, Vector3 } from 'three'

import { hookWorldPosition, rodTipWorldPosition } from '../state/hookState'
import { WATER_SURFACE_Y } from '../config/zones'
import { CANDLE_HEIGHT } from './Candle'

const ROPE_RADIUS = 0.0018
const LINE_UP = new Vector3(0, 1, 0)
// Once the candle crosses the water plane the rope switches from "diagonal
// to the rod tip on the beach" to "straight up toward the unseen surface" —
// the side-on camera makes the diagonal read as a confusing slash across
// the frame.
const UNDERWATER_ROPE_LENGTH = 80

const HookLine = () => {
  const meshRef = useRef<Mesh>(null)

  const geometry = useMemo(
    () => new CylinderGeometry(ROPE_RADIUS, ROPE_RADIUS, 1, 8, 1, true),
    [],
  )

  const ropeBottom = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])
  const midpoint = useMemo(() => new Vector3(), [])
  const direction = useMemo(() => new Vector3(), [])
  const quat = useMemo(() => new Quaternion(), [])

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
