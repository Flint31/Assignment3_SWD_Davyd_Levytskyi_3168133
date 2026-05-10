import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// GET returns bookings for the currently logged-in attendee
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to view bookings." },
        { status: 401 }
      );
    }

    if (user.role !== "attendee") {
      return NextResponse.json(
        { error: "Only attendees can view their bookings here." },
        { status: 403 }
      );
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
        events.capacity,
        users.name AS organiser_name
       FROM bookings
       JOIN events ON bookings.event_id = events.id
       JOIN users ON events.organiser_id = users.id
       WHERE bookings.attendee_id = ?
       ORDER BY events.event_date ASC`,
      [user.id]
    );

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);

    return NextResponse.json(
      { error: "Something went wrong while loading bookings." },
      { status: 500 }
    );
  }
}

// POST creates a booking for an event
export async function POST(request) {
  const connection = await db.getConnection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to book an event." },
        { status: 401 }
      );
    }

    if (user.role !== "attendee") {
      return NextResponse.json(
        { error: "Only attendees can book events." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const eventId = Number(body.event_id);

    if (!Number.isInteger(eventId) || eventId < 1) {
      return NextResponse.json(
        { error: "Invalid event ID." },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    const [events] = await connection.execute(
      `SELECT id, event_date, capacity
       FROM events
       WHERE id = ?
       LIMIT 1`,
      [eventId]
    );

    const event = events[0];

    if (!event) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Prevent booking events that are already in the past
    if (new Date(event.event_date) < new Date()) {
      await connection.rollback();

      return NextResponse.json(
        { error: "You cannot book a past event." },
        { status: 400 }
      );
    }

    const [existingBookings] = await connection.execute(
      `SELECT id, status
       FROM bookings
       WHERE event_id = ? AND attendee_id = ?
       LIMIT 1`,
      [eventId, user.id]
    );

    const existingBooking = existingBookings[0];

    if (existingBooking?.status === "booked") {
      await connection.rollback();

      return NextResponse.json(
        { error: "You have already booked this event." },
        { status: 409 }
      );
    }

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) AS booked_count
       FROM bookings
       WHERE event_id = ? AND status = 'booked'`,
      [eventId]
    );

    const bookedCount = Number(countRows[0].booked_count);

    if (bookedCount >= Number(event.capacity)) {
      await connection.rollback();

      return NextResponse.json(
        { error: "This event is fully booked." },
        { status: 400 }
      );
    }

    if (existingBooking?.status === "cancelled") {
      // Re-activate cancelled booking instead of creating duplicate row
      await connection.execute(
        `UPDATE bookings
         SET status = 'booked'
         WHERE id = ?`,
        [existingBooking.id]
      );
    } else {
      await connection.execute(
        `INSERT INTO bookings (event_id, attendee_id, status)
         VALUES (?, ?, 'booked')`,
        [eventId, user.id]
      );
    }

    await connection.commit();

    return NextResponse.json(
      { message: "Event booked successfully." },
      { status: 201 }
    );
  } catch (error) {
    await connection.rollback();

    console.error("Create booking error:", error);

    return NextResponse.json(
      { error: "Something went wrong while booking the event." },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
