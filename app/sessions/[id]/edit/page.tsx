import { db } from "@/lib/db/client";
import { sessions, events, topics, categories, sessionTopics, sessionCategories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditSessionForm } from "@/components/edit-session-form";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const [sessionData] = await db
    .select({
      session: sessions,
      event: events,
    })
    .from(sessions)
    .leftJoin(events, eq(sessions.eventId, events.id))
    .where(eq(sessions.id, params.id))
    .limit(1);

  if (!sessionData) {
    notFound();
  }

  const { session: sessionRecord, event: sessionEvent } = sessionData;

  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));

  // Get all topics and categories
  const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));

  // Get currently selected topics for this session
  const selectedSessionTopics = await db
    .select({ id: topics.id })
    .from(sessionTopics)
    .innerJoin(topics, eq(sessionTopics.topicId, topics.id))
    .where(eq(sessionTopics.sessionId, params.id));

  // Get currently selected categories for this session
  const selectedSessionCategories = await db
    .select({ id: categories.id })
    .from(sessionCategories)
    .innerJoin(categories, eq(sessionCategories.categoryId, categories.id))
    .where(eq(sessionCategories.sessionId, params.id));

  return (
    <EditSessionForm
      session={sessionRecord}
      eventsList={eventsList}
      sessionEvent={sessionEvent}
      allTopics={allTopics}
      allCategories={allCategories}
      selectedTopicIds={selectedSessionTopics.map(t => t.id)}
      selectedCategoryIds={selectedSessionCategories.map(c => c.id)}
    />
  );
}
