import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { eq, isNull, or, ne, and, ilike, sql, asc, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { assignEventAsChild } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AssignChildEventPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { showAll?: string; search?: string; type?: string; sortBy?: string; sortOrder?: string };
}) {
  const showAll = searchParams.showAll === "true";
  const search = searchParams.search || "";
  const typeFilter = searchParams.type || "";
  const sortBy = searchParams.sortBy || "eventName";
  const sortOrder = searchParams.sortOrder || "asc";

  const [parentEvent] = await db
    .select()
    .from(events)
    .where(eq(events.id, params.id))
    .limit(1);

  if (!parentEvent) {
    notFound();
  }

  // Get existing child events
  const existingChildren = await db
    .select()
    .from(events)
    .where(eq(events.parentEventId, params.id));

  const existingChildIds = existingChildren.map(e => e.id);

  // Build conditions for available events
  const conditions = [
    ne(events.id, params.id),
    isNull(events.deletedAt),
    or(
      isNull(events.parentEventId),
      ne(events.parentEventId, params.id)
    )
  ];

  // Add search filter
  if (search) {
    conditions.push(ilike(events.eventName, `%${search}%`));
  }

  // Add type filter
  if (typeFilter) {
    conditions.push(eq(events.eventType, typeFilter));
  }

  // Determine sort column and order
  const sortColumn = {
    eventName: events.eventName,
    eventDateStart: events.eventDateStart,
  }[sortBy] || events.eventName;
  const orderFn = sortOrder === "desc" ? desc : asc;

  // Get all events that could be assigned as children
  const availableEvents = await db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(orderFn(sortColumn));

  // Get distinct event types for filter dropdown
  const eventTypes = await db
    .selectDistinct({ type: events.eventType })
    .from(events)
    .where(sql`${events.eventType} IS NOT NULL AND ${events.eventType} != ''`)
    .orderBy(events.eventType);

  // Filter out events that would create circular references
  const validEvents = availableEvents.filter(event => {
    return event.id !== parentEvent.parentEventId && !existingChildIds.includes(event.id);
  });

  // By default, only show top-level events (no parent)
  const displayEvents = showAll
    ? validEvents
    : validEvents.filter(event => !event.parentEventId);

  const hiddenCount = validEvents.length - displayEvents.length;

  // Build URL for filters/sorting
  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    const merged = {
      showAll: showAll ? "true" : undefined,
      search: search || undefined,
      type: typeFilter || undefined,
      sortBy: sortBy !== "eventName" ? sortBy : undefined,
      sortOrder: sortOrder !== "asc" ? sortOrder : undefined,
      ...newParams
    };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    const qs = urlParams.toString();
    return qs ? `?${qs}` : "";
  };

  // Build sort URL - toggles order if same column, otherwise sets new column with asc
  const getSortUrl = (column: string) => {
    const newOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    return buildUrl({ sortBy: column, sortOrder: newOrder });
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Events", href: "/events" },
    { label: parentEvent.eventName, href: `/events/${params.id}` },
    { label: "Assign Child Event" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Assign Child Event</h1>
        <p className="text-muted-foreground">
          Select an existing event to assign as a child of <span className="font-medium">{parentEvent.eventName}</span>
        </p>
      </div>

      {/* Search & Filters */}
      <form className="rounded-lg border p-4" method="GET">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Search</label>
            <Input
              name="search"
              placeholder="Search by event name..."
              defaultValue={search}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Type</label>
            <select
              name="type"
              defaultValue={typeFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {eventTypes.map((t) => (
                <option key={t.type} value={t.type!}>
                  {t.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">View</label>
            <select
              name="showAll"
              defaultValue={showAll ? "true" : ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Top-Level Only</option>
              <option value="true">All Events</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" size="sm">Search</Button>
          {(search || typeFilter) && (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={`/events/${params.id}/assign-child${showAll ? "?showAll=true" : ""}`}>
                Clear Filters
              </Link>
            </Button>
          )}
        </div>
      </form>

      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {displayEvents.length} events
        {search && ` matching "${search}"`}
        {typeFilter && ` of type "${typeFilter}"`}
        {!showAll && hiddenCount > 0 && (
          <span> ({hiddenCount} with existing parents hidden)</span>
        )}
      </div>

      {displayEvents.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <Link
                    href={getSortUrl("eventName")}
                    className="flex items-center gap-1 hover:underline"
                  >
                    Name
                    {sortBy === "eventName" ? (
                      <span className="text-xs font-bold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">↕</span>
                    )}
                  </Link>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  <Link
                    href={getSortUrl("eventDateStart")}
                    className="flex items-center gap-1 hover:underline"
                  >
                    Start Date
                    {sortBy === "eventDateStart" ? (
                      <span className="text-xs font-bold">{sortOrder === "asc" ? "↑" : "↓"}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">↕</span>
                    )}
                  </Link>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">End Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayEvents.map((event) => (
                <tr key={event.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/events/${event.id}`} className="font-medium text-blue-600 hover:underline">
                      {event.eventName}
                    </Link>
                    {event.parentEventId && (
                      <Badge variant="outline" className="ml-2 text-xs">Has parent</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{event.eventType || "—"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(event.eventDateStart)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(event.eventDateEnd)}</td>
                  <td className="px-4 py-3 text-sm">
                    {event.catalogingStatus ? (
                      <Badge variant="outline" className="text-xs">{event.catalogingStatus}</Badge>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <form action={assignEventAsChild.bind(null, event.id, params.id)}>
                      <Button size="sm" type="submit">Assign</Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No available events to assign as children</p>
          <p className="text-xs mt-1">
            All existing events are either already children or would create circular references.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href={`/events/new?parentEventId=${params.id}`}>
              Create New Child Event
            </Link>
          </Button>
        </div>
      )}

      <div>
        <Button variant="outline" asChild>
          <Link href={`/events/${params.id}`}>Back to Event</Link>
        </Button>
      </div>
    </div>
  );
}
