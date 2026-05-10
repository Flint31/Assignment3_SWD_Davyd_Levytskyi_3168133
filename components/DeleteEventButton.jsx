"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteEventButton({ eventId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Are you sure you want to delete this event?");

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete event.");
        return;
      }

      // Refresh the page so the deleted event disappears from the list
      router.refresh();
    } catch {
      alert("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:bg-gray-400"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
