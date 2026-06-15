import { useRef, useMemo, useEffect, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { AdditiveBlending, Box3, Color, DoubleSide, Group, MathUtils, Mesh, MeshStandardMaterial, Object3D, PointLight, Quaternion, SpotLight, Vector3 } from 'three'

import { hookWorldPosition } from '../state/hookState'
import { HOOK_HANG_END, HOOK_SPLASH_T } from '../config/hookTrajectory'
import flameVertexShader from '../shaders/flame.vert.glsl'
import flameFragmentShader from '../shaders/flame.frag.glsl'

interface Props {
  scrollRef: MutableRefObject<number>
}

const VERTICAL = new Vector3(0, 1, 0)
const UP_QUAT = new Quaternion()

// World-space height the candle model is scaled to. Exported because the
// rope (HookLine) needs to know where the candle's top sits relative to
// hookWorldPosition (which is the candle's base).
export const CANDLE_HEIGHT = 0.5
const CAST_SCALE = 0.5     // candle shrinks to half during flight
const WATER_SCALE = 1.0    // full size once underwater
const CANDLE_URL = '/models/candle.glb'

useGLTF.preload(CANDLE_URL)

const Candle = ({ scrollRef }: Props) => {
  const groupRef = useRef<Group>(null)
  const scaleGroupRef = useRef<Group>(null)
  const flameRef = useRef<Mesh>(null)
  const lightRef = useRef<PointLight>(null)
  const spotRef = useRef<SpotLight>(null)
  const spotTargetRef = useRef<Object3D>(null)

  const previousPosition = useMemo(() => new Vector3(), [])
  const velocity = useMemo(() => new Vector3(), [])
  const targetQuat = useMemo(() => new Quaternion(), [])
  const hasPrev = useRef(false)

  const { scene } = useGLTF(CANDLE_URL)

  const { candleScene, baseScale, modelOffsetY, topY } = useMemo(() => {
    const cloned = scene.clone(true)
    const boundingBox = new Box3().setFromObject(cloned)
    const computedScale = boundingBox.max.y - boundingBox.min.y > 0
      ? CANDLE_HEIGHT / (boundingBox.max.y - boundingBox.min.y)
      : 1
    return {
      candleScene: cloned,
      baseScale: computedScale,
      modelOffsetY: -boundingBox.min.y * computedScale,
      topY: CANDLE_HEIGHT,
    }
  }, [scene])

  useEffect(() => {
    candleScene.traverse((child) => {
      if (!(child instanceof Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      child.material = new MeshStandardMaterial({
        color: new Color('#f0ece4'),
        roughness: 0.8,
        metalness: 0,
      })
    })
  }, [candleScene])

  // The spotLight's target must be assigned imperatively. Passing the ref
  // via JSX (`target={spotTargetRef.current}`) captures `null` on the first
  // render and never re-applies, so the cone would default to world origin.
  useEffect(() => {
    if (spotRef.current && spotTargetRef.current) {
      spotRef.current.target = spotTargetRef.current
    }
  }, [])

  const flameUniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  const flameBaseY = topY + 0.002

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.copy(hookWorldPosition)

    const scrollProgress = scrollRef.current
    const inFlight = scrollProgress >= HOOK_HANG_END && scrollProgress < HOOK_SPLASH_T

    if (hasPrev.current && inFlight) {
      velocity.subVectors(hookWorldPosition, previousPosition)
      if (velocity.lengthSq() > 1e-6) {
        velocity.normalize()
        targetQuat.setFromUnitVectors(VERTICAL, velocity)
      }
    } else {
      targetQuat.copy(UP_QUAT)
    }
    groupRef.current.quaternion.slerp(targetQuat, 0.25)

    // Scale: small during cast, transitions to full once underwater.
    const underwaterProgress = MathUtils.clamp(
      (scrollProgress - HOOK_SPLASH_T) / 0.04,
      0,
      1,
    )
    const targetScale = MathUtils.lerp(CAST_SCALE, WATER_SCALE, underwaterProgress)
    if (scaleGroupRef.current) {
      const current = scaleGroupRef.current.scale.x
      const next = MathUtils.lerp(current, targetScale, 0.15)
      scaleGroupRef.current.scale.setScalar(next)
    }

    previousPosition.copy(hookWorldPosition)
    hasPrev.current = true

    const elapsedTime = clock.elapsedTime
    flameUniforms.uTime.value = elapsedTime

    // Flicker: combine fast + slow sines for organic chaos.
    const flickerFast = Math.sin(elapsedTime * 17.3) * 0.6 + Math.sin(elapsedTime * 11.1) * 0.4
    const flickerSlow = Math.sin(elapsedTime * 3.7) * 0.3
    const flicker = flickerFast + flickerSlow

    // Light power ramps up as the candle descends underwater. Above water the
    // candle is a tiny prop in the sunset hero — a 22-intensity point light
    // there would obliterate the beach. Underwater the surrounding fog is
    // dark and we want the candle to actually pierce the column.
    const depthProgress = MathUtils.clamp(
      (scrollProgress - HOOK_SPLASH_T) / 0.08,
      0,
      1,
    )
    const pointBaseIntensity = MathUtils.lerp(1.2, 18, depthProgress)
    const spotBaseIntensity = MathUtils.lerp(0, 14, depthProgress)

    if (lightRef.current) {
      lightRef.current.intensity = pointBaseIntensity + flicker * (depthProgress * 3)
      lightRef.current.distance = MathUtils.lerp(4, 22, depthProgress)
    }
    if (spotRef.current) {
      spotRef.current.intensity = spotBaseIntensity + flicker * (depthProgress * 2)
    }
    if (flameRef.current) {
      flameRef.current.rotation.z = Math.sin(elapsedTime * 3.1) * 0.05
      const breathe = 1 + Math.sin(elapsedTime * 6.5) * 0.04
      flameRef.current.scale.set(breathe, 1 + Math.sin(elapsedTime * 9.2) * 0.06, breathe)
    }
  })

  return (
    <group ref={groupRef}>
      <group ref={scaleGroupRef}>
        <primitive object={candleScene} scale={baseScale} position={[0, modelOffsetY, 0]} />

        <mesh position={[0, topY + 0.005, 0]}>
          <cylinderGeometry args={[0.0025, 0.0035, 0.014, 6]} />
          <meshStandardMaterial color="#0a0604" roughness={0.95} />
        </mesh>

        <mesh position={[0, topY + 0.012, 0]}>
          <sphereGeometry args={[0.003, 8, 6]} />
          <meshBasicMaterial color="#ff8830" toneMapped={false} fog={false} />
        </mesh>

        {/* Smaller, narrower teardrop flame */}
        <mesh ref={flameRef} position={[0, flameBaseY + 0.03, 0]}>
          <coneGeometry args={[0.013, 0.06, 16, 6]} />
          <shaderMaterial
            vertexShader={flameVertexShader}
            fragmentShader={flameFragmentShader}
            uniforms={flameUniforms}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>

        {/* Tiny inner core for punchy hotspot */}
        <mesh position={[0, flameBaseY + 0.018, 0]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshBasicMaterial color="#fff4d0" toneMapped={false} fog={false} />
        </mesh>

        {/* Omnidirectional warm light — the candle's actual illumination */}
        <pointLight
          ref={lightRef}
          position={[0, flameBaseY + 0.025, 0]}
          color="#ffb060"
          intensity={22}
          distance={28}
          decay={1.4}
        />

        {/* Downward cone for god-ray feel through the water column */}
        <object3D ref={spotTargetRef} position={[0, -8, 0]} />
        <spotLight
          ref={spotRef}
          position={[0, flameBaseY + 0.02, 0]}
          color="#ffc080"
          intensity={18}
          distance={18}
          angle={Math.PI / 4}
          penumbra={0.85}
          decay={1.6}
        />
      </group>
    </group>
  )
}

export default Candle
