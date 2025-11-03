import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NewEventForm } from "@/components/new-event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { parentEventId?: string };
}) {
  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));

  // If parentEventId is provided, fetch the parent event for display
  const parentEventId = searchParams.parentEventId;
  const parentEvent = parentEventId
    ? await db.select().from(events).where(eq(events.id, parentEventId)).limit(1).then(r => r[0])
    : null;

  return (
    <NewEventForm
      eventsList={eventsList}
      parentEventId={parentEventId}
      parentEvent={parentEvent}
    />
  );
}
