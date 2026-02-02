import { db } from "@/lib/db/client";
import { events, topics, categories, locations, addresses, locationAddresses } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { NewEventForm } from "@/components/new-event-form";

export const dynamic = "force-dynamic";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { parentEventId?: string };
}) {
  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));
  const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
  const allLocations = await db.select().from(locations).orderBy(asc(locations.name));
  const allAddresses = await db.select().from(addresses);
  const locationAddressLinks = await db
    .select({
      locationId: locationAddresses.locationId,
      addressId: locationAddresses.addressId,
      isPrimary: locationAddresses.isPrimary,
    })
    .from(locationAddresses);

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
      allTopics={allTopics}
      allCategories={allCategories}
      allLocations={allLocations}
      allAddresses={allAddresses}
      locationAddressLinks={locationAddressLinks}
    />
  );
}
