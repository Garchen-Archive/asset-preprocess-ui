import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { eq, isNull, or, ne, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { assignEventAsChild } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AssignChildEventPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { showAll?: string };
}) {
  const showAll = searchParams.showAll === "true";

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

  // Get all events that could be assigned as children
  const availableEvents = await db
    .select()
    .from(events)
    .where(
      and(
        ne(events.id, params.id),
        isNull(events.deletedAt),
        or(
          isNull(events.parentEventId),
          ne(events.parentEventId, params.id)
        )
      )
    );

  // Filter out events that would create circular references
  const validEvents = availableEvents.filter(event => {
    return event.id !== parentEvent.parentEventId && !existingChildIds.includes(event.id);
  });

  // By default, only show top-level events (no parent)
  const displayEvents = showAll
    ? validEvents
    : validEvents.filter(event => !event.parentEventId);

  const hiddenCount = validEvents.length - displayEvents.length;

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
          Select an existing event to assign as a child of {parentEvent.eventName}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {displayEvents.length} events
          {!showAll && hiddenCount > 0 && (
            <span> ({hiddenCount} with existing parents hidden)</span>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          {showAll ? (
            <Link href={`/events/${params.id}/assign-child`}>Show Top-Level Only</Link>
          ) : (
            <Link href={`/events/${params.id}/assign-child?showAll=true`}>Show All Events</Link>
          )}
        </Button>
      </div>

      {displayEvents.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Start Date</th>
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
