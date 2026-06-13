import { useState, useEffect, useRef } from 'react'

import WorldScene from './three/scenes/WorldScene'
import DepthIndicator from './components/DepthIndicator'
import { useScrollProgress } from './three/hooks/useScrollProgress'
import { getZoneTransition } from './three/hooks/useZoneTransition'

import styles from './App.module.css'

const App = () => {
  const scrollRef = useScrollProgress()
  const [activeZone, setActiveZone] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const { currentZone } = getZoneTransition(scrollRef.current)
      setActiveZone(prev => prev === currentZone ? prev : currentZone)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [scrollRef])

  return (
    <div className={styles.root}>
      <WorldScene scrollRef={scrollRef} />
      <DepthIndicator activeZone={activeZone} />
      <div className={styles.sections}>
        <div className={styles.section} />
        <div className={styles.section} />
        <div className={styles.section} />
        <div className={styles.section} />
        <div className={styles.section} />
      </div>
    </div>
  )
}

export default App
