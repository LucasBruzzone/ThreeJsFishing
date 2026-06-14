import { useRef, useMemo, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

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
const FLIGHT_OFFSET = new THREE.Vector3(2.0, 1.8, 4.8)
// Offset once the hook is in the water — side-on, close, "much more zoomed",
// with vertical room for things passing on the sides as it sinks.
const SINK_OFFSET = new THREE.Vector3(1.8, 0.55, 0.4)
// Target sits slightly above the candle so the candle frames in the lower
// third — panorama above for content to pass — but NOT so high that the
// candle drops out of frame entirely.
const CHASE_TARGET_OFFSET = new THREE.Vector3(0, 0.55, 0)
// Window after splash to cross-fade flight offset → sink offset.
const SPLASH_BLEND_WINDOW = 0.04
// Slow lateral drift so the chase doesn't feel rigid.
const CHASE_DRIFT_AMP = 0.25
const CHASE_DRIFT_SPEED = 0.08

const SceneController = ({ scrollRef }: Props) => {
  const { scene, camera } = useThree()
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const tmpCameraPos = useMemo(() => new THREE.Vector3(), [])
  const tmpCameraTarget = useMemo(() => new THREE.Vector3(), [])
  const beachCamPos = useMemo(() => new THREE.Vector3(), [])
  const beachCamTarget = useMemo(() => new THREE.Vector3(), [])
  const chaseCamPos = useMemo(() => new THREE.Vector3(), [])
  const chaseCamTarget = useMemo(() => new THREE.Vector3(), [])

  const lightColors = useMemo(
    () => ZONE_LIGHTS.map(light => ({
      ambient: new THREE.Color(light.ambientColor),
      directional: new THREE.Color(light.directionalColor),
    })),
    [],
  )

  const dirPos = useMemo(() => ZONE_LIGHTS.map(l => new THREE.Vector3(...l.directionalPosition)), [])

  useFrame((state) => {
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

    const t = scrollRef.current
    const time = state.clock.elapsedTime

    beachCamPos.copy(ZONES[0].cameraPosition)
    beachCamTarget.copy(ZONES[0].cameraTarget)

    if (t < HOOK_HANG_END) {
      tmpCameraPos.copy(beachCamPos)
      tmpCameraTarget.copy(beachCamTarget)
    } else {
      // Once the cast launches, the hook IS the subject — frame stays on it
      // throughout flight, splash and descent. Only the offset changes.
      const splashMix = THREE.MathUtils.clamp((t - HOOK_SPLASH_T) / SPLASH_BLEND_WINDOW, 0, 1)
      const offX = THREE.MathUtils.lerp(FLIGHT_OFFSET.x, SINK_OFFSET.x, splashMix)
      const offY = THREE.MathUtils.lerp(FLIGHT_OFFSET.y, SINK_OFFSET.y, splashMix)
      const offZ = THREE.MathUtils.lerp(FLIGHT_OFFSET.z, SINK_OFFSET.z, splashMix)
      const drift = Math.sin(time * CHASE_DRIFT_SPEED * Math.PI * 2) * CHASE_DRIFT_AMP

      chaseCamPos.set(
        hookWorldPosition.x + offX + drift,
        hookWorldPosition.y + offY,
        hookWorldPosition.z + offZ,
      )
      chaseCamTarget.copy(hookWorldPosition).add(CHASE_TARGET_OFFSET)

      if (t < HOOK_SPLASH_T) {
        // Ease BOTH position and target from beach pose to hook chase, so the
        // camera's swing onto the hook is continuous — no frame snap.
        const k = THREE.MathUtils.smoothstep(
          (t - HOOK_HANG_END) / (HOOK_SPLASH_T - HOOK_HANG_END), 0, 1,
        )
        tmpCameraPos.lerpVectors(beachCamPos, chaseCamPos, k)
        tmpCameraTarget.lerpVectors(beachCamTarget, chaseCamTarget, k)
      } else {
        tmpCameraPos.copy(chaseCamPos)
        tmpCameraTarget.copy(chaseCamTarget)
      }
    }

    camera.position.copy(tmpCameraPos)
    camera.lookAt(tmpCameraTarget)
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
