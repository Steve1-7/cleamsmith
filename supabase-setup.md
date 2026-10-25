# CLEANSMITH admin setup

The Next.js app serves the landing page and admin dashboard as static HTML from `public/`, using Supabase for shared package, membership, and gallery data. The original `index (4).html`, admin files, configuration, and media in the project root are the editable source files; the `predev` and `prebuild` scripts sync them into `public/`. The app root redirects to the landing page at `/index.html`. Until Supabase is configured, the landing page keeps its existing hard-coded content.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run all of `supabase-setup.sql`.
3. In `supabase-config.js`, replace the example URL and key with the project's **Project URL** and **anon/public key**. Never put a `service_role` key in browser code.
4. In Supabase Authentication, create the admin user. Edit that user's **app metadata** to include `{"role":"admin"}`. Do not set this in user-editable metadata. The database policies enforce this role for dashboard data and file uploads.
5. Run `npm run dev` to preview locally, then open `/admin.html` and sign in. Do not open the HTML files directly with `file://`.
6. In Vercel, import the repository and set its **Root Directory** to `websites/cleansmith` if that is where this project lives in the repository. Use the Next.js framework preset and deploy; Vercel detects the npm build configuration automatically.

The dashboard's member section manages private membership records (contact details, plan, status, and notes); it does not create Supabase Auth accounts for customers. Gallery uploads accept image and video files up to 100 MB. The public gallery only displays published entries.

The browser-side project URL and anon key are public by design. Access control relies on Supabase Auth and the row-level security policies in the setup SQL.
