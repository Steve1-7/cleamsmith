"use client";

import Link from "next/link";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import WorkGallery from "./WorkGallery";
import usePublicContent from "../lib/usePublicContent";

function safeImageUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url) ? url : "";
}

export default function ServicePage({ slug }) {
  const { pages, gallery } = usePublicContent();
  const page = pages[slug];
  const services = Array.isArray(page.services) ? page.services : [];
  const pageGallery = gallery.filter((item) => (item.service_slug || "car-wash") === slug);
  const quoteText = slug === "home-cleaning"
    ? "Hi CLEANSMITH, I would like a home cleaning quote."
    : "Hi CLEANSMITH, I would like a gardening quote.";

  return (
    <div className="service-page">
      <SiteHeader variant="service" activePage={slug} />
      <main>
        <section className="service-page-hero">
          {safeImageUrl(page.hero_image_url) ? (
            <img className="service-hero-image" src={safeImageUrl(page.hero_image_url)} alt="" aria-hidden="true" />
          ) : null}
          <div className="service-page-hero-content">
            <p className="service-page-eyebrow">CLEANSMITH · JOHANNESBURG</p>
            <h1>{page.hero_title}</h1>
            <p className="service-page-subtitle">{page.hero_subtitle}</p>
          </div>
        </section>
        <section className="service-page-section">
          <div className="service-section-inner">
            <p className="service-page-eyebrow">{slug === "gardening" ? "Care for your outdoor space" : "Cleaning that fits your home"}</p>
            <h2>{page.section_title}</h2>
            <p className="service-page-intro">{page.intro}</p>
            <div className="service-card-grid">
              {services.map((service, index) => (
                <article className="service-card" key={`${service.title}-${index}`}>
                  {safeImageUrl(service.image_url) ? (
                    <img className="service-card-image" src={safeImageUrl(service.image_url)} alt={service.title || "CLEANSMITH service"} loading="lazy" />
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
          </div>
        </section>
        <section className="service-page-section">
          <div className="service-section-inner">
            <p className="service-page-eyebrow">Recent work</p>
            <h2>{slug === "gardening" ? "Garden gallery" : "Home-cleaning gallery"}</h2>
            <WorkGallery
              items={pageGallery}
              emptyMessage={`Our ${slug === "gardening" ? "gardening" : "home-cleaning"} gallery is being updated. Check back soon.`}
            />
          </div>
        </section>
        <section className="service-page-section service-page-cta">
          <div className="service-section-inner">
            <p className="service-page-eyebrow">Get started</p>
            <h2>{page.callout_title}</h2>
            <p>{page.callout_text}</p>
            <Link href={`https://wa.me/27717856901?text=${encodeURIComponent(quoteText)}`}>
              Request a {slug === "gardening" ? "gardening" : "home-cleaning"} quote
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
