# CLEANSMITH admin setup

The Next.js app serves the landing page and admin dashboard as static HTML from `public/`, using Supabase for shared page, package, membership, and gallery data. The original `index (4).html`, service-page files, admin files, configuration, and media in the project root are the editable source files; the `predev` and `prebuild` scripts sync them into `public/`. The app root redirects to the landing page at `/index.html`. Until Supabase is configured, the pages keep their starter content.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run all of `supabase-setup.sql`. If you already set up Supabase, run the updated script again to add or update the `site_pages` table, its `sort_order` column, and access policies. Default page rows are inserted only when they do not already exist, so saved edits are preserved.
3. In `supabase-config.js`, replace the example URL and key with the project's **Project URL** and **anon/public key**. Never put a `service_role` key in browser code.
4. In Supabase Authentication, create the admin user. Edit that user's **app metadata** to include `{"role":"admin"}`. Do not set this in user-editable metadata. The database policies enforce this role for dashboard data and file uploads.
5. Run `npm run dev` to preview locally, then open `/admin.html` and sign in. Do not open the HTML files directly with `file://`.
6. In Vercel, import the repository and leave **Root Directory** set to the repository root (`.`). The Next.js app and `package.json` are at the root of this Git repository; do not use the local computer's folder path as the Vercel root directory. Use the Next.js framework preset and deploy; Vercel detects the npm build configuration automatically.

The dashboard's member section manages private membership records (contact details, plan, status, and notes); it does not create Supabase Auth accounts for customers. Gallery uploads accept image and video files up to 100 MB. The public gallery only displays published entries.

Use the **Website pages** tab to select and edit the Car Wash, Home Cleaning, or Gardening page. Edit each page's hero text, introduction, image URL, service cards, and callout. Enter one service card per line using `Title | Description | Price or quote label | Image URL | Feature one; Feature two`. Image URLs in the starter content are examples and can be replaced at any time. The car-wash booking form collects make, model, year, and vehicle size; package prices continue to use the size categories configured under **Packages**.

The browser-side project URL and anon key are public by design. Access control relies on Supabase Auth and the row-level security policies in the setup SQL.
