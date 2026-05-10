import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Returns the currently logged-in user based on the session cookie
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("Current user error:", error);

    return NextResponse.json(
      { error: "Something went wrong while checking the session." },
      { status: 500 }
    );
  }
}
