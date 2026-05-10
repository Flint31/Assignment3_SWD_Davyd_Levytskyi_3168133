"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    // Logout removes the session from MySQL and clears the cookie
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    loadUser();
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-blue-700">
          WorkshopHub
        </Link>

        <div className="flex items-center gap-5 text-sm font-semibold text-gray-800">
          <Link href="/" className="hover:text-blue-700">
            Home
          </Link>

          <Link href="/events" className="hover:text-blue-700">
            Events
          </Link>

          {!loading && user?.role === "attendee" && (
            <Link href="/dashboard" className="hover:text-blue-700">
              My Bookings
            </Link>
          )}

          {!loading && user?.role === "organiser" && (
            <Link href="/organiser/dashboard" className="hover:text-blue-700">
              Organiser Dashboard
            </Link>
          )}

          {!loading && user?.role === "admin" && (
            <Link href="/admin/dashboard" className="hover:text-blue-700">
              Admin Dashboard
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link href="/login" className="hover:text-blue-700">
                Login
              </Link>

              <Link href="/register" className="btn-primary px-4 py-2">
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-2 text-blue-800">
                {user.name} ({user.role})
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
