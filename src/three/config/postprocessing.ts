export interface PostConfig {
  bloomIntensity: number
  bloomThreshold: number
  luminanceSmoothing: number
  chromaticAberrationOffset: number
  vignetteOffset: number
  vignetteDarkness: number
}

export const ZONE_POST: PostConfig[] = [
  {
    bloomIntensity: 0.15,
    bloomThreshold: 0.95,
    luminanceSmoothing: 0.6,
    chromaticAberrationOffset: 0.0002,
    vignetteOffset: 0.4,
    vignetteDarkness: 0.8,
  },
  {
    bloomIntensity: 0.3,
    bloomThreshold: 0.8,
    luminanceSmoothing: 0.3,
    chromaticAberrationOffset: 0.0002,
    vignetteOffset: 0.35,
    vignetteDarkness: 0.85,
  },
  {
    bloomIntensity: 0.6,
    bloomThreshold: 0.6,
    luminanceSmoothing: 0.5,
    chromaticAberrationOffset: 0.0004,
    vignetteOffset: 0.3,
    vignetteDarkness: 0.8,
  },
  {
    bloomIntensity: 0.5,
    bloomThreshold: 0.65,
    luminanceSmoothing: 0.4,
    chromaticAberrationOffset: 0.0003,
    vignetteOffset: 0.4,
    vignetteDarkness: 0.9,
  },
  {
    bloomIntensity: 1.2,
    bloomThreshold: 0.4,
    luminanceSmoothing: 0.7,
    chromaticAberrationOffset: 0.0006,
    vignetteOffset: 0.5,
    vignetteDarkness: 0.95,
  },
]
