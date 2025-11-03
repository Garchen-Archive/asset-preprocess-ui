"use server";

import { db } from "@/lib/db/client";
import { archiveAssets, events, sessions, topics, categories, eventTopics, eventCategories, sessionTopics, sessionCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateAsset(id: string, formData: FormData) {
  // Parse additional metadata JSON
  let additionalMetadata = null;
  const additionalMetadataStr = formData.get("additionalMetadata") as string;
  if (additionalMetadataStr && additionalMetadataStr.trim()) {
    try {
      additionalMetadata = JSON.parse(additionalMetadataStr);
    } catch (e) {
      // If JSON is invalid, ignore it
      console.error("Invalid JSON in additionalMetadata:", e);
    }
  }

  const data = {
    title: formData.get("title") as string || null,
    category: formData.get("category") as string || null,
    descriptionSummary: formData.get("descriptionSummary") as string || null,
    additionalTopics: formData.get("additionalTopics") as string || null,

    // Translation
    hasOralTranslation: formData.get("hasOralTranslation") === "on",
    interpreterName: formData.get("interpreterName") as string || null,
    hasTibetanTranscription: formData.get("hasTibetanTranscription") === "on",
    hasWrittenTranslation: formData.get("hasWrittenTranslation") === "on",
    hasSubtitleFiles: formData.get("hasSubtitleFiles") === "on",

    // Quality
    audioQualityIssues: formData.get("audioQualityIssues") as string || null,
    videoQualityIssues: formData.get("videoQualityIssues") as string || null,
    needsEditing: formData.get("needsEditing") === "on",

    // Administrative
    sessionId: formData.get("sessionId") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    catalogedBy: formData.get("catalogedBy") as string || null,
    backedUpLocally: formData.get("backedUpLocally") === "on",
    safeToDeleteFromGdrive: formData.get("safeToDeleteFromGdrive") === "on",
    removeFile: formData.get("removeFile") === "on",
    contributorOrg: formData.get("contributorOrg") as string || null,
    notes: formData.get("notes") as string || null,

    // Additional metadata
    additionalMetadata,

    updatedAt: new Date(),
  };

  await db
    .update(archiveAssets)
    .set(data)
    .where(eq(archiveAssets.id, id));

  revalidatePath(`/assets/${id}`);
  redirect(`/assets/${id}`);
}

export async function deleteAsset(id: string) {
  await db
    .delete(archiveAssets)
    .where(eq(archiveAssets.id, id));

  revalidatePath("/assets");
  redirect("/assets");
}

// ============================================================================
// EVENT ACTIONS
// ============================================================================

export async function createEvent(prevState: { error: string } | undefined, formData: FormData) {
  const parentEventIdStr = formData.get("parentEventId") as string;

  // Extract topic and category IDs from form data
  const topicIds = formData.getAll("topicIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = {
    eventId: formData.get("eventId") as string,
    eventName: formData.get("eventName") as string,
    parentEventId: parentEventIdStr && parentEventIdStr !== "" ? parentEventIdStr : null,
    eventDateStart: formData.get("eventDateStart") as string || null,
    eventDateEnd: formData.get("eventDateEnd") as string || null,
    eventType: formData.get("eventType") as string || null,
    category: formData.get("category") as string || null,
    topic: formData.get("topic") as string || null,
    centerName: formData.get("centerName") as string || null,
    city: formData.get("city") as string || null,
    stateProvince: formData.get("stateProvince") as string || null,
    country: formData.get("country") as string || null,
    eventDescription: formData.get("eventDescription") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    notes: formData.get("notes") as string || null,
    createdBy: formData.get("createdBy") as string || null,
  };

  try {
    const [newEvent] = await db.insert(events).values(data).returning();

    // Create junction table entries for topics
    if (topicIds.length > 0) {
      await db.insert(eventTopics).values(
        topicIds.map(topicId => ({
          eventId: newEvent.id,
          topicId: topicId,
        }))
      );
    }

    // Create junction table entries for categories
    if (categoryIds.length > 0) {
      await db.insert(eventCategories).values(
        categoryIds.map(categoryId => ({
          eventId: newEvent.id,
          categoryId: categoryId,
        }))
      );
    }

    revalidatePath("/events");
    redirect(`/events/${newEvent.id}`);
  } catch (error: any) {
    // Log the full error to help debug
    console.error('Create event error:', error);

    // Check for unique constraint violation on event_id
    if (error?.code === '23505') {
      // Check if it's the event_id constraint
      if (error?.constraint?.includes('event_id') || error?.detail?.includes('event_id')) {
        return { error: `Event ID "${data.eventId}" already exists. Please use a different Event ID.` };
      }
      return { error: 'A duplicate value was found. Please check your input.' };
    }
    return { error: `An unexpected error occurred: ${error?.message || 'Please try again.'}` };
  }
}

export async function updateEvent(id: string, formData: FormData) {
  // Parse additional metadata JSON
  let additionalMetadata = null;
  const additionalMetadataStr = formData.get("additionalMetadata") as string;
  if (additionalMetadataStr && additionalMetadataStr.trim()) {
    try {
      additionalMetadata = JSON.parse(additionalMetadataStr);
    } catch (e) {
      console.error("Invalid JSON in additionalMetadata:", e);
    }
  }

  const parentEventIdStr = formData.get("parentEventId") as string;

  const data = {
    eventId: formData.get("eventId") as string,
    eventName: formData.get("eventName") as string,
    parentEventId: parentEventIdStr && parentEventIdStr !== "" ? parentEventIdStr : null,
    eventDateStart: formData.get("eventDateStart") as string || null,
    eventDateEnd: formData.get("eventDateEnd") as string || null,
    eventType: formData.get("eventType") as string || null,
    category: formData.get("category") as string || null,
    topic: formData.get("topic") as string || null,
    centerName: formData.get("centerName") as string || null,
    city: formData.get("city") as string || null,
    stateProvince: formData.get("stateProvince") as string || null,
    country: formData.get("country") as string || null,
    eventDescription: formData.get("eventDescription") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    notes: formData.get("notes") as string || null,
    additionalMetadata,
    updatedAt: new Date(),
  };

  await db.update(events).set(data).where(eq(events.id, id));

  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id));

  revalidatePath("/events");
  redirect("/events");
}

export async function assignEventAsChild(eventId: string, parentEventId: string) {
  await db
    .update(events)
    .set({ parentEventId: parentEventId })
    .where(eq(events.id, eventId));

  revalidatePath(`/events/${parentEventId}`);
  redirect(`/events/${parentEventId}`);
}

// ============================================================================
// SESSION ACTIONS
// ============================================================================

export async function createSession(formData: FormData) {
  // Extract topic and category IDs from form data
  const topicIds = formData.getAll("topicIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = {
    sessionId: formData.get("sessionId") as string,
    eventId: formData.get("eventId") as string || null,
    sessionName: formData.get("sessionName") as string,
    sessionDate: formData.get("sessionDate") as string || null,
    sessionTime: formData.get("sessionTime") as string || null,
    sessionStartTime: formData.get("sessionStartTime") as string || null,
    sessionEndTime: formData.get("sessionEndTime") as string || null,
    sequenceInEvent: formData.get("sequenceInEvent") ? parseInt(formData.get("sequenceInEvent") as string) : null,
    topic: formData.get("topic") as string || null,
    category: formData.get("category") as string || null,
    sessionDescription: formData.get("sessionDescription") as string || null,
    durationEstimated: formData.get("durationEstimated") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    notes: formData.get("notes") as string || null,
  };

  const [newSession] = await db.insert(sessions).values(data).returning();

  // Create junction table entries for topics
  if (topicIds.length > 0) {
    await db.insert(sessionTopics).values(
      topicIds.map(topicId => ({
        sessionId: newSession.id,
        topicId: topicId,
      }))
    );
  }

  // Create junction table entries for categories
  if (categoryIds.length > 0) {
    await db.insert(sessionCategories).values(
      categoryIds.map(categoryId => ({
        sessionId: newSession.id,
        categoryId: categoryId,
      }))
    );
  }

  revalidatePath("/sessions");
  redirect(`/sessions/${newSession.id}`);
}

export async function updateSession(id: string, formData: FormData) {
  // Parse additional metadata JSON
  let additionalMetadata = null;
  const additionalMetadataStr = formData.get("additionalMetadata") as string;
  if (additionalMetadataStr && additionalMetadataStr.trim()) {
    try {
      additionalMetadata = JSON.parse(additionalMetadataStr);
    } catch (e) {
      console.error("Invalid JSON in additionalMetadata:", e);
    }
  }

  const data = {
    sessionId: formData.get("sessionId") as string,
    eventId: formData.get("eventId") as string || null,
    sessionName: formData.get("sessionName") as string,
    sessionDate: formData.get("sessionDate") as string || null,
    sessionTime: formData.get("sessionTime") as string || null,
    sessionStartTime: formData.get("sessionStartTime") as string || null,
    sessionEndTime: formData.get("sessionEndTime") as string || null,
    sequenceInEvent: formData.get("sequenceInEvent") ? parseInt(formData.get("sequenceInEvent") as string) : null,
    topic: formData.get("topic") as string || null,
    category: formData.get("category") as string || null,
    sessionDescription: formData.get("sessionDescription") as string || null,
    durationEstimated: formData.get("durationEstimated") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    notes: formData.get("notes") as string || null,
    additionalMetadata,
    updatedAt: new Date(),
  };

  await db.update(sessions).set(data).where(eq(sessions.id, id));

  revalidatePath(`/sessions/${id}`);
  redirect(`/sessions/${id}`);
}

export async function deleteSession(id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));

  revalidatePath("/sessions");
  redirect("/sessions");
}

// ============================================================================
// TOPICS AND CATEGORIES ACTIONS
// ============================================================================

export async function createTopic(name: string) {
  const [topic] = await db
    .insert(topics)
    .values({ name: name.trim() })
    .returning();

  revalidatePath("/events");
  revalidatePath("/sessions");
  return topic;
}

export async function createCategory(name: string) {
  const [category] = await db
    .insert(categories)
    .values({ name: name.trim() })
    .returning();

  revalidatePath("/events");
  revalidatePath("/sessions");
  return category;
}
