import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <section className="page-container">
      <div className="card p-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">
          User Dashboard
        </p>

        <h1 className="mb-3 text-3xl font-extrabold text-gray-900">
          Welcome, {user.name}
        </h1>

        <p className="mb-8 text-lg text-gray-700">
          Your current role is{" "}
          <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-800">
            {user.role}
          </span>
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {user.role === "attendee" && (
            <Link href="/events" className="card p-6 transition hover:-translate-y-1 hover:border-blue-300">
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Browse Events
              </h2>
              <p className="text-gray-700">
                Find workshops and book your place.
              </p>
            </Link>
          )}

          {user.role === "organiser" && (
            <Link href="/organiser/dashboard" className="card p-6 transition hover:-translate-y-1 hover:border-blue-300">
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Manage Events
              </h2>
              <p className="text-gray-700">
                Create, edit, and manage your workshops.
              </p>
            </Link>
          )}

          {user.role === "admin" && (
            <Link href="/admin/dashboard" className="card p-6 transition hover:-translate-y-1 hover:border-blue-300">
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Admin Panel
              </h2>
              <p className="text-gray-700">
                Manage users and oversee the system.
              </p>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
