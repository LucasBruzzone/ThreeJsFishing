import { useEffect, useRef, type MutableRefObject } from 'react'
import Lenis from 'lenis'

export const useScrollProgress = (): MutableRefObject<number> => {
  const progressRef = useRef(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
    })

    lenis.scrollTo(0, { immediate: true })

    lenis.on('scroll', (instance) => {
      progressRef.current = instance.progress
    })

    let rafId: number

    const tick = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return progressRef
}
