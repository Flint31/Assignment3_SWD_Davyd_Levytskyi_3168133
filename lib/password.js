import bcrypt from "bcryptjs";

// Hashes plain text passwords before saving them to the database
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Compares a plain text password with a stored hashed password
export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
