"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const serviceLinks = [
  { href: "/", label: "Car wash", key: "car-wash" },
  { href: "/home-cleaning", label: "Home cleaning", key: "home-cleaning" },
  { href: "/gardening", label: "Gardening", key: "gardening" },
  { href: "/about", label: "About us", key: "about" },
];

export default function SiteHeader({ variant = "service", activePage = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "home") return undefined;
    const updateScroll = () => setScrolled(window.scrollY > 50);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [variant]);

  if (variant === "home") {
    return (
      <>
        <nav id="navbar" className={scrolled ? "scrolled" : ""}>
          <Link href="/" className="nav-logo" aria-label="CLEANSMITH home">
            <img src="/caleb.png" alt="CLEANSMITH" className="nav-logo-img" />
          </Link>
          <ul className="nav-links">
            <li><Link href="/#features">Car wash</Link></li>
            <li><Link href="/home-cleaning">Home cleaning</Link></li>
            <li><Link href="/gardening">Gardening</Link></li>
            <li><Link href="/#packages">Packages</Link></li>
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/#contact">Contact</Link></li>
          </ul>
          <div className="nav-social">
            <a href="https://www.tiktok.com/@cleansmith.carwas" target="_blank" rel="noopener noreferrer" className="nav-social-link" aria-label="TikTok">♪</a>
            <a href="https://www.facebook.com/profile.php?id=61586060377430" target="_blank" rel="noopener noreferrer" className="nav-social-link" aria-label="Facebook">f</a>
          </div>
          <Link href="/#booking" className="nav-cta">Book Now</Link>
          <button
            className={`hamburger${menuOpen ? " active" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </nav>
        <div className={`mobile-menu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
          {[
            ...serviceLinks.slice(0, 3),
            { href: "/#packages", label: "Packages" },
            serviceLinks[3],
            { href: "/#booking", label: "Book now" },
            { href: "/#reviews", label: "Reviews" },
            { href: "/#contact", label: "Contact" },
          ].map((item) => (
            <Link href={item.href} key={item.label} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>
      </>
    );
  }

  return (
    <header className="service-header">
      <Link className="service-brand" href="/" aria-label="CLEANSMITH home">
        <img src="/caleb.png" alt="CLEANSMITH" />
      </Link>
      <nav className="service-nav" aria-label="Main navigation">
        {serviceLinks.map((item) => (
          <Link
            href={item.href}
            key={item.key}
            aria-current={activePage === item.key ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <Link href="/#packages">Packages</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
      <Link className="service-book" href="/#booking">Book now</Link>
    </header>
  );
}
