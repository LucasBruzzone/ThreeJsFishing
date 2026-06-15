import { useRef, useEffect, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Group, LoopOnce, LoopRepeat, MathUtils } from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import { CAST_SCRUB_END } from '../config/hookTrajectory'
import FishingRod from './FishingRod'

interface Props {
  scrollRef: MutableRefObject<number>
}

const FishingCharacter = ({ scrollRef }: Props) => {
  const groupRef = useRef<Group>(null)

  const idle = useGLTF('/models/fishing-idle.glb')
  const cast = useGLTF('/models/fishing-cast.glb')

  const { actions: idleActions } = useAnimations(idle.animations, groupRef)
  const { actions: castActions } = useAnimations(cast.animations, groupRef)

  useEffect(() => {
    const idleAction = idleActions['mixamo.com']
    const castAction = castActions['mixamo.com']
    if (idleAction) {
      idleAction.reset().play()
      idleAction.setLoop(LoopRepeat, Infinity)
    }
    if (castAction) {
      castAction.reset().play()
      castAction.setLoop(LoopOnce, 1)
      castAction.clampWhenFinished = true
      castAction.paused = true
      castAction.weight = 0
    }
  }, [idleActions, castActions])

  useFrame(() => {
    const { currentZone, blend } = getZoneTransition(scrollRef.current)
    const idleAction = idleActions['mixamo.com']
    const castAction = castActions['mixamo.com']
    if (!idleAction || !castAction) return

    if (currentZone !== 0) {
      idleAction.weight = 1
      castAction.weight = 0
      return
    }

    const clipProgress = MathUtils.clamp(blend / CAST_SCRUB_END, 0, 1)
    castAction.time = clipProgress * castAction.getClip().duration

    // Hard switch from idle to cast — blending mid-frame produces the
    // arms-out limbo pose because frame 0 of the cast clip is near T-pose.
    const useCast = blend > 0.03
    castAction.weight = useCast ? 1 : 0
    idleAction.weight = useCast ? 0 : 1
  })

  return (
    <>
      <group ref={groupRef} position={[1.2, -1.0, 4]} rotation={[0, Math.PI, 0]} scale={1}>
        <primitive object={idle.scene} />
      </group>
      <FishingRod characterGroup={groupRef} scrollRef={scrollRef} />
    </>
  )
}

useGLTF.preload('/models/fishing-idle.glb')
useGLTF.preload('/models/fishing-cast.glb')

export default FishingCharacter
