import { useRef, useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import {
  HOOK_HANG_END,
  HOOK_SPLASH_T,
  HOOK_SINK_END,
  HOOK_SPLASH_POINT,
  HOOK_SINK_END_POINT,
  flightArc,
  descentEase,
} from '../config/hookTrajectory'
import { hookWorldPosition, rodTipWorldPosition } from '../state/hookState'

interface Props {
  characterGroup: MutableRefObject<THREE.Group | null>
  scrollRef: MutableRefObject<number>
}

const HAND_BONE_SUFFIX = 'RightHand'
const FINGER_SUFFIXES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
const ROD_LENGTH = 1.6
const ROD_LOCAL_POSITION = new THREE.Vector3(0, 0.02, 0.0)
const ROD_LOCAL_EULER = new THREE.Euler(0, 0, -Math.PI / 12)
const ROD_TIP_LOCAL = new THREE.Vector3(0, ROD_LENGTH * 0.85, 0)

const FishingRod = ({ characterGroup, scrollRef }: Props) => {
  const rodGroupRef = useRef<THREE.Group>(null)

  const rodGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.004, 0.018, ROD_LENGTH, 6),
    [],
  )

  const rodTipWorld = useMemo(() => new THREE.Vector3(), [])
  const hookHang = useMemo(() => new THREE.Vector3(), [])
  const launchPoint = useRef<THREE.Vector3 | null>(null)

  useEffect(() => {
    const root = characterGroup.current
    const rodGroup = rodGroupRef.current
    if (!root || !rodGroup) return

    let handBone: THREE.Object3D | null = null
    const boneCandidates: string[] = []
    root.traverse((obj) => {
      if ((obj as THREE.Bone).isBone) boneCandidates.push(obj.name)
      if (
        !handBone &&
        obj.name.endsWith(HAND_BONE_SUFFIX) &&
        !FINGER_SUFFIXES.some((s) => obj.name.endsWith(s))
      ) {
        handBone = obj
      }
    })
    if (!handBone) {
      console.warn('[FishingRod] right-hand bone not found. Bones in scene:', boneCandidates)
      return
    }

    ;(handBone as THREE.Object3D).add(rodGroup)
    rodGroup.position.copy(ROD_LOCAL_POSITION)
    rodGroup.rotation.copy(ROD_LOCAL_EULER)
  }, [characterGroup])

  useFrame(() => {
    const rodGroup = rodGroupRef.current
    if (!rodGroup) return

    rodGroup.updateWorldMatrix(true, false)
    rodTipWorld.copy(ROD_TIP_LOCAL).applyMatrix4(rodGroup.matrixWorld)
    rodTipWorldPosition.copy(rodTipWorld)

    const t = scrollRef.current
    const hookOut = hookWorldPosition

    if (t < HOOK_HANG_END) {
      hookHang.copy(rodTipWorld)
      hookHang.y -= 0.85
      hookOut.copy(hookHang)
      launchPoint.current = null
    } else if (t < HOOK_SPLASH_T) {
      if (!launchPoint.current) launchPoint.current = rodTipWorld.clone()
      const flightT = (t - HOOK_HANG_END) / (HOOK_SPLASH_T - HOOK_HANG_END)
      flightArc(launchPoint.current, flightT, hookOut)
    } else if (t < HOOK_SINK_END) {
      launchPoint.current = null
      const sinkT = (t - HOOK_SPLASH_T) / (HOOK_SINK_END - HOOK_SPLASH_T)
      hookOut.lerpVectors(HOOK_SPLASH_POINT, HOOK_SINK_END_POINT, descentEase(sinkT))
    } else {
      hookOut.copy(HOOK_SINK_END_POINT)
    }
  })

  return (
    <group ref={rodGroupRef}>
      <mesh geometry={rodGeometry} position={[0, ROD_LENGTH * 0.4, 0]}>
        <meshStandardMaterial color="#181818" roughness={0.35} metalness={0.3} />
      </mesh>
    </group>
  )
}

export default FishingRod
