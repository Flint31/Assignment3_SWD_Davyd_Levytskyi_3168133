import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

// PATCH cancels a booking
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid booking ID." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to cancel a booking." },
        { status: 401 }
      );
    }

    const [bookings] = await db.execute(
      `SELECT id, attendee_id, status
       FROM bookings
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    const booking = bookings[0];

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const isOwner = booking.attendee_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to cancel this booking." },
        { status: 403 }
      );
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "This booking is already cancelled." },
        { status: 400 }
      );
    }

    // Keep the row for booking history, but mark it as cancelled
    await db.execute(
      `UPDATE bookings
       SET status = 'cancelled'
       WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      message: "Booking cancelled successfully.",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return NextResponse.json(
      { error: "Something went wrong while cancelling the booking." },
      { status: 500 }
    );
  }
}

// DELETE removes a booking completely
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid booking ID." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to delete a booking." },
        { status: 401 }
      );
    }

    const [bookings] = await db.execute(
      `SELECT id, attendee_id
       FROM bookings
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    const booking = bookings[0];

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 }
      );
    }

    const isOwner = booking.attendee_id === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You do not have permission to delete this booking." },
        { status: 403 }
      );
    }

    await db.execute("DELETE FROM bookings WHERE id = ?", [id]);

    return NextResponse.json({
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting the booking." },
      { status: 500 }
    );
  }
}