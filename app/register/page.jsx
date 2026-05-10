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
    <section className="mx-auto max-w-md">
      <div className="card p-8">
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-700">
            Join WorkshopHub
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Create an account
          </h1>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              className="input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              className="input"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={updateField}
              className="input"
            >
              <option value="attendee">Attendee</option>
              <option value="organiser">Organiser</option>
            </select>
          </div>

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-700">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-700 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}
