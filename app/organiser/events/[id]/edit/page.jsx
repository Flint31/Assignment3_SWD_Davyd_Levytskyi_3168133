import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import EventForm from "@/components/EventForm";

export const dynamic = "force-dynamic";

function formatForInput(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default async function EditEventPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [events] = await db.execute(
    `SELECT id, organiser_id, title, description, location, event_date, capacity
     FROM events
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  const event = events[0];

  if (!event) {
    notFound();
  }

  const isOwner = event.organiser_id === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    redirect("/dashboard");
  }

  const safeEvent = {
    ...event,
    event_date: formatForInput(event.event_date),
  };

  return (
    <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Edit Event</h1>
      <EventForm mode="edit" event={safeEvent} />
    </section>
  );
}
