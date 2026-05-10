import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validateEventInput } from "@/lib/validation";

export const runtime = "nodejs";

// GET all events with organiser name and booking count
export async function GET() {
  try {
    const [events] = await db.execute(
      `SELECT 
        events.id,
        events.title,
        events.description,
        events.location,
        events.event_date,
        events.capacity,
        events.created_at,
        users.name AS organiser_name,
        COUNT(CASE WHEN bookings.status = 'booked' THEN 1 END) AS booked_count
       FROM events
       JOIN users ON events.organiser_id = users.id
       LEFT JOIN bookings ON events.id = bookings.event_id
       GROUP BY events.id
       ORDER BY events.event_date ASC`
    );

    return NextResponse.json({
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    return NextResponse.json(
      { error: "Something went wrong while loading events." },
      { status: 500 }
    );
  }
}

// POST creates a new event. Only organisers can create events.
export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create an event." },
        { status: 401 }
      );
    }

    if (user.role !== "organiser") {
      return NextResponse.json(
        { error: "Only organisers can create events." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { errors, values } = validateEventInput(body);

    // Server-side validation protects the database from invalid data
    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(" ") },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO events 
        (organiser_id, title, description, location, event_date, capacity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        values.title,
        values.description,
        values.location,
        values.event_date,
        values.capacity,
      ]
    );

    return NextResponse.json(
      {
        message: "Event created successfully.",
        eventId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);

    return NextResponse.json(
      { error: "Something went wrong while creating the event." },
      { status: 500 }
    );
  }
}