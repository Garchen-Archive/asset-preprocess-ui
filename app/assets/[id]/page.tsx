import { db } from "@/lib/db/client";
import { archiveAssets, sessions, events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
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

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Events", href: "/events" },
  ];

  if (event) {
    breadcrumbItems.push({
      label: event.eventName,
      href: `/events/${event.id}`,
    });
  }

  if (session) {
    breadcrumbItems.push({
      label: session.sessionName,
      href: `/sessions/${session.id}`,
    });
  }

  breadcrumbItems.push({ label: data.title || data.name || "Untitled Asset" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              {(data.youtubeLink || (data.gdriveUrl && (data.gdriveUrl.includes('youtube.com') || data.gdriveUrl.includes('youtu.be')))) && (
                <a
                  href={data.youtubeLink || data.gdriveUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Watch on YouTube"
                  className="text-red-600 hover:opacity-75 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {data.gdriveUrl && data.gdriveUrl.includes('drive.google.com') && (
                <a
                  href={data.gdriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Google Drive"
                  className="hover:opacity-75 transition-opacity"
                >
                  <svg className="w-6 h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </a>
              )}
            </div>
            <h1 className="text-3xl font-bold">{data.title || data.name || "Untitled Asset"}</h1>
          </div>
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
                  {(data.assetType === 'youtube' || data.youtubeLink || (data.gdriveUrl && (data.gdriveUrl.includes('youtube.com') || data.gdriveUrl.includes('youtu.be')))) ? (
                    <span className="text-muted-foreground/50">N/A (YouTube video)</span>
                  ) : data.safeToDeleteFromGdrive ? (
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
                <dt className="text-sm font-medium text-muted-foreground">Remove File</dt>
                <dd className="text-sm mt-1">{data.removeFile ? "Yes" : "No"}</dd>
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
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                      </svg>
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
                      className="text-red-600 hover:underline inline-flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
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
                <dt className="text-sm font-medium text-muted-foreground">Asset Created Date</dt>
                <dd className="text-sm mt-1">
                  {data.createdDate
                    ? new Date(data.createdDate).toLocaleString()
                    : "—"}
                </dd>
              </div>
            </dl>

            {/* Database Timestamps */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium text-muted-foreground/70 mb-3">Database Timestamps</h3>
              <dl className="space-y-3 opacity-60">
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Record Created</dt>
                  <dd className="text-xs mt-1">
                    {data.createdAt
                      ? new Date(data.createdAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Record Updated</dt>
                  <dd className="text-xs mt-1">
                    {data.updatedAt
                      ? new Date(data.updatedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">Source Last Updated</dt>
                  <dd className="text-xs mt-1">
                    {data.sourceUpdatedAt
                      ? new Date(data.sourceUpdatedAt).toLocaleString()
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
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
