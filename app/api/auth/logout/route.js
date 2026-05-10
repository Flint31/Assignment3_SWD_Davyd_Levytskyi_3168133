import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  try {
    // Delete session from database and clear the cookie
    await destroySession();

    return NextResponse.json({
      message: "Logout successful.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong during logout.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
