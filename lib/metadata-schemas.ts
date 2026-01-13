/**
 * Type-safe schemas for additional_metadata JSONB field
 *
 * The additional_metadata field stores source-specific metadata:
 * - GDrive metadata (used for both Google Drive API and local files)
 * - YouTube metadata
 * - Common metadata (teaching_segments, etc.)
 */

import { z } from "zod";

// Teaching segment schema (common across all sources)
export const TeachingSegmentSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Must be in HH:MM:SS format"),
  end: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Must be in HH:MM:SS format"),
});

export type TeachingSegment = z.infer<typeof TeachingSegmentSchema>;

// GDrive-specific metadata
export const GDriveMetadataSchema = z.object({
  // Add GDrive-specific fields here as needed
  // Examples: permissions, sharing settings, folder path, etc.
}).passthrough(); // Allow additional fields for future expansion

export type GDriveMetadata = z.infer<typeof GDriveMetadataSchema>;

// YouTube-specific metadata
export const YouTubeMetadataSchema = z.object({
  // Add YouTube-specific fields here as needed
  // Examples: channel info, playlist membership, etc.
}).passthrough(); // Allow additional fields for future expansion

export type YouTubeMetadata = z.infer<typeof YouTubeMetadataSchema>;

// Root additional_metadata schema
export const AdditionalMetadataSchema = z.object({
  // Teaching segments (common field used across sources)
  teaching_segments: z.array(TeachingSegmentSchema).optional(),

  // Source-specific metadata
  gdrive: GDriveMetadataSchema.optional(),
  youtube: YouTubeMetadataSchema.optional(),
}).passthrough(); // Allow additional fields for future expansion

export type AdditionalMetadata = z.infer<typeof AdditionalMetadataSchema>;

/**
 * Helper function to safely parse additional_metadata from database
 */
export function parseAdditionalMetadata(raw: unknown): AdditionalMetadata | null {
  try {
    return AdditionalMetadataSchema.parse(raw);
  } catch (error) {
    console.error("Failed to parse additional_metadata:", error);
    return null;
  }
}

/**
 * Helper function to extract teaching segments
 */
export function getTeachingSegments(metadata: unknown): TeachingSegment[] {
  const parsed = parseAdditionalMetadata(metadata);
  return parsed?.teaching_segments || [];
}
