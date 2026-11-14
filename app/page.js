import HomePage from "./components/HomePage";
import "./home.css";

export const metadata = {
  title: "CLEANSMITH — Premium Mobile Car Wash & Detailing | Johannesburg",
  description: "Professional mobile car wash and detailing service in Johannesburg.",
};

const businessData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "CLEANSMITH Mobile Car Wash & Detailing",
  url: "https://cleansmith.co.za",
  telephone: "+27717856901",
  email: "info@cleansmith.co.za",
  address: "Johannesburg, Gauteng, ZA",
  priceRange: "R250 – R1200",
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "120" },
  openingHours: "Mo-Su 07:00-17:00",
  sameAs: [
    "https://www.tiktok.com/@cleansmith.carwas",
    "https://www.facebook.com/profile.php?id=61586060377430",
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessData) }} />
      <HomePage />
    </>
  );
}
