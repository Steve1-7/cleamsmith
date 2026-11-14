"use client";

import Link from "next/link";
import { useState } from "react";
import BookingWizard from "./BookingWizard";
import SiteHeader from "./SiteHeader";
import WorkGallery from "./WorkGallery";
import usePublicContent from "../lib/usePublicContent";

const testimonials = [
  { text: "Fantastic mobile car wash! They arrived on time and my car looks brand new.", name: "Google User", initials: "FM" },
  { text: "Great service, excellent attention to detail and good customer service. Keep up the good work.", name: "Google User", initials: "GS" },
  { text: "Great service. My car came out spotless. Thank you guys.", name: "Google User", initials: "GV" },
];

const suburbs = [
  "Sandton", "Midrand", "Fourways", "Randburg", "Roodepoort", "Soweto",
  "Centurion", "Pretoria East", "Boksburg", "Germiston", "Alberton", "Edenvale",
];

function ServiceCards({ services }) {
  return (
    <div className="features-grid" data-page-services>
      {services.map((service, index) => (
        <article className="service-card" key={`${service.title}-${index}`}>
          {safeImageUrl(service.image_url) ? (
            <img className="service-card-image" src={safeImageUrl(service.image_url)} alt={service.title} loading="lazy" />
          ) : null}
          <div className="service-card-body">
            <p className="service-card-number">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="service-card-title">{service.title}</h3>
            <p className="service-card-description">{service.description}</p>
            {service.price_label ? <p className="service-card-price">{service.price_label}</p> : null}
            {service.features?.length ? (
              <ul className="service-card-features">
                {service.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function PackageCards({ packages, selectedPackage, onSelect }) {
  return (
    <div className="packages-grid">
      {packages.map((item) => (
        <article className={`pkg-card${item.style === "featured" ? " featured" : ""}${item.style === "executive" ? " executive" : ""}`} data-package={item.slug} key={item.slug}>
          {item.badge ? <div className={`pkg-badge${item.style === "executive" ? " top-gold" : ""}`}>{item.badge}</div> : null}
          <h3 className="pkg-name">{item.name}</h3>
          <div className={`pkg-price${item.style === "executive" ? " executive" : ""}`}>
            R{Number(item.starting_price).toLocaleString("en-ZA")} <span>/ {item.price_unit || "session"}</span>
          </div>
          {item.duration ? <div className="pkg-time">⏱ {item.duration}</div> : null}
          <div className="pkg-divider" />
          {item.description ? <p className="pkg-description">{item.description}</p> : null}
          <ul className="pkg-features">
            {(item.features || []).map((feature) => <li key={feature}>✓ {feature}</li>)}
          </ul>
          <div className="select-package">
            <button
              type="button"
              className={`select-toggle${item.style === "executive" ? " executive" : ""}${selectedPackage === item.slug ? " active" : ""}`}
              onClick={() => onSelect(item.slug)}
            >
              Select Package
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function safeImageUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url) ? url : "";
}

function MembershipCards({ memberships }) {
  return (
    <div className="membership-grid">
      {memberships.map((plan, index) => (
        <article className={`pkg-card${index ? " executive" : ""}`} key={plan.name}>
          <div className={`pkg-badge${index ? " top-gold" : ""}`}>{plan.badge || plan.name}</div>
          <h3 className="pkg-name">R{Number(plan.price).toLocaleString("en-ZA")} / {plan.billing_interval}</h3>
          <ul className="membership-benefits">
            {(plan.benefits || []).map((benefit) => <li key={benefit}>{benefit}</li>)}
          </ul>
          <a className="btn-primary membership-join" href={`https://wa.me/27717856901?text=${encodeURIComponent(`I want to join CLEANSMITH VIP ${plan.name}`)}`}>
            Join via WhatsApp
          </a>
          <p className="membership-note">No contracts. Cancel anytime.</p>
        </article>
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <div className="testi-track-wrap">
      <div className="testi-track">
        {testimonials.map((review, index) => (
          <article className="testi-card" key={review.initials}>
            <div className="testimonial-content">
              <div className="testi-avatar">{review.initials}</div>
              <div>
                <div className="testi-stars">★★★★★</div>
                <p className="testi-text">“{review.text}”</p>
                <div className="testi-subratings">
                  <span className="pill">Punctuality ★★★★★</span>
                  <span className="pill">Cleanliness ★★★★★</span>
                </div>
              </div>
            </div>
            <div className="testimonial-source">{review.name}<small>Johannesburg · Review {index + 1}</small></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="wa-widget">
      {open ? (
        <div className="wa-panel">
          <div className="wa-header">
            <strong>CLEANSMITH Concierge</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <p className="wa-msg">Hi! Ready to book or have a question? WhatsApp us below.</p>
          <a href="https://wa.me/27717856901" target="_blank" rel="noopener noreferrer" className="btn-primary">WhatsApp us</a>
        </div>
      ) : null}
      <button className="wa-closed" type="button" onClick={() => setOpen((value) => !value)} aria-label="Chat with CLEANSMITH on WhatsApp">
        <span aria-hidden="true">✆</span><span className="pulse" />
      </button>
    </div>
  );
}

export default function HomePage() {
  const { pages, packages, memberships, gallery } = usePublicContent();
  const page = pages["car-wash"];
  const [selectedPackage, setSelectedPackage] = useState("");
  const carWashGallery = gallery.filter((item) => (item.service_slug || "car-wash") === "car-wash");
  const heroImage = safeImageUrl(page.hero_image_url);
  const services = Array.isArray(page.services) ? page.services : [];

  function choosePackage(slug) {
    setSelectedPackage(slug);
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div id="home-page" className="home-page">
      <SiteHeader variant="home" />
      <main>
        <section className="hero" id="home">
          <div className="hero-ring" /><div className="hero-ring" /><div className="hero-ring" />
          <div className="hero-video-wrap" aria-hidden="true">
            {heroImage
              ? <img className="hero-video" src={heroImage} alt="" />
              : <video className="hero-video" autoPlay muted loop playsInline poster="/bike.jpeg"><source src="/clip1.mp4" type="video/mp4" /></video>}
          </div>
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-eyebrow">Mobile Car Wash &amp; Detailing · Johannesburg</div>
            <h1 className="hero-title">{page.hero_title}</h1>
            <p className="hero-sub">{page.hero_subtitle}</p>
            <div className="hero-ctas">
              <Link href="/#booking" className="btn-primary">Book Now</Link>
              <Link href="/#packages" className="btn-secondary">View Packages</Link>
            </div>
            <div className="trust-badges">
              <div className="trust-badge"><span className="stars">★★★★★</span> 4.9/5 Rated</div>
              <div className="trust-badge">1,000 Cars Detailed</div>
              <div className="trust-badge">👨‍🔧 Qualified Technicians</div>
              <div className="trust-badge">🚫 No Queue</div>
              <div className="trust-badge">🚗 No Driving</div>
              <div className="trust-badge">Eco-Friendly</div>
              <div className="trust-badge">Same-Day Booking</div>
            </div>
          </div>
          <div className="scroll-ind"><span>Scroll</span><div className="scroll-dot" /></div>
        </section>
        <div className="glow-line" />
        <section className="service-area" id="where-we-serve">
          <div className="section-inner">
            <div className="section-label">Where we serve</div>
            <h2 className="section-title">Our <span className="cyan">service area</span></h2>
            <p className="section-sub">We cover Johannesburg suburbs and beyond. Contact us for executive and long-distance bookings.</p>
            <div className="suburb-list">{suburbs.map((suburb) => <span className="pill" key={suburb}>{suburb}</span>)}</div>
            <div className="map-contact"><a href="https://wa.me/27717856901" className="btn-secondary">Contact us on WhatsApp</a></div>
            <div className="service-map">
              <iframe
                title="CLEANSMITH — Johannesburg service area"
                src="https://www.google.com/maps?q=Johannesburg,+South+Africa&z=11&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <p>Interactive map — pan and zoom to see suburbs. Contact us for executive or long-distance bookings.</p>
            </div>
          </div>
        </section>
        <section className="features-section" id="features">
          <div className="section-inner">
            <div className="section-label fade-up">What we offer</div>
            <h2 className="section-title fade-up">{page.section_title}</h2>
            <p className="section-sub fade-up">{page.intro}</p>
            <ServiceCards services={services} />
            <div className="service-callout">
              <h3>{page.callout_title}</h3>
              <p>{page.callout_text}</p>
            </div>
          </div>
        </section>
        <div className="glow-line" />
        <section className="packages-section" id="packages">
          <div className="section-inner">
            <div className="section-label fade-up">Pricing</div>
            <h2 className="section-title fade-up">Choose your <span className="cyan">package</span></h2>
            <p className="section-sub fade-up">Transparent pricing. No hidden fees. Premium results guaranteed.</p>
            <PackageCards packages={packages} selectedPackage={selectedPackage} onSelect={choosePackage} />
          </div>
        </section>
        <div className="glow-line" />
        <section className="booking-section" id="booking">
          <div className="section-inner">
            <div className="section-label fade-up">Get started</div>
            <h2 className="section-title fade-up">Book your <span>detail</span></h2>
            <p className="section-sub fade-up">Choose your vehicle, package, preferred time, then confirm by WhatsApp or email.</p>
            <BookingWizard packages={packages} selectedPackage={selectedPackage} onPackageChange={setSelectedPackage} />
          </div>
        </section>
        <div className="glow-line" />
        <section className="vip-section" id="vip">
          <div className="section-inner">
            <div className="section-label">Membership</div>
            <h2 className="section-title">CLEANSMITH <span className="gold">VIP</span></h2>
            <p className="section-sub">Join the VIP program for priority service and exclusive discounts.</p>
            <MembershipCards memberships={memberships} />
          </div>
        </section>
        <div className="glow-line" />
        <section className="testimonials-section" id="reviews">
          <div className="section-inner">
            <div className="section-label fade-up">Reviews</div>
            <h2 className="section-title fade-up">What clients <span className="cyan">say</span></h2>
          </div>
          <Testimonials />
        </section>
        <div className="glow-line" />
        <section className="gallery-section" id="gallery">
          <div className="section-inner">
            <div className="section-label fade-up">Our work</div>
            <h2 className="section-title fade-up">Gallery <span className="cyan">showcase</span></h2>
            <WorkGallery items={carWashGallery} />
          </div>
        </section>
      </main>
      <footer id="contact">
        <div className="section-inner footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo"><img src="/caleb.png" alt="CLEANSMITH" className="nav-logo-img" /></Link>
            <p>Premium mobile car wash and detailing, bringing showroom quality to your home or workplace in Johannesburg and surrounding areas.</p>
          </div>
          <div>
            <div className="footer-title">Services</div>
            <ul className="footer-links">
              <li><Link href="/#packages">Basic Wash</Link></li>
              <li><Link href="/#packages">Premium Detail</Link></li>
              <li><Link href="/#packages">Executive Ceramic</Link></li>
              <li><Link href="/#booking">Book now</Link></li>
              <li><Link href="/home-cleaning">Home cleaning</Link></li>
              <li><Link href="/gardening">Gardening</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">Company</div>
            <ul className="footer-links">
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/#reviews">Reviews</Link></li>
              <li><Link href="/#gallery">Gallery</Link></li>
              <li><Link href="/admin" rel="nofollow">Admin sign in</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-title">Contact</div>
            <ul className="footer-links">
              <li><a href="tel:+27717856901">071 785 6901</a></li>
              <li>Johannesburg, Gauteng</li>
              <li><a href="mailto:info@cleansmith.co.za">info@cleansmith.co.za</a></li>
              <li><a href="mailto:sales@cleansmith.co.za">sales@cleansmith.co.za</a></li>
            </ul>
            <div className="footer-social">
              <a href="https://www.tiktok.com/@cleansmith.carwas" target="_blank" rel="noopener noreferrer" aria-label="TikTok">♪</a>
              <a href="https://www.facebook.com/profile.php?id=61586060377430" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 CLEANSMITH Mobile Car Wash &amp; Detailing. All rights reserved.</p>
          <p className="powered-by">Powered by <a href="https://www.eva-tech-studio.com" target="_blank" rel="noopener noreferrer">eva-tech-studio</a></p>
        </div>
      </footer>
      <WhatsAppWidget />
    </div>
  );
}
