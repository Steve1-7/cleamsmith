import AdminDashboard from "./AdminDashboard";
import "./admin.css";

export const metadata = {
  title: "CLEANSMITH Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
