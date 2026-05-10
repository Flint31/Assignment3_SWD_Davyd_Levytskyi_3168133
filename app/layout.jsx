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
        <Navbar />
        <main className="min-h-screen bg-gray-100 px-6 py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
