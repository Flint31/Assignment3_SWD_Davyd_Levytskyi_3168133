import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export default async function EventDetailsPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [events] = await db.execute(
    `SELECT
      events.id,
      events.organiser_id,
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
     WHERE events.id = ?
     LIMIT 1`,
    [id]
  );

  const event = events[0];

  if (!event) {
    notFound();
  }

  const spacesLeft = Number(event.capacity) - Number(event.booked_count);

  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
      <Link href="/events" className="text-sm text-blue-700 hover:underline">
        Back to events
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{event.title}</h1>

      <div className="mt-4 space-y-2 text-gray-700">
        <p>
          <span className="font-semibold">Organiser:</span>{" "}
          {event.organiser_name}
        </p>
        <p>
          <span className="font-semibold">Location:</span> {event.location}
        </p>
        <p>
          <span className="font-semibold">Date:</span>{" "}
          {formatDate(event.event_date)}
        </p>
        <p>
          <span className="font-semibold">Spaces left:</span> {spacesLeft}
        </p>
      </div>

      <div className="mt-6 border-t pt-6">
        <h2 className="mb-2 text-xl font-semibold">About this event</h2>
        <p className="whitespace-pre-line text-gray-600">{event.description}</p>
      </div>

      <div className="mt-8 rounded bg-blue-50 p-4 text-blue-800">
        {user?.role === "attendee" ? (
          <p>
            Booking button will be added in the next step when we build the
            booking system.
          </p>
        ) : !user ? (
          <p>
            Please{" "}
            <Link href="/login" className="font-semibold underline">
              login
            </Link>{" "}
            as an attendee to book this event.
          </p>
        ) : (
          <p>Your current role is {user.role}. Only attendees can book events.</p>
        )}
      </div>
    </section>
  );
}
