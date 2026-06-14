import * as THREE from 'three'

export interface ZoneConfig {
  name: string
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  fogColor: THREE.Color
  fogNear: number
  fogFar: number
}

export const ZONES: ZoneConfig[] = [
  {
    name: 'sunset',
    cameraPosition: new THREE.Vector3(0, 1.4, 6.5),
    cameraTarget: new THREE.Vector3(0, 0, -5),
    fogColor: new THREE.Color('#1a0820'),
    fogNear: 15,
    fogFar: 60,
  },
  {
    name: 'surface',
    cameraPosition: new THREE.Vector3(0, -1.4, -2),
    cameraTarget: new THREE.Vector3(0, -6, -8),
    fogColor: new THREE.Color('#053447'),
    fogNear: 4,
    fogFar: 30,
  },
  {
    name: 'shallow',
    cameraPosition: new THREE.Vector3(0, -6, -8),
    cameraTarget: new THREE.Vector3(0, -14, -12),
    fogColor: new THREE.Color('#03212d'),
    fogNear: 3,
    fogFar: 22,
  },
  {
    name: 'mid',
    cameraPosition: new THREE.Vector3(0, -18, -14),
    cameraTarget: new THREE.Vector3(0, -28, -16),
    fogColor: new THREE.Color('#01121b'),
    fogNear: 2,
    fogFar: 16,
  },
  {
    name: 'abyss',
    cameraPosition: new THREE.Vector3(0, -38, -18),
    cameraTarget: new THREE.Vector3(0, -50, -18),
    fogColor: new THREE.Color('#000305'),
    fogNear: 1,
    fogFar: 10,
  },
]

// Catmull-Rom waypoints for the zone 0 -> zone 1 plunge. Camera pushes forward
// over the beach, dips toward the water surface, punches through, then settles
// into the surface zone pose. Targets pull the gaze downward through the same
// curve so the look-vector swings naturally with the body of the camera.
export const DIVE_POSITIONS: THREE.Vector3[] = [
  new THREE.Vector3(0, 1.4, 6.5),
  new THREE.Vector3(0, 0.6, 3.5),
  new THREE.Vector3(0, -0.2, 0.5),
  new THREE.Vector3(0, -0.95, -1.2),
  new THREE.Vector3(0, -1.4, -2),
]

export const DIVE_TARGETS: THREE.Vector3[] = [
  new THREE.Vector3(0, 0, -5),
  new THREE.Vector3(0, -1, -5),
  new THREE.Vector3(0, -3, -6),
  new THREE.Vector3(0, -5, -7),
  new THREE.Vector3(0, -6, -8),
]

// The y at which the camera punches through the water surface; used to spike
// chromatic aberration and densify fog at the crossing instant.
export const WATER_SURFACE_Y = -1.0

export const ZONE_COUNT = ZONES.length
