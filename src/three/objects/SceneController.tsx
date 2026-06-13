import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import { ZONES } from '../config/zones'
import { ZONE_LIGHTS } from '../config/lighting'

interface Props {
  scrollRef: MutableRefObject<number>
}

const SceneController = ({ scrollRef }: Props) => {
  const { scene } = useThree()
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const dirRef = useRef<THREE.DirectionalLight>(null)

  const lightColors = useMemo(
    () => ZONE_LIGHTS.map(light => ({
      ambient: new THREE.Color(light.ambientColor),
      directional: new THREE.Color(light.directionalColor),
    })),
    [],
  )

  const dirPos = useMemo(() => ZONE_LIGHTS.map(l => new THREE.Vector3(...l.directionalPosition)), [])

  useFrame(() => {
    const { currentZone, nextZone, blend } = getZoneTransition(scrollRef.current)

    const zA = ZONES[currentZone]
    const zB = ZONES[nextZone]
    const lA = ZONE_LIGHTS[currentZone]
    const lB = ZONE_LIGHTS[nextZone]

    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerpColors(zA.fogColor, zB.fogColor, blend)
      scene.fog.near = THREE.MathUtils.lerp(zA.fogNear, zB.fogNear, blend)
      scene.fog.far = THREE.MathUtils.lerp(zA.fogFar, zB.fogFar, blend)
    }

    if (scene.background instanceof THREE.Color) {
      scene.background.lerpColors(zA.fogColor, zB.fogColor, blend)
    }

    if (ambientRef.current) {
      ambientRef.current.color.lerpColors(lightColors[currentZone].ambient, lightColors[nextZone].ambient, blend)
      ambientRef.current.intensity = THREE.MathUtils.lerp(lA.ambientIntensity, lB.ambientIntensity, blend)
    }

    if (dirRef.current) {
      dirRef.current.color.lerpColors(lightColors[currentZone].directional, lightColors[nextZone].directional, blend)
      dirRef.current.intensity = THREE.MathUtils.lerp(lA.directionalIntensity, lB.directionalIntensity, blend)
      dirRef.current.position.lerpVectors(dirPos[currentZone], dirPos[nextZone], blend)
    }
  })

  const initial = ZONE_LIGHTS[0]

  return (
    <>
      <ambientLight ref={ambientRef} intensity={initial.ambientIntensity} color={initial.ambientColor} />
      <directionalLight
        ref={dirRef}
        intensity={initial.directionalIntensity}
        color={initial.directionalColor}
        position={initial.directionalPosition}
      />
    </>
  )
}

export default SceneController
