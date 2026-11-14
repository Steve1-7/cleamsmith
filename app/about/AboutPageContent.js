"use client";

import styles from "./about.module.css";
import SiteHeader from "../components/SiteHeader";
import usePublicContent from "../lib/usePublicContent";

export default function AboutPageContent() {
  const { pages } = usePublicContent();
  const page = pages.about;
  const storyParagraphs = String(page.intro || "").split(/\n\s*\n/).filter(Boolean);

  return (
    <main className={styles.page}>
      <SiteHeader variant="service" activePage="about" />

      <section className={styles.hero} aria-labelledby="story-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Our story</p>
          <h1 id="story-title">{page.hero_title}</h1>
          <p className={styles.subtitle}>{page.hero_subtitle}</p>
        </div>
      </section>

      <section className={styles.story} aria-label="The CleanSmith story">
        {storyParagraphs.map((paragraph, index) => (
          <p className={index === 0 ? styles.lead : undefined} key={`${index}-${paragraph.slice(0, 24)}`}>
            {paragraph}
          </p>
        ))}
      </section>

      <section className={styles.team} aria-labelledby="team-title">
        <div className={styles.teamCard}>
          <p className={styles.eyebrow}>{page.callout_title}</p>
          <h2 id="team-title">{page.section_title}</h2>
          <p>{page.callout_text}</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="/">CLEANSMITH</a>
        <a href="/#booking">Book your car wash</a>
      </footer>
    </main>
  );
}
