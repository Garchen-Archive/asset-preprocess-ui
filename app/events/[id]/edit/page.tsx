import { db } from "@/lib/db/client";
import { events, topics, categories, eventTopics, eventCategories, organizations, venues, locations, addresses, organizationLocations } from "@/lib/db/schema";
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

  // Get parent event if exists
  const parentEvent = event.parentEventId
    ? await db
        .select()
        .from(events)
        .where(eq(events.id, event.parentEventId))
        .limit(1)
        .then((results) => results[0] || null)
    : null;

  // Get all topics, categories, and organizations
  const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));
  const allOrganizations = await db.select().from(organizations).orderBy(asc(organizations.name));

  // Fetch venues with location and address details
  const allVenues = await db
    .select({
      id: venues.id,
      name: venues.name,
      spaceLabel: venues.spaceLabel,
      venueType: venues.venueType,
      locationId: venues.locationId,
      locationName: locations.name,
      locationCode: locations.code,
      isOnline: locations.isOnline,
      addressId: venues.addressId,
      addressLabel: addresses.label,
      city: addresses.city,
      country: addresses.country,
      fullAddress: addresses.fullAddress,
    })
    .from(venues)
    .innerJoin(locations, eq(venues.locationId, locations.id))
    .leftJoin(addresses, eq(venues.addressId, addresses.id))
    .orderBy(asc(locations.name), asc(venues.spaceLabel));

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

  // Get organization-location mappings (to auto-select venue when host org changes)
  const orgLocationMappings = await db
    .select({
      organizationId: organizationLocations.organizationId,
      locationId: organizationLocations.locationId,
    })
    .from(organizationLocations);

  return (
    <EditEventForm
      event={event}
      eventsList={eventsList}
      parentEvent={parentEvent}
      allTopics={allTopics}
      allCategories={allCategories}
      allOrganizations={allOrganizations}
      allVenues={allVenues}
      orgLocationMappings={orgLocationMappings}
      selectedTopicIds={selectedEventTopics.map(t => t.id)}
      selectedCategoryIds={selectedEventCategories.map(c => c.id)}
    />
  );
}
