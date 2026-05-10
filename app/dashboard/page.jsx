import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>

      <p className="mb-6 text-gray-600">
        Welcome, {user.name}. Your role is{" "}
        <span className="font-semibold">{user.role}</span>.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {user.role === "attendee" && (
          <Link
            href="/events"
            className="rounded border p-5 hover:border-blue-700 hover:bg-blue-50"
          >
            <h2 className="font-semibold">Browse Events</h2>
            <p className="mt-2 text-sm text-gray-600">
              Find workshops and book your place.
            </p>
          </Link>
        )}

        {user.role === "organiser" && (
          <Link
            href="/organiser/dashboard"
            className="rounded border p-5 hover:border-blue-700 hover:bg-blue-50"
          >
            <h2 className="font-semibold">Manage Events</h2>
            <p className="mt-2 text-sm text-gray-600">
              Create and update your workshops.
            </p>
          </Link>
        )}

        {user.role === "admin" && (
          <Link
            href="/admin/dashboard"
            className="rounded border p-5 hover:border-blue-700 hover:bg-blue-50"
          >
            <h2 className="font-semibold">Admin Panel</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage users and oversee the system.
            </p>
          </Link>
        )}
      </div>
    </section>
  );
}
