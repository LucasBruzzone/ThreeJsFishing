import { useEffect, useRef, type MutableRefObject } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useScrollProgress = (): MutableRefObject<number> => {
  const progressRef = useRef(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      progressRef.current = progress
    })

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (value !== undefined) lenis.scrollTo(value, { immediate: true })
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    const onRaf = (time: number) => {
      lenis.raf(time)
      ScrollTrigger.update()
    }

    gsap.ticker.add(onRaf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onRaf)
      lenis.destroy()
    }
  }, [])

  return progressRef
}
