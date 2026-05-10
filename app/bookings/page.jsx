import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import CancelBookingButton from "@/components/CancelBookingButton";

export const dynamic = "force-dynamic";

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function MyBookingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "attendee") {
    redirect("/dashboard");
  }

  const [bookings] = await db.execute(
    `SELECT
      bookings.id,
      bookings.status,
      bookings.created_at,
      events.id AS event_id,
      events.title,
      events.location,
      events.event_date,
      users.name AS organiser_name
     FROM bookings
     JOIN events ON bookings.event_id = events.id
     JOIN users ON events.organiser_id = users.id
     WHERE bookings.attendee_id = ?
     ORDER BY events.event_date ASC`,
    [user.id]
  );

  return (
    <section className="page-container">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-blue-700">
            Attendee Area
          </p>

          <h1 className="text-4xl font-extrabold text-gray-900">
            My Bookings
          </h1>

          <p className="mt-3 text-lg text-gray-700">
            View and manage your event bookings.
          </p>
        </div>

        <Link href="/events" className="btn-primary">
          Browse Events
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="card p-8">
          <p className="text-gray-700">
            You have not booked any events yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => (
            <article key={booking.id} className="card p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {booking.title}
                  </h2>

                  <div className="mt-3 space-y-1 text-gray-700">
                    <p>
                      <span className="font-bold">Organiser:</span>{" "}
                      {booking.organiser_name}
                    </p>

                    <p>
                      <span className="font-bold">Location:</span>{" "}
                      {booking.location}
                    </p>

                    <p>
                      <span className="font-bold">Date:</span>{" "}
                      {formatDate(booking.event_date)}
                    </p>

                    <p>
                      <span className="font-bold">Status:</span>{" "}
                      <span
                        className={
                          booking.status === "booked"
                            ? "font-bold text-green-700"
                            : "font-bold text-red-700"
                        }
                      >
                        {booking.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/events/${booking.event_id}`}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100"
                  >
                    View Event
                  </Link>

                  {booking.status === "booked" && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
