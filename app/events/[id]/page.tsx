import { db } from "@/lib/db/client";
import { events, sessions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { deleteEvent } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
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

  // Get sessions in this event
  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, params.id));

  // Get parent event if exists
  const parentEvent = event.parentEventId
    ? await db
        .select()
        .from(events)
        .where(eq(events.id, event.parentEventId))
        .limit(1)
        .then((results) => results[0] || null)
    : null;

  // Get child events
  const childEvents = await db
    .select()
    .from(events)
    .where(eq(events.parentEventId, params.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/events"
            className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
          >
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold">{event.eventName}</h1>
          <p className="text-muted-foreground font-mono">{event.eventId}</p>
        </div>
        <Button asChild>
          <Link href={`/events/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parentEvent && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Parent Event</dt>
                  <dd className="text-sm mt-1">
                    <Link href={`/events/${parentEvent.id}`} className="text-blue-600 hover:underline">
                      {parentEvent.eventName}
                    </Link>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Event Type</dt>
                <dd className="text-sm mt-1">{event.eventType || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                <dd className="text-sm mt-1">{event.eventDateStart || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                <dd className="text-sm mt-1">{event.eventDateEnd || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Category & Topic */}
          <div className="rounded-lg border p-6 bg-blue-50/50">
            <h2 className="text-xl font-semibold mb-4">Category & Topic</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                <dd className="text-sm mt-1">{event.category || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Topic</dt>
                <dd className="text-sm mt-1">{event.topic || "—"}</dd>
              </div>
            </dl>
            {event.eventDescription && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="text-sm mt-1">{event.eventDescription}</dd>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Center Name</dt>
                <dd className="text-sm mt-1">{event.centerName || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">City</dt>
                <dd className="text-sm mt-1">{event.city || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">State/Province</dt>
                <dd className="text-sm mt-1">{event.stateProvince || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                <dd className="text-sm mt-1">{event.country || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Child Events */}
          {childEvents.length > 0 && (
            <div className="rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Child Events ({childEvents.length})</h2>
              </div>
              <div className="space-y-2">
                {childEvents.map((childEvent) => (
                  <Link
                    key={childEvent.id}
                    href={`/events/${childEvent.id}`}
                    className="block p-3 rounded border hover:bg-muted/50"
                  >
                    <div className="font-medium">{childEvent.eventName}</div>
                    <div className="text-sm text-muted-foreground">
                      {childEvent.eventType || "No type"} • {childEvent.eventDateStart || "No date"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sessions in this Event */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Sessions ({eventSessions.length})</h2>
              <Button size="sm" asChild>
                <Link href={`/sessions/new?eventId=${params.id}`}>Add Session</Link>
              </Button>
            </div>
            {eventSessions.length > 0 ? (
              <div className="space-y-2">
                {eventSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block p-3 rounded border hover:bg-muted/50"
                  >
                    <div className="font-medium">{session.sessionName}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.topic || "No topic"} • {session.sessionDate || "No date"}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            )}
          </div>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Administrative */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Administrative</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="text-sm mt-1">
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
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                <dd className="text-sm mt-1">{event.createdBy || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Child Events</dt>
                <dd className="text-sm mt-1">{childEvents.length}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Session Count</dt>
                <dd className="text-sm mt-1">{eventSessions.length}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Total Duration</dt>
                <dd className="text-sm mt-1">{event.totalDuration || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-sm">{event.notes}</p>
            </div>
          )}

          {/* Additional Metadata */}
          {event.additionalMetadata && Object.keys(event.additionalMetadata).length > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Metadata</h2>
              <div className="bg-muted/50 rounded p-3">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(event.additionalMetadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/50 p-6">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this event will also delete all associated sessions.
            </p>
            <form action={deleteEvent.bind(null, params.id)}>
              <Button type="submit" variant="destructive" size="sm">
                Delete Event
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
