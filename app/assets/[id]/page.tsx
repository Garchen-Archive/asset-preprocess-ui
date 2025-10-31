import { db } from "@/lib/db/client";
import { archiveAssets, sessions, events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { DeleteAssetButton } from "@/components/delete-asset-button";

export const dynamic = "force-dynamic";

export default async function AssetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [assetData] = await db
    .select({
      asset: archiveAssets,
      session: sessions,
      event: events,
    })
    .from(archiveAssets)
    .leftJoin(sessions, eq(archiveAssets.sessionId, sessions.id))
    .leftJoin(events, eq(sessions.eventId, events.id))
    .where(eq(archiveAssets.id, params.id))
    .limit(1);

  if (!assetData) {
    notFound();
  }

  const { asset: data, session, event } = assetData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/assets"
            className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
          >
            ← Back to Assets
          </Link>
          <h1 className="text-3xl font-bold">{data.title || data.name || "Untitled Asset"}</h1>
          <p className="text-muted-foreground">{data.name}</p>
        </div>
        <Button asChild>
          <Link href={`/assets/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Section */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Identity</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Filename</dt>
                <dd className="text-sm mt-1">{data.name || "—"}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">File Path</dt>
                <dd className="text-sm mt-1 break-all">{data.filepath || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Asset Type</dt>
                <dd className="text-sm mt-1">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                    {data.assetType || "unknown"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Media File</dt>
                <dd className="text-sm mt-1">{data.isMediaFile ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">File Size</dt>
                <dd className="text-sm mt-1">
                  {data.fileSizeMb ? `${data.fileSizeMb.toFixed(2)} MB` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                <dd className="text-sm mt-1">{data.duration || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Content Section */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Content</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Title</dt>
                <dd className="text-sm mt-1">{data.title || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                <dd className="text-sm mt-1">{data.category || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="text-sm mt-1">{data.descriptionSummary || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Additional Topics</dt>
                <dd className="text-sm mt-1">{data.additionalTopics || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Translation Section */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Translation</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Has Oral Translation</dt>
                <dd className="text-sm mt-1">{data.hasOralTranslation ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Languages</dt>
                <dd className="text-sm mt-1">
                  {data.oralTranslationLanguages?.join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Interpreter</dt>
                <dd className="text-sm mt-1">{data.interpreterName || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Has Subtitles</dt>
                <dd className="text-sm mt-1">{data.hasSubtitleFiles ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>

          {/* Technical Metadata */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Technical Metadata</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Resolution</dt>
                <dd className="text-sm mt-1">{data.resolution || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Frame Rate</dt>
                <dd className="text-sm mt-1">{data.frameRate ? `${data.frameRate} fps` : "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Video Codec</dt>
                <dd className="text-sm mt-1">{data.videoCodec || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Audio Codec</dt>
                <dd className="text-sm mt-1">{data.audioCodec || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Audio Channels</dt>
                <dd className="text-sm mt-1">{data.audioChannels || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sample Rate</dt>
                <dd className="text-sm mt-1">{data.sampleRate ? `${data.sampleRate} Hz` : "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Bitrate</dt>
                <dd className="text-sm mt-1">{data.bitrate || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">File Format</dt>
                <dd className="text-sm mt-1">{data.fileFormat || "—"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Administrative */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Administrative</h2>
            <dl className="space-y-4">
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
                <dt className="text-sm font-medium text-muted-foreground">Session</dt>
                <dd className="text-sm mt-1">
                  {session ? (
                    <Link href={`/sessions/${session.id}`} className="text-blue-600 hover:underline">
                      {session.sessionName}
                    </Link>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="text-sm mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      data.catalogingStatus === "Ready"
                        ? "bg-green-100 text-green-700"
                        : data.catalogingStatus === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {data.catalogingStatus || "Not Started"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cataloged By</dt>
                <dd className="text-sm mt-1">{data.catalogedBy || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cataloging Date</dt>
                <dd className="text-sm mt-1">
                  {data.catalogingDate
                    ? new Date(data.catalogingDate).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Backed Up Locally</dt>
                <dd className="text-sm mt-1">{data.backedUpLocally ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Safe to Delete from GDrive</dt>
                <dd className="text-sm mt-1">
                  {data.safeToDeleteFromGdrive ? (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                      Yes - Safe to Delete
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                      No - Keep
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Contributor</dt>
                <dd className="text-sm mt-1">{data.contributorOrg || "—"}</dd>
              </div>
            </dl>
          </div>

          {/* Links */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Links</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Google Drive</dt>
                <dd className="text-sm mt-1">
                  {data.gdriveUrl && data.gdriveUrl.includes('drive.google.com') ? (
                    <a
                      href={data.gdriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Open in Drive
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">YouTube</dt>
                <dd className="text-sm mt-1">
                  {data.youtubeLink || (data.gdriveUrl && (data.gdriveUrl.includes('youtube.com') || data.gdriveUrl.includes('youtu.be'))) ? (
                    <a
                      href={data.youtubeLink || data.gdriveUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Watch on YouTube
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Source</dt>
                <dd className="text-sm mt-1 capitalize">{data.metadataSource}</dd>
              </div>
            </dl>
          </div>

          {/* System Metadata */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">System Metadata</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                <dd className="text-sm mt-1">
                  {data.createdAt
                    ? new Date(data.createdAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm mt-1">
                  {data.updatedAt
                    ? new Date(data.updatedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Source Last Updated</dt>
                <dd className="text-sm mt-1">
                  {data.sourceUpdatedAt
                    ? new Date(data.sourceUpdatedAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quality */}
          {(data.audioQualityIssues || data.videoQualityIssues || data.needsEditing) && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Quality Notes</h2>
              <dl className="space-y-4">
                {data.needsEditing && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Needs Editing</dt>
                    <dd className="text-sm mt-1">Yes</dd>
                  </div>
                )}
                {data.audioQualityIssues && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Audio Issues</dt>
                    <dd className="text-sm mt-1">{data.audioQualityIssues}</dd>
                  </div>
                )}
                {data.videoQualityIssues && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Video Issues</dt>
                    <dd className="text-sm mt-1">{data.videoQualityIssues}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Notes */}
          {data.notes && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-sm">{data.notes}</p>
            </div>
          )}

          {/* Additional Metadata */}
          <div className="rounded-lg border p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-semibold">Additional Metadata</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  JSON field for storing flexible data like original filename, alternative titles, custom tags, etc.
                </p>
              </div>
            </div>
            {data.additionalMetadata && Object.keys(data.additionalMetadata).length > 0 ? (
              <div className="bg-muted/50 rounded p-3 mt-3">
                <pre className="text-xs overflow-x-auto font-mono">
                  {JSON.stringify(data.additionalMetadata, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-muted/30 rounded p-4 mt-3 border border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  No additional metadata stored
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Use the Edit page to add custom metadata fields
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t pt-6">
        <div className="rounded-lg border border-destructive/50 p-6">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting this asset will permanently remove it from the database. This action cannot be undone.
          </p>
          <DeleteAssetButton id={params.id} />
        </div>
      </div>
    </div>
  );
}
