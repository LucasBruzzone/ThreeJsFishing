import { useRef, useEffect, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'

interface Props {
  scrollRef: MutableRefObject<number>
}

const FishingCharacter = ({ scrollRef }: Props) => {
  const groupRef = useRef<THREE.Group>(null)
  const castingRef = useRef(false)

  const idle = useGLTF('/models/fishing-idle.glb')
  const cast = useGLTF('/models/fishing-cast.glb')

  const { actions: idleActions } = useAnimations(idle.animations, groupRef)
  const { actions: castActions } = useAnimations(cast.animations, groupRef)

  useEffect(() => {
    const action = idleActions['mixamo.com']
    if (action) {
      action.reset().fadeIn(0.5).play()
      action.setLoop(THREE.LoopRepeat, Infinity)
    }
  }, [idleActions])

  useFrame(() => {
    const { currentZone, blend } = getZoneTransition(scrollRef.current)
    if (currentZone !== 0) return

    const shouldCast = blend > 0.15
    if (shouldCast && !castingRef.current) {
      castingRef.current = true
      idleActions['mixamo.com']?.fadeOut(0.3)
      const castAction = castActions['mixamo.com']
      if (castAction) {
        castAction.reset().fadeIn(0.3).play()
        castAction.setLoop(THREE.LoopOnce, 1)
        castAction.clampWhenFinished = true
      }
    } else if (!shouldCast && castingRef.current) {
      castingRef.current = false
      castActions['mixamo.com']?.fadeOut(0.3)
      const idleAction = idleActions['mixamo.com']
      if (idleAction) {
        idleAction.reset().fadeIn(0.3).play()
        idleAction.setLoop(THREE.LoopRepeat, Infinity)
      }
    }
  })

  return (
    <group ref={groupRef} position={[1.5, -1.05, 0]} rotation={[0, -0.4, 0]} scale={0.01}>
      <primitive object={idle.scene} />
    </group>
  )
}

useGLTF.preload('/models/fishing-idle.glb')
useGLTF.preload('/models/fishing-cast.glb')

export default FishingCharacter
