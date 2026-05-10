"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "attendee",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed.");
        return;
      }

      // After registration, the API also creates a login session
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>

      {error && (
        <div className="mb-4 rounded bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={updateField}
            className="w-full rounded border px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={updateField}
            className="w-full rounded border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            className="w-full rounded border px-3 py-2"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={updateField}
            className="w-full rounded border px-3 py-2"
          >
            <option value="attendee">Attendee</option>
            <option value="organiser">Organiser</option>
          </select>
        </div>

        <button
          disabled={loading}
          className="w-full rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:bg-gray-400"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-700 hover:underline">
          Login here
        </Link>
      </p>
    </section>
  );
}
