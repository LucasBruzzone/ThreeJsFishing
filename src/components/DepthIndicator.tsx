import styles from './DepthIndicator.module.css'

const ZONES = [
  { label: 'Sunset' },
  { label: 'Forest' },
  { label: 'Shore' },
  { label: 'Shallows' },
  { label: 'Deep' },
]

interface Props {
  activeZone: number
}

const DepthIndicator = ({ activeZone }: Props) => (
  <nav className={styles.indicator}>
    <div className={styles.track}>
      {ZONES.map((zone, index) => (
        <div key={zone.label} className={styles.stop}>
          <span className={`${styles.label} ${index === activeZone ? styles.labelActive : ''}`}>
            {zone.label}
          </span>
          <div className={`${styles.dot} ${index === activeZone ? styles.dotActive : ''}`} />
        </div>
      ))}
      <div
        className={styles.progress}
        style={{ height: `${(activeZone / (ZONES.length - 1)) * 100}%` }}
      />
    </div>
  </nav>
)

export default DepthIndicator
