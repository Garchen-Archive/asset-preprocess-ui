import { db } from "@/lib/db/client";
import { events, locations } from "@/lib/db/schema";
import { asc, desc, ilike, eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { EventFilters } from "@/components/event-filters";
import { EventsPageClient } from "@/components/events-page-client";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    type?: string;
    view?: string;
    source?: string;
    location?: string;
    organizer?: string;
    hostingCenter?: string;
    country?: string;
    locationRaw?: string;
    metadataSearch?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";
  const typeFilter = searchParams.type || "";
  const viewFilter = searchParams.view || "all"; // Default to all events
  const sourceFilter = searchParams.source || "";
  const locationFilter = searchParams.location || "";
  const organizerFilter = searchParams.organizer || "";
  const hostingCenterFilter = searchParams.hostingCenter || "";
  const countryFilter = searchParams.country || "";
  const locationRawFilter = searchParams.locationRaw || "";
  const metadataSearch = searchParams.metadataSearch || "";
  const sortBy = searchParams.sortBy || "createdAt";
  const sortOrder = searchParams.sortOrder || "desc";
  const page = parseInt(searchParams.page || "1");
  const perPage = 50;
  const offset = (page - 1) * perPage;

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(ilike(events.eventName, `%${search}%`));
  }

  if (statusFilter) {
    if (statusFilter === "null") {
      conditions.push(sql`${events.catalogingStatus} IS NULL`);
    } else {
      conditions.push(eq(events.catalogingStatus, statusFilter));
    }
  }

  if (typeFilter) {
    conditions.push(eq(events.eventType, typeFilter));
  }

  if (sourceFilter) {
    if (sourceFilter === "null") {
      conditions.push(sql`${events.harvestSource} IS NULL`);
    } else {
      conditions.push(eq(events.harvestSource, sourceFilter));
    }
  }

  // Filter by top-level vs all events
  if (viewFilter === "top-level") {
    conditions.push(sql`${events.parentEventId} IS NULL`);
  }

  // Location & organizer filters
  if (locationFilter) {
    conditions.push(eq(events.locationId, locationFilter));
  }

  if (organizerFilter) {
    conditions.push(eq(events.organizerId, organizerFilter));
  }

  // Additional metadata filters
  if (hostingCenterFilter) {
    conditions.push(sql`${events.additionalMetadata}->>'hosting_center' = ${hostingCenterFilter}`);
  }

  if (countryFilter) {
    conditions.push(sql`${events.additionalMetadata}->>'country_raw' = ${countryFilter}`);
  }

  if (locationRawFilter) {
    conditions.push(sql`${events.additionalMetadata}->>'location_raw' = ${locationRawFilter}`);
  }

  if (metadataSearch) {
    conditions.push(sql`${events.additionalMetadata}::text ILIKE ${`%${metadataSearch}%`}`);
  }

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const totalPages = Math.ceil(count / perPage);

  // Get events with asset counts, session counts, child event counts, parent event name, and location name
  const eventsList = await db
    .select({
      event: events,
      parentEventName: sql<string>`
        (SELECT e2.event_name
         FROM events e2
         WHERE e2.id = events.parent_event_id)
      `.as('parent_event_name'),
      locationName: sql<string>`
        (SELECT l.name
         FROM locations l
         WHERE l.id = events.location_id)
      `.as('location_name'),
      sessionCount: sql<number>`
        COALESCE(
          (SELECT COUNT(*)
           FROM sessions s
           WHERE s.event_id = events.id
          ), 0
        )::int
      `.as('session_count'),
      assetCount: sql<number>`
        COALESCE(
          (SELECT COUNT(DISTINCT a.id)
           FROM sessions s
           LEFT JOIN archive_assets a ON a.session_id = s.id
           WHERE s.event_id = events.id
          ), 0
        )::int
      `.as('asset_count'),
      childEventCount: sql<number>`
        COALESCE(
          (SELECT COUNT(*)
           FROM events e
           WHERE e.parent_event_id = events.id
          ), 0
        )::int
      `.as('child_event_count'),
    })
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy((() => {
      const col = {
        eventName: events.eventName,
        eventDateStart: events.eventDateStart,
        eventDateEnd: events.eventDateEnd,
        createdAt: events.createdAt,
      }[sortBy] || events.createdAt;
      return sortOrder === "asc" ? asc(col) : desc(col);
    })())
    .limit(perPage)
    .offset(offset);

  // Fetch distinct values for filter dropdowns + all locations for bulk edit
  const [types, hostLocations, organizers, hostingCenters, countries, locationTexts, allLocations] = await Promise.all([
    // Distinct event types
    db
      .selectDistinct({ type: events.eventType })
      .from(events)
      .where(sql`${events.eventType} IS NOT NULL AND ${events.eventType} != ''`)
      .orderBy(events.eventType),

    // Distinct host locations (locations referenced by events.location_id)
    db
      .selectDistinct({ id: locations.id, name: locations.name })
      .from(locations)
      .innerJoin(events, eq(events.locationId, locations.id))
      .orderBy(locations.name),

    // Distinct organizers (locations referenced by events.organizer_id)
    db
      .selectDistinct({ id: locations.id, name: locations.name })
      .from(locations)
      .innerJoin(events, eq(events.organizerId, locations.id))
      .orderBy(locations.name),

    // Distinct hosting_center values from additional_metadata
    db
      .selectDistinct({
        value: sql<string>`${events.additionalMetadata}->>'hosting_center'`,
      })
      .from(events)
      .where(sql`${events.additionalMetadata}->>'hosting_center' IS NOT NULL AND ${events.additionalMetadata}->>'hosting_center' != ''`)
      .orderBy(sql`${events.additionalMetadata}->>'hosting_center'`),

    // Distinct country_raw values from additional_metadata
    db
      .selectDistinct({
        value: sql<string>`${events.additionalMetadata}->>'country_raw'`,
      })
      .from(events)
      .where(sql`${events.additionalMetadata}->>'country_raw' IS NOT NULL AND ${events.additionalMetadata}->>'country_raw' != ''`)
      .orderBy(sql`${events.additionalMetadata}->>'country_raw'`),

    // Distinct location_raw values from additional_metadata
    db
      .selectDistinct({
        value: sql<string>`${events.additionalMetadata}->>'location_raw'`,
      })
      .from(events)
      .where(sql`${events.additionalMetadata}->>'location_raw' IS NOT NULL AND ${events.additionalMetadata}->>'location_raw' != ''`)
      .orderBy(sql`${events.additionalMetadata}->>'location_raw'`),

    // All locations for bulk edit modal
    db
      .select({ id: locations.id, name: locations.name })
      .from(locations)
      .orderBy(locations.name),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage collection events (retreats, teachings, etc.)
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">Create Event</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <EventFilters
        search={search}
        viewFilter={viewFilter}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        sourceFilter={sourceFilter}
        locationFilter={locationFilter}
        organizerFilter={organizerFilter}
        hostingCenterFilter={hostingCenterFilter}
        countryFilter={countryFilter}
        locationRawFilter={locationRawFilter}
        metadataSearch={metadataSearch}
        availableTypes={types}
        availableLocations={hostLocations}
        availableOrganizers={organizers}
        availableHostingCenters={hostingCenters.map((h) => h.value).filter(Boolean)}
        availableCountries={countries.map((c) => c.value).filter(Boolean)}
        availableLocationTexts={locationTexts.map((l) => l.value).filter(Boolean)}
      />

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {offset + 1}-{Math.min(offset + perPage, count)} of {count} events
        {search && ` matching "${search}"`}
      </div>

      <EventsPageClient
        eventsList={eventsList}
        locations={allLocations}
        availableTypes={types.map((t) => t.type).filter(Boolean) as string[]}
        offset={offset}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchParams={searchParams}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/events"
        searchParams={{
          ...(search && { search }),
          ...(viewFilter !== "all" && { view: viewFilter }),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
          ...(sourceFilter && { source: sourceFilter }),
          ...(locationFilter && { location: locationFilter }),
          ...(organizerFilter && { organizer: organizerFilter }),
          ...(hostingCenterFilter && { hostingCenter: hostingCenterFilter }),
          ...(countryFilter && { country: countryFilter }),
          ...(locationRawFilter && { locationRaw: locationRawFilter }),
          ...(metadataSearch && { metadataSearch }),
          ...(sortBy !== "createdAt" && { sortBy }),
          ...(sortOrder !== "desc" && { sortOrder }),
        }}
      />
    </div>
  );
}
