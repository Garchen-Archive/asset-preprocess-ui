import { pgTable, uuid, text, boolean, integer, real, timestamp, date, time, jsonb } from "drizzle-orm/pg-core";

export const archiveAssets = pgTable("archive_assets", {
  // Primary key and source tracking
  id: uuid("id").defaultRandom().primaryKey(),
  metadataSource: text("metadata_source").notNull(),

  // 1. IDENTITY
  name: text("name"),
  filepath: text("filepath"),
  isMediaFile: boolean("is_media_file"),
  assetType: text("asset_type"),
  assetVersion: text("asset_version"),
  relatedAssetIds: jsonb("related_asset_ids").$type<string[]>(),
  fileSizeBytes: integer("file_size_bytes"),
  fileSizeMb: real("file_size_mb"),
  duration: text("duration"),

  // 2. CONTENT
  title: text("title"),
  originalDate: timestamp("original_date"),
  category: text("category"),
  descriptionSummary: text("description_summary"),
  additionalTopics: text("additional_topics"),

  // 3. TRANSLATION
  hasOralTranslation: boolean("has_oral_translation"),
  oralTranslationLanguages: jsonb("oral_translation_languages").$type<string[]>(),
  interpreterName: text("interpreter_name"),
  hasTibetanTranscription: boolean("has_tibetan_transcription"),
  hasWrittenTranslation: boolean("has_written_translation"),
  hasSubtitleFiles: boolean("has_subtitle_files"),

  // 4. QUALITY/EDITORIAL
  overallQuality: text("overall_quality"),
  audioQualityIssues: text("audio_quality_issues"),
  videoQualityIssues: text("video_quality_issues"),
  needsEditing: boolean("needs_editing"),
  teachingStart1: timestamp("teaching_start_1"),
  teachingEnd1: timestamp("teaching_end_1"),
  teachingStart2: timestamp("teaching_start_2"),
  teachingEnd2: timestamp("teaching_end_2"),

  // 5. ADMINISTRATIVE
  sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "set null" }),
  catalogingStatus: text("cataloging_status"),
  catalogedBy: text("cataloged_by"),
  catalogingDate: date("cataloging_date", { mode: "string" }),
  removeFile: boolean("remove_file"),
  backedUpLocally: boolean("backed_up_locally"),
  safeToDeleteFromGdrive: boolean("safe_to_delete_from_gdrive"),
  notes: text("notes"),
  contributorOrg: text("contributor_org"),

  // 6. LINKS
  youtubeLink: text("youtube_link"),
  youtubeId: text("youtube_id"),
  gdriveUrl: text("gdrive_url"),
  gdriveId: text("gdrive_id"),
  muxAssetId: text("mux_asset_id"),

  // 7. TECHNICAL METADATA
  createdDate: timestamp("created_date"),
  modifiedDate: timestamp("modified_date"),
  resolution: text("resolution"),
  videoCodec: text("video_codec"),
  audioCodec: text("audio_codec"),
  bitrate: text("bitrate"),
  sampleRate: text("sample_rate"),
  frameRate: text("frame_rate"),
  audioChannels: text("audio_channels"),
  fileFormat: text("file_format"),
  codec: text("codec"), // Legacy

  // YouTube-specific
  viewCount: integer("view_count"),
  likeCount: integer("like_count"),
  commentCount: integer("comment_count"),
  tags: jsonb("tags").$type<string[]>(),
  categoryId: text("category_id"),
  defaultLanguage: text("default_language"),
  privacyStatus: text("privacy_status"),
  uploadStatus: text("upload_status"),
  thumbnailUrl: text("thumbnail_url"),

  // System metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  sourceUpdatedAt: timestamp("source_updated_at"),
  sheetUpdatedAt: timestamp("sheet_updated_at"),

  // Additional metadata (flexible JSON storage)
  additionalMetadata: jsonb("additional_metadata").$type<Record<string, any>>(),
});

export type ArchiveAsset = typeof archiveAssets.$inferSelect;
export type NewArchiveAsset = typeof archiveAssets.$inferInsert;

// Events table
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: text("event_id").notNull().unique(),
  eventName: text("event_name").notNull(),
  eventDateStart: date("event_date_start", { mode: "string" }),
  eventDateEnd: date("event_date_end", { mode: "string" }),
  eventType: text("event_type"),
  parentEventId: uuid("parent_event_id").references((): any => events.id, { onDelete: "set null" }), // Self-referential
  category: text("category"), // Comma-delimited categories
  topic: text("topic"), // Comma-delimited topics
  centerName: text("center_name"),
  city: text("city"),
  stateProvince: text("state_province"),
  country: text("country"),
  eventDescription: text("event_description"),
  totalDuration: text("total_duration"),
  catalogingStatus: text("cataloging_status"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),

  // Additional metadata (flexible JSON storage)
  additionalMetadata: jsonb("additional_metadata").$type<Record<string, any>>(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// Sessions table (series layer removed - sessions now directly reference events)
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }), // Changed from series_id to event_id
  sessionName: text("session_name").notNull(),
  sessionDate: date("session_date", { mode: "string" }),
  sessionTime: text("session_time"), // Time of day: morning, afternoon, evening, night
  sessionStartTime: time("session_start_time"), // New field
  sessionEndTime: time("session_end_time"), // New field
  sequenceInEvent: integer("sequence_in_event"),
  topic: text("topic"), // Renamed from primary_topic
  category: text("category"),
  sessionDescription: text("session_description"),
  durationEstimated: text("duration_estimated"),
  assetCount: integer("asset_count").default(0),
  hasAssets: boolean("has_assets").default(false),
  catalogingStatus: text("cataloging_status"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),

  // Additional metadata (flexible JSON storage)
  additionalMetadata: jsonb("additional_metadata").$type<Record<string, any>>(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Users table - compatible with NextAuth and OAuth providers (Auth0, Google, etc.)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(), // Email used for OAuth providers
  emailVerified: timestamp("email_verified"),
  image: text("image"), // Profile image from OAuth providers
  role: text("role").notNull().default("editor"), // admin, editor, viewer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Accounts table - for OAuth providers (Auth0, Google, GitHub, etc.)
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // oauth, email, credentials
  provider: text("provider").notNull(), // auth0, google, github, credentials
  providerAccountId: text("provider_account_id").notNull(), // ID from the provider
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

// Credentials table - for local username/password authentication
// Separate from users table for security and flexibility
export const credentials = pgTable("credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // bcrypt hash
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;
