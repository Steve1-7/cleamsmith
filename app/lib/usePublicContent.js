"use client";

import { useEffect, useState } from "react";
import {
  fallbackWorkGallery,
  fallbackMemberships,
  fallbackPackages,
  fallbackPages,
} from "./site-content";

export default function usePublicContent() {
  const [packages, setPackages] = useState(fallbackPackages);
  const [memberships, setMemberships] = useState(fallbackMemberships);
  const [pages, setPages] = useState(fallbackPages);
  const [gallery, setGallery] = useState(fallbackWorkGallery);

  useEffect(() => {
    const config = window.CLEANSMITH_SUPABASE_CONFIG;
    if (!config || !window.supabase || !window.supabase.createClient) return;
    if (!config.url || !config.anonKey) return;

    const client = window.CLEANSMITH_SUPABASE_CLIENT ||
      (window.CLEANSMITH_SUPABASE_CLIENT = window.supabase.createClient(config.url, config.anonKey));

    function load(query, label, update, replaceWhenEmpty = false) {
      query.then(({ data, error }) => {
        if (error) {
          console.error(`Unable to load CLEANSMITH ${label}:`, error);
          return;
        }
        if (Array.isArray(data) && (data.length || replaceWhenEmpty)) update(data);
      }).catch((error) => {
        console.error(`Unable to load CLEANSMITH ${label}:`, error);
      });
    }

    function mergeGallery(rows) {
      const categories = new Set(rows.map((item) => item.service_slug || "car-wash"));
      const missingCategorySamples = fallbackWorkGallery.filter((item) => !categories.has(item.service_slug));
      setGallery([...rows, ...missingCategorySamples]);
    }

    load(client.from("packages").select("*").order("sort_order"), "packages", setPackages);
    load(client.from("membership_plans").select("*").order("sort_order"), "membership plans", setMemberships);
    load(
      client.from("site_pages").select("*").order("sort_order"),
      "service page content",
      (rows) => setPages((current) => ({ ...current, ...Object.fromEntries(rows.map((page) => [page.slug, page])) })),
    );
    load(
      client.from("work_gallery").select("*").eq("is_published", true).order("sort_order"),
      "work gallery",
      mergeGallery,
      true,
    );
  }, []);

  return { packages, memberships, pages, gallery };
}
