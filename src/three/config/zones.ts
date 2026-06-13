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
    cameraPosition: new THREE.Vector3(0, 2, 10),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    fogColor: new THREE.Color('#1a0820'),
    fogNear: 15,
    fogFar: 60,
  },
  {
    name: 'forest',
    cameraPosition: new THREE.Vector3(0, 1, -10),
    cameraTarget: new THREE.Vector3(0, 0, -20),
    fogColor: new THREE.Color('#0a1a06'),
    fogNear: 10,
    fogFar: 50,
  },
  {
    name: 'shore',
    cameraPosition: new THREE.Vector3(0, 0.5, -30),
    cameraTarget: new THREE.Vector3(0, 0, -40),
    fogColor: new THREE.Color('#060f1a'),
    fogNear: 12,
    fogFar: 55,
  },
  {
    name: 'shallowSea',
    cameraPosition: new THREE.Vector3(0, -1, -50),
    cameraTarget: new THREE.Vector3(0, -2, -60),
    fogColor: new THREE.Color('#020610'),
    fogNear: 8,
    fogFar: 45,
  },
  {
    name: 'deepSea',
    cameraPosition: new THREE.Vector3(0, -3, -70),
    cameraTarget: new THREE.Vector3(0, -4, -80),
    fogColor: new THREE.Color('#000204'),
    fogNear: 5,
    fogFar: 35,
  },
]

export const ZONE_COUNT = ZONES.length
