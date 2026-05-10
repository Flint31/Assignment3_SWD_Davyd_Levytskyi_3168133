"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventForm({ mode = "create", event = null }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    location: event?.location || "",
    event_date: event?.event_date || "",
    capacity: event?.capacity || 1,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = mode === "edit" ? `/api/events/${event.id}` : "/api/events";
    const method = mode === "edit" ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // After creating or editing, return to organiser dashboard
      router.push("/organiser/dashboard");
      router.refresh();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={updateField}
          className="w-full rounded border px-3 py-2"
          placeholder="Example: React Basics Workshop"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          rows="5"
          className="w-full rounded border px-3 py-2"
          placeholder="Describe the workshop or event"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <input
          name="location"
          value={form.location}
          onChange={updateField}
          className="w-full rounded border px-3 py-2"
          placeholder="Room 204 / Online / Campus Hall"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Date and time</label>
        <input
          name="event_date"
          type="datetime-local"
          value={form.event_date}
          onChange={updateField}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Capacity</label>
        <input
          name="capacity"
          type="number"
          min="1"
          value={form.capacity}
          onChange={updateField}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <button
        disabled={loading}
        className="rounded bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 disabled:bg-gray-400"
      >
        {loading
          ? "Saving..."
          : mode === "edit"
            ? "Update Event"
            : "Create Event"}
      </button>
    </form>
  );
}
