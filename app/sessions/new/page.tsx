import { db } from "@/lib/db/client";
import { events, topics, categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { NewSessionForm } from "@/components/new-session-form";

export const dynamic = "force-dynamic";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: { eventId?: string };
}) {
  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));
  const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));

  return (
    <NewSessionForm
      eventsList={eventsList}
      defaultEventId={searchParams.eventId}
      allTopics={allTopics}
      allCategories={allCategories}
    />
  );
}
