"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      // Redirect user after successful authentication
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
            Welcome back
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900">Login</h1>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Your password"
            />
          </div>

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-700">
          No account yet?{" "}
          <Link href="/register" className="font-bold text-blue-700 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </section>
  );
}
