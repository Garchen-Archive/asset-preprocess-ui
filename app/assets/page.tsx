import { db } from "@/lib/db/client";
import { archiveAssets, events, sessions } from "@/lib/db/schema";
import { desc, sql, ilike, or, eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssetsPageClient } from "@/components/assets-page-client";
import { Pagination } from "@/components/pagination";

export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    status?: string;
    type?: string;
    source?: string;
    isMediaFile?: string;
    safeToDelete?: string;
    exclude?: string;
    formats?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  };
}) {
  const search = searchParams.search || "";
  const statusFilter = searchParams.status || "";
  const typeFilter = searchParams.type || "";
  const sourceFilter = searchParams.source || "";
  const isMediaFileFilter = searchParams.isMediaFile || "";
  const safeToDeleteFilter = searchParams.safeToDelete || "";
  const excludeFilter = searchParams.exclude || "";
  const formatsFilterRaw = searchParams.formats || "";
  // Handle both string (single format) and array (multiple formats) from URL params
  const selectedFormats = Array.isArray(formatsFilterRaw)
    ? formatsFilterRaw
    : formatsFilterRaw ? formatsFilterRaw.split(',') : [];
  // Normalize to string for URL params
  const formatsFilter = selectedFormats.length > 0 ? selectedFormats.join(',') : "";
  const sortBy = searchParams.sortBy || "createdAt";
  const sortOrder = searchParams.sortOrder || "desc";
  const page = parseInt(searchParams.page || "1");
  const perPage = 50;
  const offset = (page - 1) * perPage;

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(archiveAssets.name, `%${search}%`),
        ilike(archiveAssets.title, `%${search}%`),
        ilike(archiveAssets.filepath, `%${search}%`)
      )
    );
  }

  if (statusFilter) {
    if (statusFilter === "null") {
      conditions.push(sql`${archiveAssets.catalogingStatus} IS NULL`);
    } else {
      conditions.push(eq(archiveAssets.catalogingStatus, statusFilter));
    }
  }

  if (typeFilter) {
    conditions.push(eq(archiveAssets.assetType, typeFilter));
  }

  if (sourceFilter) {
    conditions.push(eq(archiveAssets.metadataSource, sourceFilter));
  }

  if (isMediaFileFilter) {
    if (isMediaFileFilter === "true") {
      conditions.push(eq(archiveAssets.isMediaFile, true));
    } else if (isMediaFileFilter === "false") {
      conditions.push(eq(archiveAssets.isMediaFile, false));
    }
  }

  if (safeToDeleteFilter) {
    if (safeToDeleteFilter === "true") {
      conditions.push(eq(archiveAssets.safeToDeleteFromGdrive, true));
    } else if (safeToDeleteFilter === "false") {
      conditions.push(eq(archiveAssets.safeToDeleteFromGdrive, false));
    }
  }

  if (excludeFilter) {
    if (excludeFilter === "true") {
      conditions.push(eq(archiveAssets.exclude, true));
    } else if (excludeFilter === "false") {
      conditions.push(eq(archiveAssets.exclude, false));
    }
  }

  if (selectedFormats.length > 0) {
    conditions.push(
      or(...selectedFormats.map(format => eq(archiveAssets.fileFormat, format)))
    );
  }

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(archiveAssets)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const totalPages = Math.ceil(count / perPage);

  // Determine sort column and direction
  const sortColumn = {
    name: archiveAssets.name,
    title: archiveAssets.title,
    duration: archiveAssets.duration,
    fileSizeMb: archiveAssets.fileSizeMb,
    createdDate: archiveAssets.createdDate,
    createdAt: archiveAssets.createdAt,
    updatedAt: archiveAssets.updatedAt,
    deletedAt: archiveAssets.deletedAt,
    lastHarvestedAt: archiveAssets.lastHarvestedAt,
  }[sortBy] || archiveAssets.createdAt;

  const orderByClause = sortOrder === "asc" ? sortColumn : desc(sortColumn);

  // Get assets with filters and pagination
  const assets = await db
    .select()
    .from(archiveAssets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(orderByClause)
    .limit(perPage)
    .offset(offset);

  // Fetch all events for bulk assignment dropdown
  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));

  // Fetch all sessions with their event info for bulk assignment dropdown
  const sessionsList = await db
    .select({
      session: sessions,
      event: events,
    })
    .from(sessions)
    .leftJoin(events, eq(sessions.eventId, events.id))
    .orderBy(asc(sessions.sessionName));

  // Get available file formats dynamically
  const availableFormats = await db
    .selectDistinct({ format: archiveAssets.fileFormat })
    .from(archiveAssets)
    .where(sql`${archiveAssets.fileFormat} IS NOT NULL`)
    .orderBy(archiveAssets.fileFormat)
    .then(results => results.map(r => r.format).filter(Boolean) as string[]);

  // Get statistics for counters (only when no filters applied)
  const showStats = !search && !statusFilter && !typeFilter && !sourceFilter && !isMediaFileFilter && !safeToDeleteFilter && !excludeFilter && selectedFormats.length === 0;
  let stats = null;

  if (showStats) {
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(archiveAssets);

    const [readyCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(archiveAssets)
      .where(eq(archiveAssets.catalogingStatus, "Ready"));

    const [inProgressCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(archiveAssets)
      .where(eq(archiveAssets.catalogingStatus, "In Progress"));

    const [notStartedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(archiveAssets)
      .where(sql`${archiveAssets.catalogingStatus} IS NULL OR ${archiveAssets.catalogingStatus} = 'Not Started'`);

    const [videoCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(archiveAssets)
      .where(eq(archiveAssets.assetType, "video"));

    const [audioCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(archiveAssets)
      .where(eq(archiveAssets.assetType, "audio"));

    stats = {
      total: totalCount.count,
      ready: readyCount.count,
      inProgress: inProgressCount.count,
      notStarted: notStartedCount.count,
      video: videoCount.count,
      audio: audioCount.count,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Archive Assets</h1>
          <p className="text-muted-foreground">
            Manage your video, audio, and document archive
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Assets</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-sm text-muted-foreground">Ready</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
            <div className="text-sm text-muted-foreground">Not Started</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.video}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.audio}</div>
            <div className="text-sm text-muted-foreground">Audio</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <form className="rounded-lg border p-4" method="GET">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              name="search"
              placeholder="Search by filename or title..."
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
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          </div>

          <div>
            <select
              name="source"
              defaultValue={sourceFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Sources</option>
              <option value="gdrive">Google Drive</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>

          <div>
            <select
              name="isMediaFile"
              defaultValue={isMediaFileFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Files</option>
              <option value="true">Media Files</option>
              <option value="false">Non-Media Files</option>
            </select>
          </div>

          <div>
            <select
              name="safeToDelete"
              defaultValue={safeToDeleteFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All (Safe to Delete)</option>
              <option value="true">Safe to Delete</option>
              <option value="false">Keep</option>
            </select>
          </div>

          <div>
            <select
              name="exclude"
              defaultValue={excludeFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All (Exclude from Archive)</option>
              <option value="true">Exclude from Archive</option>
              <option value="false">Include in Archive</option>
            </select>
          </div>
        </div>

        {/* File Format Checkboxes */}
        <div className="mt-4">
          <label className="text-sm font-medium mb-2 block">
            File Formats:
            {selectedFormats.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({selectedFormats.length} selected)
              </span>
            )}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableFormats.map((format) => (
              <label key={format} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  name="formats"
                  value={format}
                  defaultChecked={selectedFormats.includes(format)}
                  className="rounded border-gray-300"
                />
                <span className="uppercase">{format}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit">Apply Filters</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/assets">Clear</Link>
          </Button>
        </div>
      </form>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {offset + 1}-{Math.min(offset + perPage, count)} of {count} assets
        {search && ` matching "${search}"`}
      </div>

      {/* Assets Table with Bulk Actions */}
      <AssetsPageClient
        assets={assets}
        events={eventsList}
        sessions={sessionsList}
        offset={offset}
        sortBy={sortBy}
        sortOrder={sortOrder}
        searchParams={{
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
          ...(sourceFilter && { source: sourceFilter }),
          ...(isMediaFileFilter && { isMediaFile: isMediaFileFilter }),
          ...(safeToDeleteFilter && { safeToDelete: safeToDeleteFilter }),
          ...(excludeFilter && { exclude: excludeFilter }),
          ...(formatsFilter && { formats: formatsFilter }),
        }}
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/assets"
        searchParams={{
          ...(search && { search }),
          ...(statusFilter && { status: statusFilter }),
          ...(typeFilter && { type: typeFilter }),
          ...(sourceFilter && { source: sourceFilter }),
          ...(isMediaFileFilter && { isMediaFile: isMediaFileFilter }),
          ...(safeToDeleteFilter && { safeToDelete: safeToDeleteFilter }),
          ...(excludeFilter && { exclude: excludeFilter }),
          ...(formatsFilter && { formats: formatsFilter }),
        }}
      />
    </div>
  );
}
