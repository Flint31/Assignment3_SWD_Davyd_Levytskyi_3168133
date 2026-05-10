import Link from "next/link";

export default function HomePage() {
  return (
    <section className="page-container">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 px-10 py-14 shadow-2xl">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-blue-100">
          Booking & Event Management
        </p>

        <h1 className="mb-5 max-w-4xl text-5xl font-extrabold leading-tight text-white">
          Manage and book workshops easily
        </h1>

        <p className="max-w-2xl text-lg leading-8 text-blue-50">
          WorkshopHub is a fullstack booking platform where organisers create
          events, attendees book places, and admins manage the system.
        </p>

        <div className="mt-9 flex gap-4">
          <Link
            href="/events"
            className="rounded-xl bg-white px-6 py-3 font-extrabold text-blue-700 shadow hover:bg-blue-50"
          >
            Browse Events
          </Link>

          <Link
            href="/register"
            className="rounded-xl border border-blue-200 px-6 py-3 font-extrabold text-white hover:bg-blue-600"
          >
            Create Account
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="card p-7">
          <h2 className="mb-3 text-xl font-extrabold text-gray-900">
            Attendees
          </h2>
          <p className="leading-7 text-gray-700">
            Browse workshops, book a place, and manage your bookings.
          </p>
        </div>

        <div className="card p-7">
          <h2 className="mb-3 text-xl font-extrabold text-gray-900">
            Organisers
          </h2>
          <p className="leading-7 text-gray-700">
            Create, update, and manage your own events.
          </p>
        </div>

        <div className="card p-7">
          <h2 className="mb-3 text-xl font-extrabold text-gray-900">
            Admins
          </h2>
          <p className="leading-7 text-gray-700">
            Manage users and oversee the whole platform.
          </p>
        </div>
      </div>
    </section>
  );
}
