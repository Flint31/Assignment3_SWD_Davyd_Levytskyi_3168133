"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingButton({ eventId, spacesLeft, alreadyBooked }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleBook() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Booking failed.");
        return;
      }

      setMessage("Booking successful.");
      router.refresh();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (alreadyBooked) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="font-bold text-green-800">
          You have already booked this event.
        </p>
      </div>
    );
  }

  if (spacesLeft <= 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-bold text-red-700">
          This event is fully booked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Booking..." : "Book this event"}
      </button>
    </div>
  );
}
