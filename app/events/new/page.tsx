import { db } from "@/lib/db/client";
import { events, topics, categories, organizations, venues, locations, addresses, organizationLocations } from "@/lib/db/schema";
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

  // Get organization-location mappings (to auto-select venue when host org changes)
  const orgLocationMappings = await db
    .select({
      organizationId: organizationLocations.organizationId,
      locationId: organizationLocations.locationId,
    })
    .from(organizationLocations);

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
      allOrganizations={allOrganizations}
      allVenues={allVenues}
      orgLocationMappings={orgLocationMappings}
    />
  );
}
