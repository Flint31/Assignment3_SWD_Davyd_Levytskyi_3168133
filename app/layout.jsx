import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "WorkshopHub",
  description: "Booking and event management web application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Shared navigation for all pages */}
        <Navbar />

        <main className="min-h-screen bg-gray-50 px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
