import { useRef, useEffect, useMemo, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bone, CylinderGeometry, Euler, Group, Object3D, Vector3 } from 'three'

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
  characterGroup: MutableRefObject<Group | null>
  scrollRef: MutableRefObject<number>
}

const HAND_BONE_SUFFIX = 'RightHand'
const FINGER_SUFFIXES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
const ROD_LENGTH = 1.6
const ROD_LOCAL_POSITION = new Vector3(0, 0.02, 0.0)
const ROD_LOCAL_EULER = new Euler(0, 0, -Math.PI / 12)
const ROD_TIP_LOCAL = new Vector3(0, ROD_LENGTH * 0.85, 0)

const FishingRod = ({ characterGroup, scrollRef }: Props) => {
  const rodGroupRef = useRef<Group>(null)

  const rodGeometry = useMemo(
    () => new CylinderGeometry(0.004, 0.018, ROD_LENGTH, 6),
    [],
  )

  const rodTipWorld = useMemo(() => new Vector3(), [])
  const hookHangPosition = useMemo(() => new Vector3(), [])
  const launchPoint = useRef<Vector3 | null>(null)

  useEffect(() => {
    const characterRoot = characterGroup.current
    const rodGroup = rodGroupRef.current
    if (!characterRoot || !rodGroup) return

    let handBone: Object3D | null = null
    const boneCandidates: string[] = []
    characterRoot.traverse((object) => {
      if ((object as Bone).isBone) boneCandidates.push(object.name)
      if (
        !handBone &&
        object.name.endsWith(HAND_BONE_SUFFIX) &&
        !FINGER_SUFFIXES.some((suffix) => object.name.endsWith(suffix))
      ) {
        handBone = object
      }
    })
    if (!handBone) {
      console.warn('[FishingRod] right-hand bone not found. Bones in scene:', boneCandidates)
      return
    }

    ;(handBone as Object3D).add(rodGroup)
    rodGroup.position.copy(ROD_LOCAL_POSITION)
    rodGroup.rotation.copy(ROD_LOCAL_EULER)
  }, [characterGroup])

  useFrame(() => {
    const rodGroup = rodGroupRef.current
    if (!rodGroup) return

    rodGroup.updateWorldMatrix(true, false)
    rodTipWorld.copy(ROD_TIP_LOCAL).applyMatrix4(rodGroup.matrixWorld)
    rodTipWorldPosition.copy(rodTipWorld)

    const scrollProgress = scrollRef.current
    const hookOutput = hookWorldPosition

    if (scrollProgress < HOOK_HANG_END) {
      hookHangPosition.copy(rodTipWorld)
      hookHangPosition.y -= 0.85
      hookOutput.copy(hookHangPosition)
      launchPoint.current = null
    } else if (scrollProgress < HOOK_SPLASH_T) {
      if (!launchPoint.current) launchPoint.current = rodTipWorld.clone()
      const flightProgress = (scrollProgress - HOOK_HANG_END) / (HOOK_SPLASH_T - HOOK_HANG_END)
      flightArc(launchPoint.current, flightProgress, hookOutput)
    } else if (scrollProgress < HOOK_SINK_END) {
      launchPoint.current = null
      const sinkProgress = (scrollProgress - HOOK_SPLASH_T) / (HOOK_SINK_END - HOOK_SPLASH_T)
      hookOutput.lerpVectors(HOOK_SPLASH_POINT, HOOK_SINK_END_POINT, descentEase(sinkProgress))
    } else {
      hookOutput.copy(HOOK_SINK_END_POINT)
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
