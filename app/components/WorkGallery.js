"use client";

import { useState } from "react";

function safeMediaUrl(value) {
  const url = String(value || "").trim();
  return /^https?:\/\//i.test(url) || /^\/(?!\/)/.test(url) ? url : "";
}

export default function WorkGallery({ items = [], emptyMessage = "New work will be featured here soon." }) {
  const [selected, setSelected] = useState(null);
  const visibleItems = items.filter((item) => safeMediaUrl(item.media_url));

  return (
    <>
      {visibleItems.length ? (
        <div className="gallery-grid">
          {visibleItems.map((item, index) => {
            const mediaUrl = safeMediaUrl(item.media_url);
            return (
              <article className="gallery-item" key={item.id || `${item.title}-${index}`}>
                <button className="gallery-link" type="button" onClick={() => setSelected(item)} aria-label={`View ${item.title || "gallery item"}`}>
                  <div className="gallery-item-inner">
                    {item.media_type === "video" ? (
                      <video muted loop playsInline preload="metadata">
                        <source src={mediaUrl} />
                      </video>
                    ) : (
                      <img src={mediaUrl} alt={item.alt_text || item.title || "CLEANSMITH service work"} loading="lazy" />
                    )}
                  </div>
                </button>
                {item.caption ? <p className="gallery-caption">{item.caption}</p> : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="service-page-empty">{emptyMessage}</p>
      )}
      {selected ? (
        <div
          className="lightbox-overlay active"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title || "Gallery media"}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <button className="lightbox-close" type="button" aria-label="Close image" onClick={() => setSelected(null)}>×</button>
          {selected.media_type === "video" ? (
            <video className="lb-media" controls autoPlay playsInline src={safeMediaUrl(selected.media_url)} />
          ) : (
            <img className="lb-media" src={safeMediaUrl(selected.media_url)} alt={selected.alt_text || selected.title || ""} />
          )}
        </div>
      ) : null}
    </>
  );
}
