import { db } from "@/lib/db/client";
import { events, topics, categories, eventTopics, eventCategories } from "@/lib/db/schema";
import { eq, asc, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditEventForm } from "@/components/edit-event-form";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, params.id))
    .limit(1);

  if (!event) {
    notFound();
  }

  // Get all events except the current one for parent event selector
  const eventsList = await db
    .select()
    .from(events)
    .where(ne(events.id, params.id))
    .orderBy(asc(events.eventName));

  // Get all topics and categories
  const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));

  // Get currently selected topics for this event
  const selectedEventTopics = await db
    .select({ id: topics.id })
    .from(eventTopics)
    .innerJoin(topics, eq(eventTopics.topicId, topics.id))
    .where(eq(eventTopics.eventId, params.id));

  // Get currently selected categories for this event
  const selectedEventCategories = await db
    .select({ id: categories.id })
    .from(eventCategories)
    .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
    .where(eq(eventCategories.eventId, params.id));

  return (
    <EditEventForm
      event={event}
      eventsList={eventsList}
      allTopics={allTopics}
      allCategories={allCategories}
      selectedTopicIds={selectedEventTopics.map(t => t.id)}
      selectedCategoryIds={selectedEventCategories.map(c => c.id)}
    />
  );
}
