import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validateEventInput } from "@/lib/validation";

export const runtime = "nodejs";

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

// GET one event by ID
export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid event ID." },
        { status: 400 }
      );
    }

    const [events] = await db.execute(
      `SELECT 
        events.id,
        events.organiser_id,
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
       WHERE events.id = ?
       GROUP BY events.id
       LIMIT 1`,
      [id]
    );

    if (!events[0]) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      event: events[0],
    });
  } catch (error) {
    console.error("Get event error:", error);

    return NextResponse.json(
      { error: "Something went wrong while loading the event." },
      { status: 500 }
    );
  }
}

// PATCH updates an event. Organisers can only update their own events.
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid event ID." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to update an event." },
        { status: 401 }
      );
    }

    const [existingEvents] = await db.execute(
      "SELECT id, organiser_id FROM events WHERE id = ? LIMIT 1",
      [id]
    );

    const existingEvent = existingEvents[0];

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    const isOwner = existingEvent.organiser_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to update this event." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { errors, values } = validateEventInput(body);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(" ") },
        { status: 400 }
      );
    }

    await db.execute(
      `UPDATE events
       SET title = ?, description = ?, location = ?, event_date = ?, capacity = ?
       WHERE id = ?`,
      [
        values.title,
        values.description,
        values.location,
        values.event_date,
        values.capacity,
        id,
      ]
    );

    return NextResponse.json({
      message: "Event updated successfully.",
    });
  } catch (error) {
    console.error("Update event error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the event." },
      { status: 500 }
    );
  }
}

// DELETE removes an event. Organiser owner or admin can delete it.
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid event ID." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to delete an event." },
        { status: 401 }
      );
    }

    const [existingEvents] = await db.execute(
      "SELECT id, organiser_id FROM events WHERE id = ? LIMIT 1",
      [id]
    );

    const existingEvent = existingEvents[0];

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    const isOwner = existingEvent.organiser_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to delete this event." },
        { status: 403 }
      );
    }

    await db.execute("DELETE FROM events WHERE id = ?", [id]);

    return NextResponse.json({
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error("Delete event error:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting the event." },
      { status: 500 }
    );
  }
}