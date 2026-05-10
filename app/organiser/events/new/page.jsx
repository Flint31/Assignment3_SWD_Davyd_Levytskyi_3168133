import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import EventForm from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "organiser") {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Create New Event</h1>
      <EventForm mode="create" />
    </section>
  );
}
