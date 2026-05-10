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
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organiser Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Create, update, and manage your workshops.
          </p>
        </div>

        <Link
          href="/organiser/events/new"
          className="rounded bg-blue-700 px-5 py-3 text-white hover:bg-blue-800"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <p className="text-gray-600">
            You have not created any events yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3">{event.location}</td>
                  <td className="px-4 py-3">{formatDate(event.event_date)}</td>
                  <td className="px-4 py-3">
                    {event.booked_count}/{event.capacity}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/events/${event.id}`}
                        className="rounded border px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        View
                      </Link>

                      <Link
                        href={`/organiser/events/${event.id}/edit`}
                        className="rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-black"
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
