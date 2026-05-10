import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const SESSION_COOKIE_NAME = "session_token";

// Creates a secure random token for the user session
export function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Calculates when the session should expire
export function getSessionExpiryDate() {
  const days = Number(process.env.SESSION_DAYS || 7);
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + days);

  return expiresAt;
}

// Saves the session in MySQL and stores the token in an HttpOnly cookie
export async function createSession(userId) {
  const token = createSessionToken();
  const expiresAt = getSessionExpiryDate();

  await db.execute(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt]
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

// Removes the session from MySQL and clears the cookie
export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.execute("DELETE FROM sessions WHERE token = ?", [token]);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Reads the current user using the session cookie
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const [rows] = await db.execute(
    `SELECT users.id, users.name, users.email, users.role
     FROM sessions
     JOIN users ON sessions.user_id = users.id
     WHERE sessions.token = ?
     AND sessions.expires_at > NOW()
     LIMIT 1`,
    [token]
  );

  return rows[0] || null;
}

// Makes sure the user is logged in
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

// Makes sure the user has the correct role
export async function requireRole(allowedRoles) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("You do not have permission to access this resource");
  }

  return user;
}
