# CLEANSMITH admin setup

The website uses Next.js App Router pages and React components. Public routes are `/`, `/home-cleaning`, `/gardening`, and `/about`; the admin dashboard is `/admin`. The pages include starter content and remain usable if Supabase content is not configured.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run all of `supabase-setup.sql`. If Supabase is already set up, run the updated script again to add missing page and gallery columns and access policies. Default page rows are inserted only when they do not already exist, so saved edits are preserved. Gallery items are assigned to `car-wash`, `home-cleaning`, or `gardening`.
3. In `public/supabase-config.js`, set the project's **Project URL** and **anon/public key**. Never put a `service_role` key in browser code.
4. In Supabase Authentication, create the admin user. Edit that user's **app metadata** to include `{"role":"admin"}`. Do not set this in user-editable metadata. The database policies enforce this role for dashboard data and file uploads.
5. Run `npm run dev` to preview locally. Open `http://localhost:3000/admin` to sign in; all public pages are available without `.html` suffixes.
6. In Vercel, import the repository and leave **Root Directory** set to the repository root (`.`). The Next.js app and `package.json` are at the root of this Git repository; do not use the local computer's folder path as the Vercel root directory. Use the Next.js framework preset and deploy; Vercel detects the npm build configuration automatically.

The dashboard's member section manages private membership records (contact details, plan, status, and notes); it does not create Supabase Auth accounts for customers. Gallery uploads accept image and video files up to 100 MB. The public galleries only display published entries and show items on the matching service page.

Use the **Website pages** tab to edit the Car Wash, Home Cleaning, Gardening, or About Us page. Edit hero text, introduction, image URL, service cards, and callout; for About Us, the introduction is the story (separate paragraphs with blank lines), while the section heading and callout fields control the team section. Enter service cards one per line using `Title | Description | Price or quote label | Image URL | Feature one; Feature two`. Image URLs in the starter content and gallery samples are examples and can be replaced; fallback gallery samples live in `app/lib/site-content.js`. The car-wash booking form collects make, model, year, and vehicle size; package prices continue to use the size categories configured under **Packages**.

The browser-side project URL and anon key are public by design. Access control relies on Supabase Auth and the row-level security policies in the setup SQL.
