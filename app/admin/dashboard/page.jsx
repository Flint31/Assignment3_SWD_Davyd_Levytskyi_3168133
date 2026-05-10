import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import UserRoleSelect from "@/components/UserRoleSelect";
import DeleteUserButton from "@/components/DeleteUserButton";

export const dynamic = "force-dynamic";

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const [users] = await db.execute(
    `SELECT id, name, email, role, created_at
     FROM users
     ORDER BY created_at DESC`
  );

  const [statsRows] = await db.execute(
    `SELECT
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM events) AS total_events,
      (SELECT COUNT(*) FROM bookings) AS total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'booked') AS active_bookings`
  );

  const stats = statsRows[0];

  return (
    <section className="page-container">
      <div className="mb-8">
        <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-blue-700">
          Admin Area
        </p>

        <h1 className="text-4xl font-extrabold text-gray-900">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-lg text-gray-700">
          Manage users, review roles, and oversee the system.
        </p>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-4">
        <div className="card p-6">
          <p className="text-sm font-bold uppercase text-gray-500">
            Total Users
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {stats.total_users}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-bold uppercase text-gray-500">
            Events
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {stats.total_events}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-bold uppercase text-gray-500">
            Total Bookings
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {stats.total_bookings}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-bold uppercase text-gray-500">
            Active Bookings
          </p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900">
            {stats.active_bookings}
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-2xl font-extrabold text-gray-900">
            User Management
          </h2>
          <p className="mt-1 text-gray-700">
            Change user roles or remove users from the system.
          </p>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="px-5 py-4 font-extrabold">Name</th>
              <th className="px-5 py-4 font-extrabold">Email</th>
              <th className="px-5 py-4 font-extrabold">Role</th>
              <th className="px-5 py-4 font-extrabold">Created</th>
              <th className="px-5 py-4 font-extrabold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser.id;

              return (
                <tr key={user.id} className="border-t border-gray-200">
                  <td className="px-5 py-4 font-bold text-gray-900">
                    {user.name}
                    {isCurrentUser && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                        You
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role}
                    />
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {formatDate(user.created_at)}
                  </td>

                  <td className="px-5 py-4">
                    {isCurrentUser ? (
                      <span className="text-sm font-bold text-gray-500">
                        Protected
                      </span>
                    ) : (
                      <DeleteUserButton
                        userId={user.id}
                        userName={user.name}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
