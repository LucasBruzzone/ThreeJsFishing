import { Color, Vector3 } from 'three'

export interface ZoneConfig {
  name: string
  cameraPosition: Vector3
  cameraTarget: Vector3
  fogColor: Color
  fogNear: number
  fogFar: number
}

export const ZONES: ZoneConfig[] = [
  {
    name: 'sunset',
    cameraPosition: new Vector3(0, 1.4, 6.5),
    cameraTarget: new Vector3(0, 0, -5),
    fogColor: new Color('#1a0820'),
    fogNear: 15,
    fogFar: 60,
  },
  {
    name: 'surface',
    cameraPosition: new Vector3(0, -1.4, -2),
    cameraTarget: new Vector3(0, -6, -8),
    fogColor: new Color('#053447'),
    fogNear: 4,
    fogFar: 30,
  },
  {
    name: 'shallow',
    cameraPosition: new Vector3(0, -6, -8),
    cameraTarget: new Vector3(0, -14, -12),
    fogColor: new Color('#03212d'),
    fogNear: 3,
    fogFar: 22,
  },
  {
    name: 'mid',
    cameraPosition: new Vector3(0, -18, -14),
    cameraTarget: new Vector3(0, -28, -16),
    fogColor: new Color('#01121b'),
    fogNear: 2,
    fogFar: 16,
  },
  {
    name: 'abyss',
    cameraPosition: new Vector3(0, -38, -18),
    cameraTarget: new Vector3(0, -50, -18),
    fogColor: new Color('#000305'),
    fogNear: 1,
    fogFar: 10,
  },
]

// Y of the water plane. Single source of truth: BeachScene positions the
// ocean mesh here, HookLine uses it to switch the rope from diagonal-to-rod
// to straight-up underwater.
export const WATER_SURFACE_Y = -1.15

export const ZONE_COUNT = ZONES.length
