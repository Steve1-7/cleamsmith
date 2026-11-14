import Script from "next/script";
import "./globals.css";
import "./service-pages.css";

export const metadata = {
  title: "CLEANSMITH — Premium Mobile Car Wash & Detailing | Johannesburg",
  description: "Professional mobile car wash and detailing service in Johannesburg.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
          strategy="beforeInteractive"
        />
        <Script src="/supabase-config.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
