import { db } from "@/lib/db/client";
import { sessions, archiveAssets, events, topics, categories, sessionTopics, sessionCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { deleteSession } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [sessionData] = await db
    .select({
      session: sessions,
      event: events,
    })
    .from(sessions)
    .leftJoin(events, eq(sessions.eventId, events.id))
    .where(eq(sessions.id, params.id))
    .limit(1);

  if (!sessionData) {
    notFound();
  }

  const { session, event } = sessionData;

  // Get assets in this session
  const sessionAssets = await db
    .select()
    .from(archiveAssets)
    .where(eq(archiveAssets.sessionId, params.id));

  // Get topics for this session
  const sessionTopicsList = await db
    .select({
      id: topics.id,
      name: topics.name,
    })
    .from(sessionTopics)
    .innerJoin(topics, eq(sessionTopics.topicId, topics.id))
    .where(eq(sessionTopics.sessionId, params.id));

  // Get categories for this session
  const sessionCategoriesList = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(sessionCategories)
    .innerJoin(categories, eq(sessionCategories.categoryId, categories.id))
    .where(eq(sessionCategories.sessionId, params.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/sessions"
            className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
          >
            ← Back to Sessions
          </Link>
          <h1 className="text-3xl font-bold">{session.sessionName}</h1>
          <p className="text-muted-foreground font-mono">{session.sessionId}</p>
        </div>
        <Button asChild>
          <Link href={`/sessions/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Session Details */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Event</dt>
                <dd className="text-sm mt-1">
                  {event ? (
                    <Link href={`/events/${event.id}`} className="text-blue-600 hover:underline">
                      {event.eventName}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Session Date</dt>
                <dd className="text-sm mt-1">{session.sessionDate || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Session Time</dt>
                <dd className="text-sm mt-1">{session.sessionTime || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Start Time</dt>
                <dd className="text-sm mt-1">{session.sessionStartTime || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">End Time</dt>
                <dd className="text-sm mt-1">{session.sessionEndTime || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Duration (Estimated)</dt>
                <dd className="text-sm mt-1">{session.durationEstimated || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sequence in Event</dt>
                <dd className="text-sm mt-1">{session.sequenceInEvent || "—"}</dd>
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
                  {sessionCategoriesList.length > 0 ? (
                    sessionCategoriesList.map((cat) => (
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
                  {sessionTopicsList.length > 0 ? (
                    sessionTopicsList.map((topic) => (
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
            {session.sessionDescription && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="text-sm mt-1">{session.sessionDescription}</dd>
              </div>
            )}
          </div>

          {/* Assets in this Session */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assets ({sessionAssets.length})</h2>
            </div>
            {sessionAssets.length > 0 ? (
              <div className="space-y-2">
                {sessionAssets.map((asset) => (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}`}
                    className="block p-3 rounded border hover:bg-muted/50"
                  >
                    <div className="font-medium">{asset.title || asset.name || "Untitled"}</div>
                    <div className="text-sm text-muted-foreground">
                      {asset.assetType || "Unknown type"} • {asset.duration || "No duration"}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assets yet.</p>
            )}
          </div>
        </div>

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
                      session.catalogingStatus === "Ready"
                        ? "bg-green-100 text-green-700"
                        : session.catalogingStatus === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {session.catalogingStatus || "Not Started"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Has Assets</dt>
                <dd className="text-sm mt-1">{session.hasAssets ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Asset Count</dt>
                <dd className="text-sm mt-1">{session.assetCount}</dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-sm">{session.notes}</p>
            </div>
          )}

          {/* Additional Metadata */}
          {session.additionalMetadata && Object.keys(session.additionalMetadata).length > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Metadata</h2>
              <div className="bg-muted/50 rounded p-3">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(session.additionalMetadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/50 p-6">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this session cannot be undone.
            </p>
            <form action={deleteSession.bind(null, params.id)}>
              <Button type="submit" variant="destructive" size="sm">
                Delete Session
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
