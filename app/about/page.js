import styles from "./about.module.css";

export const metadata = {
  title: "About Us | CleanSmith",
  description:
    "Discover the CleanSmith story and the team bringing trusted mobile car wash and detailing to Johannesburg.",
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/index.html" aria-label="CleanSmith home">
          <img src="/caleb.png" alt="CLEANSMITH" />
        </a>
        <nav className={styles.navigation} aria-label="Main navigation">
          <a href="/index.html">Home</a>
          <a href="/index.html#features">Car wash</a>
          <a href="/home-cleaning.html">Home cleaning</a>
          <a href="/gardening.html">Gardening</a>
          <a href="/index.html#packages">Packages</a>
          <a href="/about" aria-current="page">About us</a>
          <a href="/index.html#contact">Contact</a>
        </nav>
        <a className={styles.bookButton} href="/index.html#booking">
          Book now
        </a>
      </header>

      <section className={styles.hero} aria-labelledby="story-title">
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Our story</p>
          <h1 id="story-title">The Cleansmith Story</h1>
          <p className={styles.subtitle}>
            From One Pair of Hands to Johannesburg’s Trusted Mobile Car Wash
          </p>
        </div>
      </section>

      <section className={styles.story} aria-label="The CleanSmith story">
        <p className={styles.lead}>
          Every great business starts with a simple standard: do the work so well
          that people ask for you by name.
        </p>
        <p>
          Cleansmith didn’t begin with a fleet of vehicles, expensive equipment,
          or a massive marketing budget. It started with one guy working at a
          local car wash, focused purely on attention to detail and treating
          every vehicle as if it were my own. In an industry where people are
          used to rushed jobs and missed spots, consistency stands out fast.
          Before long, regular customers stopped just pulling into the wash
          bay—they started waiting for <em>me</em> specifically to handle their
          cars.
        </p>
        <p>
          As demand grew, those same clients faced a common Joburg problem:
          tight schedules and zero time to sit around waiting at a car wash.
          Eventually, they asked a simple question that changed everything:
          <em> “Can you just come to my house instead?”</em>
        </p>
        <p>
          That shift—from waiting for clients to come to the wash bay to
          bringing the service straight to their driveways—was the birth of{" "}
          <strong>Cleansmith</strong>.
        </p>
        <p>
          We never relied on flashy ads to grow; word of mouth did all the heavy
          lifting. When you deliver spotless results every single time, people
          talk. Soon, the calls weren’t just coming from residential
          driveways—word of mouth took us straight to the <strong>SABC</strong>,
          where the crew began trusting us with their personal and production
          vehicles.
        </p>
        <p>
          From the SABC, our reputation opened doors at{" "}
          <strong>Helen Joseph Hospital</strong>. Doctors and medical staff work
          grueling, unpredictable shifts; leaving the hospital to sit at a car
          wash simply isn’t an option. Because of the reliability we had proven
          and the strict security and trust we built with staff and hospital
          management, they granted us access to service their vehicles right on
          the hospital grounds while they focused on saving lives.
        </p>
        <p>
          What started as one person meeting client demand has grown into{" "}
          <strong>Cleansmith</strong>—one of Johannesburg’s premier mobile car
          wash and detailing teams. Today, we bring that exact same work ethic,
          security, and spotless finish directly to your home, office park, or
          workplace. No queues, no wasted hours—just showroom-clean results
          wherever you are.
        </p>
      </section>

      <section className={styles.team} aria-labelledby="team-title">
        <div className={styles.teamCard}>
          <p className={styles.eyebrow}>The people behind the shine</p>
          <h2 id="team-title">Meet the Team</h2>
          <p>
            Our team is trained to care for every vehicle with attention to
            detail, and takes pride in showing up reliably and treating each
            client with respect. They keep the CleanSmith standard alive across
            Joburg with careful, professional service and a spotless finish.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <a href="/index.html">CLEANSMITH</a>
        <a href="/index.html#booking">Book your car wash</a>
      </footer>
    </main>
  );
}
