"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnVisibilityToggle, type ColumnConfig } from "./column-visibility-toggle";

type Asset = {
  id: string;
  name: string | null;
  filepath: string | null;
  title: string | null;
  assetType: string | null;
  catalogingStatus: string | null;
  metadataSource: string | null;
  duration: string | null;
  fileSizeMb: number | null;
  category: string | null;
  hasOralTranslation: boolean | null;
  interpreterName: string | null;
  gdriveUrl: string | null;
  youtubeLink: string | null;
  resolution: string | null;
  videoCodec: string | null;
  audioCodec: string | null;
  frameRate: string | null;
  audioChannels: string | null;
  fileFormat: string | null;
  bitrate: string | null;
  sampleRate: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  sourceUpdatedAt: Date | null;
};

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: "filename", label: "Filename", visible: true },
  { key: "title", label: "Title", visible: true },
  { key: "type", label: "Type", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "source", label: "Source", visible: true },
  { key: "duration", label: "Duration", visible: false },
  { key: "fileSize", label: "File Size", visible: false },
  { key: "category", label: "Category", visible: false },
  { key: "hasTranslation", label: "Has Translation", visible: false },
  { key: "interpreter", label: "Interpreter", visible: false },
  { key: "resolution", label: "Resolution", visible: false },
  { key: "videoCodec", label: "Video Codec", visible: false },
  { key: "audioCodec", label: "Audio Codec", visible: false },
  { key: "frameRate", label: "Frame Rate", visible: false },
  { key: "audioChannels", label: "Audio Channels", visible: false },
  { key: "fileFormat", label: "File Format", visible: false },
  { key: "bitrate", label: "Bitrate", visible: false },
  { key: "sampleRate", label: "Sample Rate", visible: false },
  { key: "createdAt", label: "Created At", visible: false },
  { key: "updatedAt", label: "Updated At", visible: false },
  { key: "sourceUpdatedAt", label: "Source Updated", visible: false },
];

type AssetsTableProps = {
  assets: Asset[];
  offset: number;
};

export function AssetsTable({ assets, offset }: AssetsTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  const isColumnVisible = (key: string) => {
    const column = columns.find((col) => col.key === key);
    return column?.visible ?? false;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ColumnVisibilityToggle
          columns={columns}
          onChange={setColumns}
          storageKey="assets-table-columns"
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium w-16">#</th>
              {isColumnVisible("filename") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Filename</th>
              )}
              {isColumnVisible("title") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              )}
              {isColumnVisible("type") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              )}
              {isColumnVisible("status") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              )}
              {isColumnVisible("source") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
              )}
              {isColumnVisible("duration") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
              )}
              {isColumnVisible("fileSize") && (
                <th className="px-4 py-3 text-left text-sm font-medium">File Size</th>
              )}
              {isColumnVisible("category") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              )}
              {isColumnVisible("hasTranslation") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Has Translation</th>
              )}
              {isColumnVisible("interpreter") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Interpreter</th>
              )}
              {isColumnVisible("resolution") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Resolution</th>
              )}
              {isColumnVisible("videoCodec") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Video Codec</th>
              )}
              {isColumnVisible("audioCodec") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Audio Codec</th>
              )}
              {isColumnVisible("frameRate") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Frame Rate</th>
              )}
              {isColumnVisible("audioChannels") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Audio Channels</th>
              )}
              {isColumnVisible("fileFormat") && (
                <th className="px-4 py-3 text-left text-sm font-medium">File Format</th>
              )}
              {isColumnVisible("bitrate") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Bitrate</th>
              )}
              {isColumnVisible("sampleRate") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Sample Rate</th>
              )}
              {isColumnVisible("createdAt") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Created At</th>
              )}
              {isColumnVisible("updatedAt") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Updated At</th>
              )}
              {isColumnVisible("sourceUpdatedAt") && (
                <th className="px-4 py-3 text-left text-sm font-medium">Source Updated</th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {offset + index + 1}
                </td>
                {isColumnVisible("filename") && (
                  <td className="px-4 py-3 text-sm">
                    {asset.name || asset.filepath || "—"}
                  </td>
                )}
                {isColumnVisible("title") && (
                  <td className="px-4 py-3 text-sm">{asset.title || "—"}</td>
                )}
                {isColumnVisible("type") && (
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                      {asset.assetType || "unknown"}
                    </span>
                  </td>
                )}
                {isColumnVisible("status") && (
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        asset.catalogingStatus === "Ready"
                          ? "bg-green-100 text-green-700"
                          : asset.catalogingStatus === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {asset.catalogingStatus || "Not Started"}
                    </span>
                  </td>
                )}
                {isColumnVisible("source") && (
                  <td className="px-4 py-3 text-sm capitalize">
                    {asset.metadataSource}
                  </td>
                )}
                {isColumnVisible("duration") && (
                  <td className="px-4 py-3 text-sm">{asset.duration || "—"}</td>
                )}
                {isColumnVisible("fileSize") && (
                  <td className="px-4 py-3 text-sm">
                    {asset.fileSizeMb ? `${asset.fileSizeMb.toFixed(2)} MB` : "—"}
                  </td>
                )}
                {isColumnVisible("category") && (
                  <td className="px-4 py-3 text-sm">{asset.category || "—"}</td>
                )}
                {isColumnVisible("hasTranslation") && (
                  <td className="px-4 py-3 text-sm">
                    {asset.hasOralTranslation ? "Yes" : "No"}
                  </td>
                )}
                {isColumnVisible("interpreter") && (
                  <td className="px-4 py-3 text-sm">{asset.interpreterName || "—"}</td>
                )}
                {isColumnVisible("resolution") && (
                  <td className="px-4 py-3 text-sm">{asset.resolution || "—"}</td>
                )}
                {isColumnVisible("videoCodec") && (
                  <td className="px-4 py-3 text-sm">{asset.videoCodec || "—"}</td>
                )}
                {isColumnVisible("audioCodec") && (
                  <td className="px-4 py-3 text-sm">{asset.audioCodec || "—"}</td>
                )}
                {isColumnVisible("frameRate") && (
                  <td className="px-4 py-3 text-sm">{asset.frameRate ? `${asset.frameRate} fps` : "—"}</td>
                )}
                {isColumnVisible("audioChannels") && (
                  <td className="px-4 py-3 text-sm">{asset.audioChannels || "—"}</td>
                )}
                {isColumnVisible("fileFormat") && (
                  <td className="px-4 py-3 text-sm">{asset.fileFormat || "—"}</td>
                )}
                {isColumnVisible("bitrate") && (
                  <td className="px-4 py-3 text-sm">{asset.bitrate || "—"}</td>
                )}
                {isColumnVisible("sampleRate") && (
                  <td className="px-4 py-3 text-sm">{asset.sampleRate ? `${asset.sampleRate} Hz` : "—"}</td>
                )}
                {isColumnVisible("createdAt") && (
                  <td className="px-4 py-3 text-sm">
                    {asset.createdAt
                      ? new Date(asset.createdAt).toLocaleString()
                      : "—"}
                  </td>
                )}
                {isColumnVisible("updatedAt") && (
                  <td className="px-4 py-3 text-sm">
                    {asset.updatedAt
                      ? new Date(asset.updatedAt).toLocaleString()
                      : "—"}
                  </td>
                )}
                {isColumnVisible("sourceUpdatedAt") && (
                  <td className="px-4 py-3 text-sm">
                    {asset.sourceUpdatedAt
                      ? new Date(asset.sourceUpdatedAt).toLocaleString()
                      : "—"}
                  </td>
                )}
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/assets/${asset.id}`}
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

      {assets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No assets found matching your criteria.
        </div>
      )}
    </div>
  );
}
