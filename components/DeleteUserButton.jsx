"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ userId, userName }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}? This will also delete their related events, sessions, or bookings.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to delete user.");
        return;
      }

      // Refresh the admin table after deleting the user
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
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:bg-gray-400"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
