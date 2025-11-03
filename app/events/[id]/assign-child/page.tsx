import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { eq, isNull, or, ne, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { assignEventAsChild } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AssignChildEventPage({
  params,
}: {
  params: { id: string };
}) {
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
  // Exclude: current event, events that already have this as parent, and events that are already parents of this event
  const availableEvents = await db
    .select()
    .from(events)
    .where(
      and(
        ne(events.id, params.id), // Not the current event
        or(
          isNull(events.parentEventId), // Top-level events
          ne(events.parentEventId, params.id) // Events with different parent
        )
      )
    );

  // Filter out events that would create circular references
  const validEvents = availableEvents.filter(event => {
    // Don't allow assigning if this event would create a circular reference
    // (i.e., don't allow assigning a parent or ancestor as a child)
    return event.id !== parentEvent.parentEventId && !existingChildIds.includes(event.id);
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/events/${params.id}`}
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold">Assign Child Event</h1>
        <p className="text-muted-foreground mt-2">
          Select an existing event to assign as a child of <span className="font-medium">{parentEvent.eventName}</span>
        </p>
      </div>

      {validEvents.length > 0 ? (
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Available Events</h2>
          <div className="space-y-2">
            {validEvents.map((event) => (
              <form
                key={event.id}
                action={assignEventAsChild.bind(null, event.id, params.id)}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{event.eventName}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {event.eventType || "No type"} • {event.eventDateStart || "No date"}
                    {event.parentEventId && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Has parent
                      </span>
                    )}
                  </div>
                </div>
                <Button type="submit" size="sm">
                  Assign as Child
                </Button>
              </form>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">No available events to assign as children.</p>
          <p className="text-sm text-muted-foreground mt-2">
            All existing events are either already children or would create circular references.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/events/new?parentEventId=${params.id}`}>
              Create New Child Event
            </Link>
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href={`/events/${params.id}`}>Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
