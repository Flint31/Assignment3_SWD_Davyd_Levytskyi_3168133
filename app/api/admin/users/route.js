import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

// GET all users and admin dashboard statistics
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can access this resource." },
        { status: 403 }
      );
    }

    const [users] = await db.execute(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    const [statsRows] = await db.execute(
      `SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'booked') AS active_bookings`
    );

    return NextResponse.json({
      users,
      stats: statsRows[0],
    });
  } catch (error) {
    console.error("Admin get users error:", error);

    return NextResponse.json(
      { error: "Something went wrong while loading admin data." },
      { status: 500 }
    );
  }
}
