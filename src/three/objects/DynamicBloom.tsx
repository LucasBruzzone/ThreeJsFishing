import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom } from '@react-three/postprocessing'
import { BloomEffect } from 'postprocessing'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import { ZONE_POST } from '../config/postprocessing'

interface Props {
  scrollRef: MutableRefObject<number>
}

const DynamicBloom = ({ scrollRef }: Props) => {
  const bloomRef = useRef<typeof BloomEffect>(null)

  useFrame(() => {
    const effect = bloomRef.current as unknown as BloomEffect
    if (!effect) return

    const { currentZone, nextZone, blend } = getZoneTransition(scrollRef.current)
    const postA = ZONE_POST[currentZone]
    const postB = ZONE_POST[nextZone]

    effect.intensity = THREE.MathUtils.lerp(postA.bloomIntensity, postB.bloomIntensity, blend)
  })

  return <Bloom ref={bloomRef} intensity={ZONE_POST[0].bloomIntensity} mipmapBlur luminanceThreshold={0.9} />
}

export default DynamicBloom
