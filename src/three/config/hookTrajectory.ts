import * as THREE from 'three'

import { ZONE_COUNT } from './zones'

// Fraction of the cast clip at which the character's right hand reaches peak
// velocity (measured by sampling the mixamo.com clip at 8.75s, 190 frames).
// This is the natural release moment — the hook detaches from the rod tip
// when the swing is at maximum forward speed.
const CAST_RELEASE_CLIP_FRAC = 0.22

// How far into the cast clip FishingCharacter scrubs to before clamping at
// the end. Re-exported so FishingCharacter consumes the same value and the
// release timing stays locked.
export const CAST_SCRUB_END = 0.95

// Scroll-progress milestones for the hook's life cycle. HOOK_HANG_END is
// derived from the cast clip's peak-velocity frame: FishingCharacter maps
// blend → clip frac via `scrub = blend / CAST_SCRUB_END`, and zone 0 maps
// scroll → blend via `blend = scroll * (ZONE_COUNT - 1)`. Solving for the
// release scroll keeps the rod, hook, and character animation locked to the
// same instant no matter how the scrub or zone count are tuned.
export const HOOK_HANG_END = (CAST_RELEASE_CLIP_FRAC * CAST_SCRUB_END) / (ZONE_COUNT - 1)
export const HOOK_SPLASH_T = 0.22
export const HOOK_SINK_END = 0.95

// Where the hook enters the water. Must be beyond the sand plane (z < -5)
// so the sand doesn't occlude the hook the moment it lands.
export const HOOK_SPLASH_POINT = new THREE.Vector3(0, -1.16, -18)
// Deep terminal point — the hook keeps sinking through every zone, anchoring
// the camera's gaze as the world transitions around it.
export const HOOK_SINK_END_POINT = new THREE.Vector3(0, -42, -22)

// Apex height of the parabolic flight arc above the midpoint between launch
// and splash. Higher = more dramatic arc.
const FLIGHT_APEX_HEIGHT = 3.5

const _apex = new THREE.Vector3()
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

// Quadratic bezier — gives a clean parabola without needing a curve allocation
// every frame.
export const flightArc = (
  rodTipWorld: THREE.Vector3,
  flightT: number,
  out: THREE.Vector3,
) => {
  _apex.lerpVectors(rodTipWorld, HOOK_SPLASH_POINT, 0.5)
  _apex.y += FLIGHT_APEX_HEIGHT
  _a.lerpVectors(rodTipWorld, _apex, flightT)
  _b.lerpVectors(_apex, HOOK_SPLASH_POINT, flightT)
  out.lerpVectors(_a, _b, flightT)
}

// Eased descent — fast just after splash (entry momentum), then steady.
export const descentEase = (t: number) => {
  const eased = 1 - Math.pow(1 - t, 1.6)
  return eased
}
