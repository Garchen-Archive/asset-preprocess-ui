import { db } from "@/lib/db/client";
import { events, sessions, topics, categories, eventTopics, eventCategories, archiveAssets, locations } from "@/lib/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
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

  // Get assets directly assigned to this event (no session)
  const directEventAssets = await db
    .select({
      id: archiveAssets.id,
      title: archiveAssets.title,
      name: archiveAssets.name,
      assetType: archiveAssets.assetType,
      duration: archiveAssets.duration,
      sessionId: archiveAssets.sessionId,
      catalogingStatus: archiveAssets.catalogingStatus,
    })
    .from(archiveAssets)
    .where(eq(archiveAssets.eventId, params.id));

  // Get all assets from all sessions in this event
  const sessionIds = eventSessions.map(s => s.id);
  const sessionAssets = sessionIds.length > 0
    ? await db
        .select({
          id: archiveAssets.id,
          title: archiveAssets.title,
          name: archiveAssets.name,
          assetType: archiveAssets.assetType,
          duration: archiveAssets.duration,
          sessionId: archiveAssets.sessionId,
          catalogingStatus: archiveAssets.catalogingStatus,
        })
        .from(archiveAssets)
        .where(inArray(archiveAssets.sessionId, sessionIds))
    : [];

  const totalAssetCount = directEventAssets.length + sessionAssets.length;

  // Get location if exists
  const location = event.locationId
    ? await db
        .select()
        .from(locations)
        .where(eq(locations.id, event.locationId))
        .limit(1)
        .then((results) => results[0] || null)
    : null;

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

  // Get topics for this event
  const eventTopicsList = await db
    .select({
      id: topics.id,
      name: topics.name,
    })
    .from(eventTopics)
    .innerJoin(topics, eq(eventTopics.topicId, topics.id))
    .where(eq(eventTopics.eventId, params.id));

  // Get categories for this event
  const eventCategoriesList = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(eventCategories)
    .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
    .where(eq(eventCategories.eventId, params.id));

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Events", href: "/events" },
  ];

  if (parentEvent) {
    breadcrumbItems.push({
      label: parentEvent.eventName,
      href: `/events/${parentEvent.id}`,
    });
  }

  breadcrumbItems.push({ label: event.eventName });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl font-bold">{event.eventName}</h1>
        </div>
        <Button asChild>
          <Link href={`/events/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>

      {/* Parent Event Badge */}
      {parentEvent && (
        <div className="rounded-lg border p-4 bg-blue-50/50 border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Child event of:</span>
            <Link
              href={`/events/${parentEvent.id}`}
              className="font-medium text-blue-600 hover:underline flex items-center gap-1"
            >
              ↑ {parentEvent.eventName}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <h2 className="text-xl font-semibold mb-4">Categories & Topics</h2>
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-2">Categories</dt>
                <dd className="flex flex-wrap gap-2">
                  {eventCategoriesList.length > 0 ? (
                    eventCategoriesList.map((cat) => (
                      <Badge key={cat.id} variant="secondary">
                        {cat.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-2">Topics</dt>
                <dd className="flex flex-wrap gap-2">
                  {eventTopicsList.length > 0 ? (
                    eventTopicsList.map((topic) => (
                      <Badge key={topic.id} variant="secondary">
                        {topic.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
            </div>
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
            {location ? (
              <div className="p-4 rounded-md bg-green-50/50 border border-green-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      <Link href={`/locations/${location.id}`} className="text-blue-600 hover:underline">
                        {location.name}
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{location.code}</p>
                    {location.city && location.country && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {location.city}, {location.country}
                      </p>
                    )}
                  </div>
                  {location.locationType && (
                    <Badge variant="secondary" className="text-xs">
                      {location.locationType}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No location assigned. <Link href={`/events/${params.id}/edit`} className="text-blue-600 hover:underline">Edit event</Link> to add one.
              </p>
            )}
          </div>

          {/* Child Events */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Child Events ({childEvents.length})</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/events/${params.id}/assign-child`}>Assign Existing</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/events/new?parentEventId=${params.id}`}>Create New</Link>
                </Button>
              </div>
            </div>
            {childEvents.length > 0 ? (
              <div className="space-y-2">
                {childEvents.map((childEvent) => (
                  <Link
                    key={childEvent.id}
                    href={`/events/${childEvent.id}`}
                    className="block p-3 rounded border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{childEvent.eventName}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {childEvent.eventType || "No type"} • {childEvent.eventDateStart || "No date"}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No child events yet</p>
                <p className="text-xs mt-1">Click "Add Child Event" to create one</p>
              </div>
            )}
          </div>

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

          {/* Direct Event Assets */}
          {directEventAssets.length > 0 && (
            <div className="rounded-lg border p-6 bg-blue-50/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Direct Event Assets ({directEventAssets.length})</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Assets assigned directly to this event (not through a session)
              </p>
              <div className="space-y-2">
                {directEventAssets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="block p-3 rounded border hover:bg-muted/50 bg-white"
                  >
                    <div className="font-medium">{asset.title || asset.name || "Untitled"}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.assetType || "Unknown type"} • {asset.duration || "No duration"}
                    </div>
                    {asset.catalogingStatus && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {asset.catalogingStatus}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assets from Sessions */}
          {sessionAssets.length > 0 && (
            <div className="rounded-lg border p-6 bg-green-50/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Session Assets ({sessionAssets.length})</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Assets assigned to sessions within this event
              </p>
              <div className="space-y-2">
                {sessionAssets.map((asset) => {
                  const session = eventSessions.find(s => s.id === asset.sessionId);
                  return (
                    <Link
                      key={asset.id}
                      href={`/assets/${asset.id}`}
                      className="block p-3 rounded border hover:bg-muted/50 bg-white"
                    >
                      <div className="font-medium">{asset.title || asset.name || "Untitled"}</div>
                      <div className="text-sm text-muted-foreground">
                        {asset.assetType || "Unknown type"} • {asset.duration || "No duration"}
                        {session && (
                          <span className="ml-2 text-xs">
                            (Session: {session.sessionName})
                          </span>
                        )}
                      </div>
                      {asset.catalogingStatus && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {asset.catalogingStatus}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* No assets message */}
          {directEventAssets.length === 0 && sessionAssets.length === 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Assets</h2>
              <p className="text-sm text-muted-foreground">No assets assigned to this event yet.</p>
            </div>
          )}
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
                <dt className="text-sm font-medium text-muted-foreground">Total Asset Count</dt>
                <dd className="text-sm mt-1">
                  {totalAssetCount}
                  {(directEventAssets.length > 0 || sessionAssets.length > 0) && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({directEventAssets.length} direct + {sessionAssets.length} via sessions)
                    </span>
                  )}
                </dd>
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
