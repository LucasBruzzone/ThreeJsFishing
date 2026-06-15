import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'

interface Props {
  scrollRef: MutableRefObject<number>
}

const BUBBLE_COUNT = 220
const FIELD_X = 30
const FIELD_Y_MIN = -45
const FIELD_Y_MAX = 5
const FIELD_Z = 30
const RISE_SPEED = 1.8

const Bubbles = ({ scrollRef }: Props) => {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  const { positions, speeds, sizes } = useMemo(() => {
    const positionsArr = new Float32Array(BUBBLE_COUNT * 3)
    const speedsArr = new Float32Array(BUBBLE_COUNT)
    const sizesArr = new Float32Array(BUBBLE_COUNT)
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      positionsArr[i * 3 + 0] = (Math.random() - 0.5) * FIELD_X
      positionsArr[i * 3 + 1] = FIELD_Y_MIN + Math.random() * (FIELD_Y_MAX - FIELD_Y_MIN)
      positionsArr[i * 3 + 2] = -Math.random() * FIELD_Z
      speedsArr[i] = 0.4 + Math.random() * 1.0
      sizesArr[i] = 0.04 + Math.random() * 0.08
    }
    return { positions: positionsArr, speeds: speedsArr, sizes: sizesArr }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geo
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
      ? THREE.MathUtils.smoothstep(blend, 0.7, 1.0)
      : 1
    material.opacity = opacity * 0.55
    const visible = opacity > 0.01
    points.visible = visible

    // Skip the 220-particle Y update + GPU re-upload entirely while invisible
    // (i.e. above water in the hero). Saves a buffer push per frame.
    if (!visible) return

    const posAttr = points.geometry.attributes.position
    const arr = posAttr.array as Float32Array
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * RISE_SPEED * delta
      if (arr[i * 3 + 1] > FIELD_Y_MAX) {
        arr[i * 3 + 1] = FIELD_Y_MIN
        arr[i * 3 + 0] = (Math.random() - 0.5) * FIELD_X
        arr[i * 3 + 2] = -Math.random() * FIELD_Z
      }
    }
    posAttr.needsUpdate = true
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
