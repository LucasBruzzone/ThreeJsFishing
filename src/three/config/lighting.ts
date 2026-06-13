export interface LightConfig {
  ambientIntensity: number
  ambientColor: string
  directionalIntensity: number
  directionalColor: string
  directionalPosition: [number, number, number]
}

export const ZONE_LIGHTS: LightConfig[] = [
  {
    ambientIntensity: 0.6,
    ambientColor: '#fde8c0',
    directionalIntensity: 1.2,
    directionalColor: '#f5a623',
    directionalPosition: [-5, 3, 5],
  },
  {
    ambientIntensity: 0.2,
    ambientColor: '#162e0c',
    directionalIntensity: 0.8,
    directionalColor: '#6abf45',
    directionalPosition: [2, 8, 2],
  },
  {
    ambientIntensity: 0.15,
    ambientColor: '#0d2840',
    directionalIntensity: 0.5,
    directionalColor: '#5aaed4',
    directionalPosition: [0, 10, 0],
  },
  {
    ambientIntensity: 0.08,
    ambientColor: '#040c1a',
    directionalIntensity: 0.3,
    directionalColor: '#4080c0',
    directionalPosition: [0, 5, 0],
  },
  {
    ambientIntensity: 0.03,
    ambientColor: '#000408',
    directionalIntensity: 0.1,
    directionalColor: '#00aaff',
    directionalPosition: [0, 2, 0],
  },
]
