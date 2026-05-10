import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import DeleteEventButton from "@/components/DeleteEventButton";

export const dynamic = "force-dynamic";

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function OrganiserDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "organiser") {
    redirect("/dashboard");
  }

  const [events] = await db.execute(
    `SELECT
      events.id,
      events.title,
      events.location,
      events.event_date,
      events.capacity,
      COALESCE(booked.booked_count, 0) AS booked_count
     FROM events
     LEFT JOIN (
       SELECT event_id, COUNT(*) AS booked_count
       FROM bookings
       WHERE status = 'booked'
       GROUP BY event_id
     ) AS booked ON events.id = booked.event_id
     WHERE events.organiser_id = ?
     ORDER BY events.event_date ASC`,
    [user.id]
  );

  return (
    <section className="page-container">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-blue-700">
            Organiser Area
          </p>

          <h1 className="text-4xl font-extrabold text-gray-900">
            Organiser Dashboard
          </h1>

          <p className="mt-3 text-lg text-gray-700">
            Create, update, and manage your workshops.
          </p>
        </div>

        <Link href="/organiser/events/new" className="btn-primary">
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-8">
          <p className="text-gray-700">
            You have not created any events yet.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="px-5 py-4 font-extrabold">Title</th>
                <th className="px-5 py-4 font-extrabold">Location</th>
                <th className="px-5 py-4 font-extrabold">Date</th>
                <th className="px-5 py-4 font-extrabold">Bookings</th>
                <th className="px-5 py-4 font-extrabold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t border-gray-200">
                  <td className="px-5 py-4 font-bold text-gray-900">
                    {event.title}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {event.location}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {formatDate(event.event_date)}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {event.booked_count}/{event.capacity}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100"
                      >
                        View
                      </Link>

                      <Link
                        href={`/organiser/events/${event.id}/edit`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-black"
                      >
                        Edit
                      </Link>

                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
