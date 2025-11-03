import { db } from "@/lib/db/client";
import { events, sessions, archiveAssets } from "@/lib/db/schema";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpandableEventRow } from "@/components/expandable-event-row";
import { Pagination } from "@/components/pagination";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    type?: string;
    country?: string;
    view?: string;
    page?: string;
  };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";
  const typeFilter = searchParams.type || "";
  const countryFilter = searchParams.country || "";
  const viewFilter = searchParams.view || "top-level"; // Default to top-level events
  const page = parseInt(searchParams.page || "1");
  const perPage = 50;
  const offset = (page - 1) * perPage;

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(events.eventName, `%${search}%`),
        ilike(events.eventId, `%${search}%`),
        ilike(events.city, `%${search}%`),
        ilike(events.centerName, `%${search}%`)
      )
    );
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

  if (countryFilter) {
    conditions.push(eq(events.country, countryFilter));
  }

  // Filter by top-level vs all events
  if (viewFilter === "top-level") {
    conditions.push(sql`${events.parentEventId} IS NULL`);
  }

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const totalPages = Math.ceil(count / perPage);

  // Get events with asset counts, session counts, child event counts, and parent event name
  const eventsList = await db
    .select({
      event: events,
      parentEventName: sql<string>`
        (SELECT e2.event_name
         FROM events e2
         WHERE e2.id = events.parent_event_id)
      `.as('parent_event_name'),
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
    .orderBy(desc(events.createdAt))
    .limit(perPage)
    .offset(offset);

  // Get unique countries for filter
  const countries = await db
    .selectDistinct({ country: events.country })
    .from(events)
    .where(sql`${events.country} IS NOT NULL AND ${events.country} != ''`)
    .orderBy(events.country);

  // Get unique event types for filter
  const types = await db
    .selectDistinct({ type: events.eventType })
    .from(events)
    .where(sql`${events.eventType} IS NOT NULL AND ${events.eventType} != ''`)
    .orderBy(events.eventType);

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
      <form className="rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              name="search"
              placeholder="Search by name, ID, city, or center..."
              defaultValue={search}
            />
          </div>

          <div>
            <select
              name="view"
              defaultValue={viewFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
            >
              <option value="top-level">Top-Level Events</option>
              <option value="all">All Events</option>
            </select>
          </div>

          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="null">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready">Ready</option>
              <option value="Needs Review">Needs Review</option>
            </select>
          </div>

          <div>
            <select
              name="type"
              defaultValue={typeFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {types.map((t) => (
                <option key={t.type} value={t.type!}>
                  {t.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="country"
              defaultValue={countryFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.country} value={c.country!}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit">Apply Filters</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/events">Clear</Link>
          </Button>
        </div>
      </form>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {offset + 1}-{Math.min(offset + perPage, count)} of {count} events
        {search && ` matching "${search}"`}
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium w-16">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Event Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date Range</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Child Events</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Sessions</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Assets</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventsList.map(({ event, parentEventName, sessionCount, assetCount, childEventCount }, index) => (
              <ExpandableEventRow
                key={event.id}
                event={event}
                parentEventName={parentEventName}
                childEventCount={childEventCount}
                sessionCount={sessionCount}
                assetCount={assetCount}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>

      {eventsList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No events found. Create your first event to get started.
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/events"
        searchParams={{
          ...(search && { search }),
          ...(viewFilter !== "top-level" && { view: viewFilter }),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
          ...(countryFilter && { country: countryFilter }),
        }}
      />
    </div>
  );
}
