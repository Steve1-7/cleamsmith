"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback } from "react";

export default function AdminDashboard() {
  const initializeAdmin = useCallback(() => {
    if (window.CLEANSMITH_ADMIN_INIT) window.CLEANSMITH_ADMIN_INIT();
  }, []);

  const reportScriptError = useCallback(() => {
    const status = document.getElementById("loginStatus");
    if (status) {
      status.textContent = "The admin script could not be loaded. Refresh the page and try again.";
      status.classList.add("error");
    }
  }, []);

  return (
    <>
      <main id="admin-page" className="admin-page">
        <section id="loginPanel" className="panel auth">
          <p className="muted">CLEANSMITH • ADMIN</p>
          <h1>Sign in to manage your site</h1>
          <p className="muted">Manage service pages, packages, VIP memberships, member records, and work media.</p>
          <form id="loginForm">
            <label>Email<input name="email" type="email" autoComplete="username" required /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
            <button className="btn" type="submit">Sign in</button>
          </form>
          <p className="status" id="loginStatus" role="status" />
        </section>

        <section id="dashboard" hidden>
          <header>
            <div><p className="muted">CLEANSMITH • ADMIN</p><h1>Dashboard</h1><span className="muted" id="userEmail" /></div>
            <div className="top-actions"><Link className="btn secondary" href="/">View website</Link><button className="btn secondary" id="signOut" type="button">Sign out</button></div>
          </header>
          <nav className="toolbar" aria-label="Dashboard sections">
            <button className="tab active" data-tab="packages" type="button">Packages</button>
            <button className="tab" data-tab="pages" type="button">Website pages</button>
            <button className="tab" data-tab="plans" type="button">Membership plans</button>
            <button className="tab" data-tab="members" type="button">Members</button>
            <button className="tab" data-tab="gallery" type="button">Work gallery</button>
          </nav>
          <p className="status" id="dashboardStatus" role="status" />

          <section className="section" data-section="pages" hidden>
            <h2>Website pages</h2><p className="section-intro">Edit the Car Wash, Home Cleaning, Gardening, and About Us pages, including the team introduction.</p>
            <div className="layout">
              <div className="panel editor">
                <form id="sitePageForm">
                  <input type="hidden" name="id" />
                  <div className="fields">
                    <label>Page<select name="slug" required>
                      <option value="car-wash">Car Wash</option>
                      <option value="home-cleaning">Home Cleaning</option>
                      <option value="gardening">Gardening</option>
                        <option value="about">About Us</option>
                    </select></label>
                      <label>Section heading (About team heading)<input name="section_title" required /></label>
                    <label className="full">Hero title<input name="hero_title" required /></label>
                    <label className="full">Hero subtitle<textarea name="hero_subtitle" /></label>
                      <label className="full">Introduction / story (separate About paragraphs with blank lines)<textarea name="intro" required /></label>
                    <label className="full">Hero image URL<input name="hero_image_url" type="text" inputMode="url" placeholder="https://... or /image.jpg" /></label>
                    <label className="full">Service cards (one per line)<textarea name="services_text" rows={10} placeholder="Title | Description | Price or quote label | Image URL | Feature one; Feature two" /></label>
                    <p className="muted full">Use the format shown above. Separate features with semicolons. The image URL is optional; blank prices can be used for quote-only services.</p>
                      <label className="full">Callout heading (About team eyebrow)<input name="callout_title" /></label>
                      <label className="full">Callout text (About team introduction)<textarea name="callout_text" /></label>
                    <label>Display order<input name="sort_order" type="number" defaultValue="0" required /></label>
                  </div>
                  <div className="item-actions"><button className="btn" type="submit">Save page</button><button className="btn secondary" type="reset">Clear</button></div>
                </form>
              </div>
              <div className="items" id="sitePageList" />
            </div>
          </section>

          <section className="section" data-section="packages">
            <h2>Packages</h2><p className="section-intro">Manage public service packages and per-vehicle booking prices.</p>
            <div className="layout">
              <div className="panel editor">
                <form id="packageForm">
                  <input type="hidden" name="id" />
                  <div className="fields">
                    <label>Package name<input name="name" required /></label>
                    <label>URL slug<input name="slug" pattern="[a-z0-9-]+" required /></label>
                    <label>Starting price (R)<input name="starting_price" type="number" min="0" required /></label>
                    <label>Price unit<input name="price_unit" defaultValue="session" required /></label>
                    <label>Duration<input name="duration" placeholder="45–60 minutes" /></label>
                    <label>Badge<input name="badge" /></label>
                    <label>Card style<select name="style"><option value="standard">Standard</option><option value="featured">Featured</option><option value="executive">Executive</option></select></label>
                    <label className="full">Description<textarea name="description" /></label>
                    <label className="full">Features (one per line)<textarea name="features" /></label>
                    <div className="full fields">
                      <label>Hatchback price<input name="price_hatch" type="number" min="0" required /></label>
                      <label>Sedan price<input name="price_sedan" type="number" min="0" required /></label>
                      <label>SUV / Bakkie price<input name="price_suv" type="number" min="0" required /></label>
                      <label>Luxury / Sports price<input name="price_luxury" type="number" min="0" required /></label>
                      <label>Minibus / Van price<input name="price_minibus" type="number" min="0" required /></label>
                    </div>
                    <label>Display order<input name="sort_order" type="number" defaultValue="0" /></label>
                    <label>Visible<select name="is_active"><option value="true">Yes</option><option value="false">No</option></select></label>
                  </div>
                  <div className="item-actions"><button className="btn" type="submit">Save package</button><button className="btn secondary" type="reset">Clear</button></div>
                </form>
              </div>
              <div className="items" id="packageList" />
            </div>
          </section>

          <section className="section" data-section="plans" hidden>
            <h2>Membership plans</h2><p className="section-intro">Edit the VIP plans shown on the landing page.</p>
            <div className="layout">
              <div className="panel editor"><form id="planForm">
                <input type="hidden" name="id" /><div className="fields">
                  <label>Plan name<input name="name" required /></label><label>Price (R)<input name="price" type="number" min="0" required /></label>
                  <label>Billing interval<input name="billing_interval" defaultValue="month" required /></label><label>Discount (%)<input name="discount_percent" type="number" min="0" max="100" defaultValue="0" /></label>
                  <label>Badge<input name="badge" /></label><label>Display order<input name="sort_order" type="number" defaultValue="0" /></label>
                  <label className="full">Benefits (one per line)<textarea name="benefits" /></label>
                  <label>Visible<select name="is_active"><option value="true">Yes</option><option value="false">No</option></select></label>
                </div><div className="item-actions"><button className="btn" type="submit">Save plan</button><button className="btn secondary" type="reset">Clear</button></div>
              </form></div>
              <div className="items" id="planList" />
            </div>
          </section>

          <section className="section" data-section="members" hidden>
            <h2>Member records</h2><p className="section-intro">Private customer records for your VIP program. These are not customer login accounts.</p>
            <div className="layout">
              <div className="panel editor"><form id="memberForm">
                <input type="hidden" name="id" /><div className="fields">
                  <label>Full name<input name="full_name" required /></label><label>Email<input name="email" type="email" /></label>
                  <label>Phone<input name="phone" type="tel" /></label><label>Plan<select name="plan_id" id="memberPlan"><option value="">No plan</option></select></label>
                  <label>Status<select name="status"><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option></select></label>
                  <label>Joined<input name="joined_at" type="date" /></label><label className="full">Notes<textarea name="notes" /></label>
                </div><div className="item-actions"><button className="btn" type="submit">Save member</button><button className="btn secondary" type="reset">Clear</button></div>
              </form></div>
              <div className="items" id="memberList" />
            </div>
          </section>

          <section className="section" data-section="gallery" hidden>
            <h2>Work gallery</h2><p className="section-intro">Upload images or videos to the gallery for the selected service.</p>
            <div className="layout">
              <div className="panel editor"><form id="galleryForm">
                <input type="hidden" name="id" /><input type="hidden" name="storage_path" /><input type="hidden" name="media_url" /><input type="hidden" name="media_type" />
                <div className="fields">
                  <label className="full">Service<select name="service_slug" required>
                    <option value="car-wash">Car wash</option>
                    <option value="home-cleaning">Home cleaning</option>
                    <option value="gardening">Gardening</option>
                  </select></label>
                  <label className="full">Title<input name="title" required /></label><label className="full">Caption<input name="caption" /></label>
                  <label className="full">Image/video file<input name="media_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" /></label>
                  <label className="full">Alt text<input name="alt_text" /></label><label>Display order<input name="sort_order" type="number" defaultValue="0" /></label>
                  <label>Published<select name="is_published"><option value="true">Yes</option><option value="false">No</option></select></label>
                </div><div className="item-actions"><button className="btn" type="submit">Save work</button><button className="btn secondary" type="reset">Clear</button></div>
              </form></div>
              <div className="items" id="galleryList" />
            </div>
          </section>
        </section>
      </main>
      <Script src="/admin.js" strategy="afterInteractive" onReady={initializeAdmin} onError={reportScriptError} />
    </>
  );
}
