import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="rounded-2xl bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase text-blue-700">
          Booking & Event Management
        </p>

        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to WorkshopHub
        </h1>

        <p className="mb-8 max-w-2xl text-gray-600">
          WorkshopHub is a fullstack event booking platform where organisers can
          create workshops, attendees can book events, and admins can manage the
          system.
        </p>

        <div className="flex gap-4">
          <Link
            href="/events"
            className="rounded bg-blue-700 px-5 py-3 text-white hover:bg-blue-800"
          >
            Browse Events
          </Link>

          <Link
            href="/register"
            className="rounded border border-gray-300 px-5 py-3 hover:bg-gray-100"
          >
            Create Account
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Attendees</h2>
          <p className="text-gray-600">
            Browse workshops, book a place, and manage your bookings.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Organisers</h2>
          <p className="text-gray-600">
            Create, update, and manage your own events.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Admins</h2>
          <p className="text-gray-600">
            Manage users and oversee the whole platform.
          </p>
        </div>
      </div>
    </section>
  );
}
