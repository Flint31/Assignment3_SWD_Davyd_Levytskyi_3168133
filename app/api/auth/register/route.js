import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

const allowedRoles = ["attendee", "organiser"];

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "attendee");

    // Server-side validation before saving anything to the database
    if (name.length < 2) {
      return NextResponse.json(

        { error: "Name must be at least 2 characters." },
        { status: 400 }
      );
    }


    if (!email.includes("@") || email.length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }



    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }


    // Public registration can only create attendee or organiser accounts
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );

    }



    const passwordHash = await hashPassword(password);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, role]
      
    );

    // Create a session immediately after successful registration
    await createSession(result.insertId);

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          id: result.insertId,
          name,
          email,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // MySQL duplicate email error
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Register error:", error);

    return NextResponse.json(
      { error: "Something went wrong during registration." },
      { status: 500 }
    );
  }
}