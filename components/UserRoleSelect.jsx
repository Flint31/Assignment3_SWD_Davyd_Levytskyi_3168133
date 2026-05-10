"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRoleSelect({ userId, currentRole }) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  async function handleChange(event) {
    const newRole = event.target.value;
    setRole(newRole);
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to update role.");
        setRole(currentRole);
        return;
      }

      // Refresh the admin table after role update
      router.refresh();
    } catch {
      alert("Request failed. Please try again.");
      setRole(currentRole);
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={loading}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 disabled:bg-gray-100"
    >
      <option value="attendee">Attendee</option>
      <option value="organiser">Organiser</option>
      <option value="admin">Admin</option>
    </select>
  );
}
