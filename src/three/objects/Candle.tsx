import { useRef, useMemo, useEffect, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import { hookWorldPosition } from '../state/hookState'
import { HOOK_HANG_END, HOOK_SPLASH_T } from '../config/hookTrajectory'
import flameVertexShader from '../shaders/flame.vert.glsl'
import flameFragmentShader from '../shaders/flame.frag.glsl'

interface Props {
  scrollRef: MutableRefObject<number>
}

const VERTICAL = new THREE.Vector3(0, 1, 0)
const UP_QUAT = new THREE.Quaternion()

// World-space height the candle model is scaled to. Exported because the
// rope (HookLine) needs to know where the candle's top sits relative to
// hookWorldPosition (which is the candle's base).
export const CANDLE_HEIGHT = 0.5
const CAST_SCALE = 0.5     // candle shrinks to half during flight
const WATER_SCALE = 1.0    // full size once underwater
const CANDLE_URL = '/models/candle.glb'

useGLTF.preload(CANDLE_URL)

const Candle = ({ scrollRef }: Props) => {
  const groupRef = useRef<THREE.Group>(null)
  const scaleGroupRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const spotRef = useRef<THREE.SpotLight>(null)
  const spotTargetRef = useRef<THREE.Object3D>(null)

  const prevPos = useMemo(() => new THREE.Vector3(), [])
  const velocity = useMemo(() => new THREE.Vector3(), [])
  const targetQuat = useMemo(() => new THREE.Quaternion(), [])
  const hasPrev = useRef(false)

  const { scene } = useGLTF(CANDLE_URL)

  const { candleScene, baseScale, modelOffsetY, topY } = useMemo(() => {
    const cloned = scene.clone(true)
    const bbox = new THREE.Box3().setFromObject(cloned)
    const computedScale = bbox.max.y - bbox.min.y > 0 ? CANDLE_HEIGHT / (bbox.max.y - bbox.min.y) : 1
    return {
      candleScene: cloned,
      baseScale: computedScale,
      modelOffsetY: -bbox.min.y * computedScale,
      topY: CANDLE_HEIGHT,
    }
  }, [scene])

  useEffect(() => {
    candleScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      child.castShadow = true
      child.receiveShadow = true
      child.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f0ece4'),
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

    const scrollT = scrollRef.current
    const inFlight = scrollT >= HOOK_HANG_END && scrollT < HOOK_SPLASH_T

    if (hasPrev.current && inFlight) {
      velocity.subVectors(hookWorldPosition, prevPos)
      if (velocity.lengthSq() > 1e-6) {
        velocity.normalize()
        targetQuat.setFromUnitVectors(VERTICAL, velocity)
      }
    } else {
      targetQuat.copy(UP_QUAT)
    }
    groupRef.current.quaternion.slerp(targetQuat, 0.25)

    // Scale: small during cast, transitions to full once underwater.
    const underwaterT = THREE.MathUtils.clamp(
      (scrollT - HOOK_SPLASH_T) / 0.04,
      0,
      1,
    )
    const targetScale = THREE.MathUtils.lerp(CAST_SCALE, WATER_SCALE, underwaterT)
    if (scaleGroupRef.current) {
      const current = scaleGroupRef.current.scale.x
      const next = THREE.MathUtils.lerp(current, targetScale, 0.15)
      scaleGroupRef.current.scale.setScalar(next)
    }

    prevPos.copy(hookWorldPosition)
    hasPrev.current = true

    const t = clock.elapsedTime
    flameUniforms.uTime.value = t

    // Flicker: combine fast + slow sines for organic chaos.
    const flickerFast = Math.sin(t * 17.3) * 0.6 + Math.sin(t * 11.1) * 0.4
    const flickerSlow = Math.sin(t * 3.7) * 0.3
    const flicker = flickerFast + flickerSlow

    // Light power ramps up as the candle descends underwater. Above water the
    // candle is a tiny prop in the sunset hero — a 22-intensity point light
    // there would obliterate the beach. Underwater the surrounding fog is
    // dark and we want the candle to actually pierce the column.
    const depthT = THREE.MathUtils.clamp(
      (scrollT - HOOK_SPLASH_T) / 0.08,
      0,
      1,
    )
    const pointBase = THREE.MathUtils.lerp(1.2, 18, depthT)
    const spotBase = THREE.MathUtils.lerp(0, 14, depthT)

    if (lightRef.current) {
      lightRef.current.intensity = pointBase + flicker * (depthT * 3)
      lightRef.current.distance = THREE.MathUtils.lerp(4, 22, depthT)
    }
    if (spotRef.current) {
      spotRef.current.intensity = spotBase + flicker * (depthT * 2)
    }
    if (flameRef.current) {
      flameRef.current.rotation.z = Math.sin(t * 3.1) * 0.05
      const breathe = 1 + Math.sin(t * 6.5) * 0.04
      flameRef.current.scale.set(breathe, 1 + Math.sin(t * 9.2) * 0.06, breathe)
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
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
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
