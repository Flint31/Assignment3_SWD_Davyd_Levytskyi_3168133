"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ bookingId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm("Cancel this booking?");

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to cancel booking.");
        return;
      }

      // Refresh booking list after cancellation
      router.refresh();
    } catch {
      alert("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
    >
      {loading ? "Cancelling..." : "Cancel"}
    </button>
  );
}
