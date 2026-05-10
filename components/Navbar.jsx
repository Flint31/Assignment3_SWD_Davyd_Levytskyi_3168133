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
    <nav className="border-b bg-white px-6 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">
          WorkshopHub
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-700">
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

              <Link
                href="/register"
                className="rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
              >
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <span className="text-gray-700">
                {user.name} ({user.role})
              </span>

              <button
                onClick={handleLogout}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
