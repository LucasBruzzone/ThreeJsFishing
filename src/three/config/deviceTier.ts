const MIN_HIGH_END_CORES = 4
const MIN_HIGH_END_WIDTH = 900

// Detect low-end devices once at module load. We don't react to changes
// (rotation, multi-monitor moves) because re-allocating particle buffers
// mid-session would visibly pop.
export const IS_LOW_END = (() => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? MIN_HIGH_END_CORES
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  return cores < MIN_HIGH_END_CORES || (isTouch && window.innerWidth < MIN_HIGH_END_WIDTH)
})()
