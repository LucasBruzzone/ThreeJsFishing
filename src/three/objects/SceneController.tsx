import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AmbientLight, Color, DirectionalLight, Fog, MathUtils, Vector3 } from 'three'

import { getZoneTransition } from '../hooks/useZoneTransition'
import { ZONES } from '../config/zones'
import { ZONE_LIGHTS } from '../config/lighting'
import { HOOK_HANG_END, HOOK_SPLASH_T } from '../config/hookTrajectory'
import { hookWorldPosition } from '../state/hookState'

interface Props {
  scrollRef: MutableRefObject<number>
}

// Offset while the hook is airborne — well behind and above so we see the
// whole arc, the character, the water, the horizon. Wide cinematic frame.
const FLIGHT_OFFSET = new Vector3(2.0, 1.8, 4.8)
// Offset once the hook is in the water — side-on, close, "much more zoomed",
// with vertical room for things passing on the sides as it sinks.
const SINK_OFFSET = new Vector3(1.8, 0.55, 0.4)
// Target sits slightly above the candle so the candle frames in the lower
// third — panorama above for content to pass — but NOT so high that the
// candle drops out of frame entirely.
const CHASE_TARGET_OFFSET = new Vector3(0, 0.55, 0)
// Window after splash to cross-fade flight offset → sink offset.
const SPLASH_BLEND_WINDOW = 0.04
// Slow lateral drift so the chase doesn't feel rigid.
const CHASE_DRIFT_AMPLITUDE = 0.25
const CHASE_DRIFT_SPEED = 0.08

const SceneController = ({ scrollRef }: Props) => {
  const { scene, camera } = useThree()
  const ambientRef = useRef<AmbientLight>(null)
  const directionalRef = useRef<DirectionalLight>(null)
  const tempCameraPosition = useMemo(() => new Vector3(), [])
  const tempCameraTarget = useMemo(() => new Vector3(), [])
  const beachCameraPosition = useMemo(() => new Vector3(), [])
  const beachCameraTarget = useMemo(() => new Vector3(), [])
  const chaseCameraPosition = useMemo(() => new Vector3(), [])
  const chaseCameraTarget = useMemo(() => new Vector3(), [])

  const lightColors = useMemo(
    () => ZONE_LIGHTS.map(light => ({
      ambient: new Color(light.ambientColor),
      directional: new Color(light.directionalColor),
    })),
    [],
  )

  const directionalPositions = useMemo(
    () => ZONE_LIGHTS.map(light => new Vector3(...light.directionalPosition)),
    [],
  )

  useFrame((state) => {
    const { currentZone, nextZone, blend } = getZoneTransition(scrollRef.current)

    const currentZoneConfig = ZONES[currentZone]
    const nextZoneConfig = ZONES[nextZone]
    const currentLightConfig = ZONE_LIGHTS[currentZone]
    const nextLightConfig = ZONE_LIGHTS[nextZone]

    if (scene.fog instanceof Fog) {
      scene.fog.color.lerpColors(currentZoneConfig.fogColor, nextZoneConfig.fogColor, blend)
      scene.fog.near = MathUtils.lerp(currentZoneConfig.fogNear, nextZoneConfig.fogNear, blend)
      scene.fog.far = MathUtils.lerp(currentZoneConfig.fogFar, nextZoneConfig.fogFar, blend)
    }

    if (scene.background instanceof Color) {
      scene.background.lerpColors(currentZoneConfig.fogColor, nextZoneConfig.fogColor, blend)
    }

    if (ambientRef.current) {
      ambientRef.current.color.lerpColors(lightColors[currentZone].ambient, lightColors[nextZone].ambient, blend)
      ambientRef.current.intensity = MathUtils.lerp(currentLightConfig.ambientIntensity, nextLightConfig.ambientIntensity, blend)
    }

    if (directionalRef.current) {
      directionalRef.current.color.lerpColors(lightColors[currentZone].directional, lightColors[nextZone].directional, blend)
      directionalRef.current.intensity = MathUtils.lerp(currentLightConfig.directionalIntensity, nextLightConfig.directionalIntensity, blend)
      directionalRef.current.position.lerpVectors(directionalPositions[currentZone], directionalPositions[nextZone], blend)
    }

    const scrollProgress = scrollRef.current
    const elapsedTime = state.clock.elapsedTime

    beachCameraPosition.copy(ZONES[0].cameraPosition)
    beachCameraTarget.copy(ZONES[0].cameraTarget)

    if (scrollProgress < HOOK_HANG_END) {
      tempCameraPosition.copy(beachCameraPosition)
      tempCameraTarget.copy(beachCameraTarget)
    } else {
      // Once the cast launches, the hook IS the subject. Frame stays on it
      // throughout flight, splash and descent. Only the offset changes.
      const splashMix = MathUtils.clamp((scrollProgress - HOOK_SPLASH_T) / SPLASH_BLEND_WINDOW, 0, 1)
      const offsetX = MathUtils.lerp(FLIGHT_OFFSET.x, SINK_OFFSET.x, splashMix)
      const offsetY = MathUtils.lerp(FLIGHT_OFFSET.y, SINK_OFFSET.y, splashMix)
      const offsetZ = MathUtils.lerp(FLIGHT_OFFSET.z, SINK_OFFSET.z, splashMix)
      const lateralDrift = Math.sin(elapsedTime * CHASE_DRIFT_SPEED * Math.PI * 2) * CHASE_DRIFT_AMPLITUDE

      chaseCameraPosition.set(
        hookWorldPosition.x + offsetX + lateralDrift,
        hookWorldPosition.y + offsetY,
        hookWorldPosition.z + offsetZ,
      )
      chaseCameraTarget.copy(hookWorldPosition).add(CHASE_TARGET_OFFSET)

      if (scrollProgress < HOOK_SPLASH_T) {
        // Ease BOTH position and target from beach pose to hook chase, so the
        // camera's swing onto the hook is continuous (no frame snap).
        const easedProgress = MathUtils.smoothstep(
          (scrollProgress - HOOK_HANG_END) / (HOOK_SPLASH_T - HOOK_HANG_END), 0, 1,
        )
        tempCameraPosition.lerpVectors(beachCameraPosition, chaseCameraPosition, easedProgress)
        tempCameraTarget.lerpVectors(beachCameraTarget, chaseCameraTarget, easedProgress)
      } else {
        tempCameraPosition.copy(chaseCameraPosition)
        tempCameraTarget.copy(chaseCameraTarget)
      }
    }

    camera.position.copy(tempCameraPosition)
    camera.lookAt(tempCameraTarget)
  })

  const initial = ZONE_LIGHTS[0]

  return (
    <>
      <ambientLight ref={ambientRef} intensity={initial.ambientIntensity} color={initial.ambientColor} />
      <directionalLight
        ref={directionalRef}
        intensity={initial.directionalIntensity}
        color={initial.directionalColor}
        position={initial.directionalPosition}
      />
    </>
  )
}

export default SceneController
