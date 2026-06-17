import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, MathUtils, Points, PointsMaterial } from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import { IS_LOW_END } from '../config/deviceTier'

interface Props {
  scrollRef: MutableRefObject<number>
}

const BUBBLE_COUNT = IS_LOW_END ? 100 : 220
const FIELD_X = 30
const FIELD_Y_MIN = -45
const FIELD_Y_MAX = 5
const FIELD_Z = 30
const RISE_SPEED = 1.8

const Bubbles = ({ scrollRef }: Props) => {
  const pointsRef = useRef<Points>(null)
  const materialRef = useRef<PointsMaterial>(null)

  const { positions, speeds, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(BUBBLE_COUNT * 3)
    const speedsArray = new Float32Array(BUBBLE_COUNT)
    const sizesArray = new Float32Array(BUBBLE_COUNT)
    for (let index = 0; index < BUBBLE_COUNT; index++) {
      positionsArray[index * 3 + 0] = (Math.random() - 0.5) * FIELD_X
      positionsArray[index * 3 + 1] = FIELD_Y_MIN + Math.random() * (FIELD_Y_MAX - FIELD_Y_MIN)
      positionsArray[index * 3 + 2] = -Math.random() * FIELD_Z
      speedsArray[index] = 0.4 + Math.random() * 1.0
      sizesArray[index] = 0.04 + Math.random() * 0.08
    }
    return { positions: positionsArray, speeds: speedsArray, sizes: sizesArray }
  }, [])

  const geometry = useMemo(() => {
    const bufferGeometry = new BufferGeometry()
    bufferGeometry.setAttribute('position', new BufferAttribute(positions, 3))
    bufferGeometry.setAttribute('size', new BufferAttribute(sizes, 1))
    return bufferGeometry
  }, [positions, sizes])

  useFrame((_, delta) => {
    const points = pointsRef.current
    const material = materialRef.current
    if (!points || !material) return

    const { currentZone, blend } = getZoneTransition(scrollRef.current)
    // Bubbles fade in late in zone 0 (last 30%) and stay fully visible through
    // every underwater zone. `getZoneTransition` clamps currentZone to
    // ZONE_COUNT - 2, so it never reaches the final index.
    const opacity = currentZone === 0
      ? MathUtils.smoothstep(blend, 0.7, 1.0)
      : 1
    material.opacity = opacity * 0.55
    const visible = opacity > 0.01
    points.visible = visible

    // Skip the 220-particle Y update + GPU re-upload entirely while invisible
    // (i.e. above water in the hero). Saves a buffer push per frame.
    if (!visible) return

    const positionAttribute = points.geometry.attributes.position
    const positionArray = positionAttribute.array as Float32Array
    for (let index = 0; index < BUBBLE_COUNT; index++) {
      positionArray[index * 3 + 1] += speeds[index] * RISE_SPEED * delta
      if (positionArray[index * 3 + 1] > FIELD_Y_MAX) {
        positionArray[index * 3 + 1] = FIELD_Y_MIN
        positionArray[index * 3 + 0] = (Math.random() - 0.5) * FIELD_X
        positionArray[index * 3 + 2] = -Math.random() * FIELD_Z
      }
    }
    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        ref={materialRef}
        color="#d8eef5"
        size={0.12}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export default Bubbles
