import { db } from "@/lib/db/client";
import { events, sessions, archiveAssets } from "@/lib/db/schema";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    type?: string;
    country?: string;
  };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";
  const typeFilter = searchParams.type || "";
  const countryFilter = searchParams.country || "";

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

  // Get events with asset counts and session counts
  const eventsList = await db
    .select({
      event: events,
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
    })
    .from(events)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(events.createdAt));

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              name="search"
              placeholder="Search by name, ID, city, or center..."
              defaultValue={search}
            />
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
      {(search || statusFilter || typeFilter || countryFilter) && (
        <div className="text-sm text-muted-foreground">
          Found {eventsList.length} event{eventsList.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </div>
      )}

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium w-16">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Event ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date Range</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Sessions</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Assets</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventsList.map(({ event, sessionCount, assetCount }, index) => (
              <tr key={event.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-mono">{event.eventId}</td>
                <td className="px-4 py-3 text-sm">{event.eventName}</td>
                <td className="px-4 py-3 text-sm">{event.eventType || "—"}</td>
                <td className="px-4 py-3 text-sm">
                  {event.eventDateStart && event.eventDateEnd
                    ? `${event.eventDateStart} to ${event.eventDateEnd}`
                    : event.eventDateStart || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {event.city && event.country
                    ? `${event.city}, ${event.country}`
                    : event.country || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    sessionCount > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {sessionCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    assetCount > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {assetCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      event.catalogingStatus === "Ready"
                        ? "bg-green-100 text-green-700"
                        : event.catalogingStatus === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.catalogingStatus || "Not Started"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {eventsList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No events found. Create your first event to get started.
        </div>
      )}
    </div>
  );
}
