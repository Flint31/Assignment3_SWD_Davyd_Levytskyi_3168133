import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import BookingButton from "@/components/BookingButton";

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

  let alreadyBooked = false;

  if (user?.role === "attendee") {
    const [bookings] = await db.execute(
      `SELECT id
       FROM bookings
       WHERE event_id = ? AND attendee_id = ? AND status = 'booked'
       LIMIT 1`,
      [event.id, user.id]
    );

    alreadyBooked = Boolean(bookings[0]);
  }

  const spacesLeft = Number(event.capacity) - Number(event.booked_count);

  return (
    <section className="page-container">
      <div className="card p-8">
        <Link href="/events" className="font-bold text-blue-700 hover:underline">
          Back to events
        </Link>

        <div className="mt-6">
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-blue-700">
            Event Details
          </p>

          <h1 className="text-4xl font-extrabold text-gray-900">
            {event.title}
          </h1>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-5">
            <p className="text-sm font-bold uppercase text-gray-500">
              Organiser
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {event.organiser_name}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5">
            <p className="text-sm font-bold uppercase text-gray-500">
              Location
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {event.location}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5">
            <p className="text-sm font-bold uppercase text-gray-500">
              Date
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {formatDate(event.event_date)}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5">
            <p className="text-sm font-bold uppercase text-gray-500">
              Spaces left
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {spacesLeft} of {event.capacity}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="mb-3 text-2xl font-extrabold text-gray-900">
            About this event
          </h2>

          <p className="whitespace-pre-line leading-8 text-gray-700">
            {event.description}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
          {user?.role === "attendee" ? (
            <BookingButton
              eventId={event.id}
              spacesLeft={spacesLeft}
              alreadyBooked={alreadyBooked}
            />
          ) : !user ? (
            <p className="text-gray-800">
              Please{" "}
              <Link href="/login" className="font-bold text-blue-700 underline">
                login
              </Link>{" "}
              as an attendee to book this event.
            </p>
          ) : (
            <p className="font-bold text-gray-800">
              Your current role is {user.role}. Only attendees can book events.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}