import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const allowedRoles = ["attendee", "organiser", "admin"];

function isValidId(id) {
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

// PATCH updates a user's role
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update user roles." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const role = String(body.role || "").trim();

    // Server-side validation for role changes
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );
    }

    const [users] = await db.execute(
      `SELECT id, role
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    const targetUser = users[0];

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    await db.execute(
      `UPDATE users
       SET role = ?
       WHERE id = ?`,
      [role, id]
    );

    return NextResponse.json({
      message: "User role updated successfully.",
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    return NextResponse.json(
      { error: "Something went wrong while updating the user." },
      { status: 500 }
    );
  }
}

// DELETE removes a user from the system
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    if (!isValidId(id)) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete users." },
        { status: 403 }
      );
    }

    // Prevent the admin from deleting their own account
    if (Number(id) === Number(currentUser.id)) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account." },
        { status: 400 }
      );
    }

    const [users] = await db.execute(
      `SELECT id
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!users[0]) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    await db.execute("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting the user." },
      { status: 500 }
    );
  }
}