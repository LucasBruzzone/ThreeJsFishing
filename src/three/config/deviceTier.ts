// Detect low-end devices once at module load. We don't react to changes
// (rotation, multi-monitor moves) because re-allocating particle buffers
// mid-session would visibly pop.
export const IS_LOW_END = (() => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? 4
  const isTouch = window.matchMedia('(pointer: coarse)').matches
  return cores < 4 || (isTouch && window.innerWidth < 900)
})()
