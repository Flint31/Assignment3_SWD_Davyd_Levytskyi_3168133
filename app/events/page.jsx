import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function EventsPage() {
  const [events] = await db.execute(
    `SELECT
      events.id,
      events.title,
      events.description,
      events.location,
      events.event_date,
      events.capacity,
      users.name AS organiser_name,
      COALESCE(booked.booked_count, 0) AS booked_count
     FROM events
     JOIN users ON events.organiser_id = users.id
     LEFT JOIN (
       SELECT event_id, COUNT(*) AS booked_count
       FROM bookings
       WHERE status = 'booked'
       GROUP BY event_id
     ) AS booked ON events.id = booked.event_id
     ORDER BY events.event_date ASC`
  );

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Available Events</h1>
        <p className="mt-2 text-gray-600">
          Browse workshops and local events created by organisers.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <p className="text-gray-600">No events have been created yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">{event.title}</h2>

              <p className="mb-4 line-clamp-3 text-gray-600">
                {event.description}
              </p>

              <div className="mb-4 space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Organiser:</span>{" "}
                  {event.organiser_name}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {event.location}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {formatDate(event.event_date)}
                </p>
                <p>
                  <span className="font-medium">Spaces:</span>{" "}
                  {event.booked_count}/{event.capacity}
                </p>
              </div>

              <Link
                href={`/events/${event.id}`}
                className="inline-block rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
              >
                View Details
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
