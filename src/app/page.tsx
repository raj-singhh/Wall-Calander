import Image from 'next/image';
import styles from './page.module.css';
import Calendar from '@/components/Calendar';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.calendarContainer}>
        {/* Left Side: Hero Image to give Physical Wall Calendar feel */}
        <section className={styles.heroSection}>
          <Image
            src="/hero.png"
            alt="Scenic Mountain Landscape"
            fill
            priority
            className={styles.heroImage}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className={styles.heroOverlay}>
            <h2>Wall Calendar</h2>
            <p>Plan your upcoming month</p>
          </div>
        </section>

        {/* Right Side: Interactive Calendar & Notes */}
        <section className={styles.interactiveSection}>
          <Calendar />
        </section>
      </div>
    </main>
  );
}
