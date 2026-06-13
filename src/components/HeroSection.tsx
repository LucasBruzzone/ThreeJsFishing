import styles from './HeroSection.module.css'

const HeroSection = () => (
  <section className={styles.hero}>
    <div className={styles.content}>
      <p className={styles.eyebrow}>Software Engineer &amp; Team Lead</p>
      <h1 className={styles.headline}>
        Hola,<br />soy Lucas.
      </h1>
      <p className={styles.sub}>
        Building products at the intersection<br />of craft and engineering.
      </p>
    </div>

    <div className={styles.scrollHint}>
      <span className={styles.scrollLabel}>scroll</span>
      <div className={styles.scrollLine}>
        <div className={styles.scrollDot} />
      </div>
    </div>
  </section>
)

export default HeroSection
