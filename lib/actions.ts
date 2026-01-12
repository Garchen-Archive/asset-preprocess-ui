"use server";

import { db } from "@/lib/db/client";
import { archiveAssets, events, sessions, topics, categories, eventTopics, eventCategories, sessionTopics, sessionCategories, locations } from "@/lib/db/schema";
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

    // Administrative - Event or Session assignment (mutually exclusive)
    eventId: formData.get("eventId") as string || null,
    sessionId: formData.get("sessionId") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    catalogedBy: formData.get("catalogedBy") as string || null,
    backedUpLocally: formData.get("backedUpLocally") === "on",
    safeToDeleteFromGdrive: formData.get("safeToDeleteFromGdrive") === "on",
    exclude: formData.get("exclude") === "on",
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
  const locationIdStr = formData.get("locationId") as string;

  // Extract topic and category IDs from form data
  const topicIds = formData.getAll("topicIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = {
    eventName: formData.get("eventName") as string,
    parentEventId: parentEventIdStr && parentEventIdStr !== "" ? parentEventIdStr : null,
    locationId: locationIdStr && locationIdStr !== "" ? locationIdStr : null,
    eventDateStart: formData.get("eventDateStart") as string || null,
    eventDateEnd: formData.get("eventDateEnd") as string || null,
    eventType: formData.get("eventType") as string || null,
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
    // Re-throw redirect errors (these are not actual errors)
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    // Log the full error to help debug
    console.error('Create event error:', error);

    // Check for unique constraint violation
    if (error?.code === '23505') {
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
  const locationIdStr = formData.get("locationId") as string;

  // Extract topic and category IDs from form data
  const topicIds = formData.getAll("topicIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = {
    eventName: formData.get("eventName") as string,
    parentEventId: parentEventIdStr && parentEventIdStr !== "" ? parentEventIdStr : null,
    locationId: locationIdStr && locationIdStr !== "" ? locationIdStr : null,
    eventDateStart: formData.get("eventDateStart") as string || null,
    eventDateEnd: formData.get("eventDateEnd") as string || null,
    eventType: formData.get("eventType") as string || null,
    eventDescription: formData.get("eventDescription") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    notes: formData.get("notes") as string || null,
    additionalMetadata,
    updatedAt: new Date(),
  };

  await db.update(events).set(data).where(eq(events.id, id));

  // Delete existing junction table entries
  await db.delete(eventTopics).where(eq(eventTopics.eventId, id));
  await db.delete(eventCategories).where(eq(eventCategories.eventId, id));

  // Create new junction table entries for topics
  if (topicIds.length > 0) {
    await db.insert(eventTopics).values(
      topicIds.map(topicId => ({
        eventId: id,
        topicId: topicId,
      }))
    );
  }

  // Create new junction table entries for categories
  if (categoryIds.length > 0) {
    await db.insert(eventCategories).values(
      categoryIds.map(categoryId => ({
        eventId: id,
        categoryId: categoryId,
      }))
    );
  }

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
    eventId: formData.get("eventId") as string || null,
    sessionName: formData.get("sessionName") as string,
    sessionDate: formData.get("sessionDate") as string || null,
    sessionTime: formData.get("sessionTime") as string || null,
    sessionStartTime: formData.get("sessionStartTime") as string || null,
    sessionEndTime: formData.get("sessionEndTime") as string || null,
    sequenceInEvent: formData.get("sequenceInEvent") ? parseInt(formData.get("sequenceInEvent") as string) : null,
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

  // Extract topic and category IDs from form data
  const topicIds = formData.getAll("topicIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = {
    eventId: formData.get("eventId") as string || null,
    sessionName: formData.get("sessionName") as string,
    sessionDate: formData.get("sessionDate") as string || null,
    sessionTime: formData.get("sessionTime") as string || null,
    sessionStartTime: formData.get("sessionStartTime") as string || null,
    sessionEndTime: formData.get("sessionEndTime") as string || null,
    sequenceInEvent: formData.get("sequenceInEvent") ? parseInt(formData.get("sequenceInEvent") as string) : null,
    sessionDescription: formData.get("sessionDescription") as string || null,
    durationEstimated: formData.get("durationEstimated") as string || null,
    catalogingStatus: formData.get("catalogingStatus") as string || null,
    notes: formData.get("notes") as string || null,
    additionalMetadata,
    updatedAt: new Date(),
  };

  await db.update(sessions).set(data).where(eq(sessions.id, id));

  // Delete existing junction table entries
  await db.delete(sessionTopics).where(eq(sessionTopics.sessionId, id));
  await db.delete(sessionCategories).where(eq(sessionCategories.sessionId, id));

  // Create new junction table entries for topics
  if (topicIds.length > 0) {
    await db.insert(sessionTopics).values(
      topicIds.map(topicId => ({
        sessionId: id,
        topicId: topicId,
      }))
    );
  }

  // Create new junction table entries for categories
  if (categoryIds.length > 0) {
    await db.insert(sessionCategories).values(
      categoryIds.map(categoryId => ({
        sessionId: id,
        categoryId: categoryId,
      }))
    );
  }

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

export async function createTopic(name: string, type: string) {
  const [topic] = await db
    .insert(topics)
    .values({ name: name.trim(), type })
    .returning();

  revalidatePath("/events");
  revalidatePath("/sessions");
  return topic;
}

export async function createCategory(name: string, type: string) {
  const [category] = await db
    .insert(categories)
    .values({ name: name.trim(), type })
    .returning();

  revalidatePath("/events");
  revalidatePath("/sessions");
  return category;
}

// ============================================================================
// LOCATION ACTIONS
// ============================================================================

export async function createLocation(formData: FormData) {
  const alternativeNamesStr = formData.get("alternativeNames") as string;
  const alternativeNames = alternativeNamesStr
    ? alternativeNamesStr.split(",").map(n => n.trim()).filter(Boolean)
    : null;

  const data = {
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    alternativeNames,
    city: formData.get("city") as string || null,
    stateProvince: formData.get("stateProvince") as string || null,
    country: formData.get("country") as string || null,
    postalCode: formData.get("postalCode") as string || null,
    fullAddress: formData.get("fullAddress") as string || null,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
    locationType: formData.get("locationType") as string || null,
    description: formData.get("description") as string || null,
    notes: formData.get("notes") as string || null,
  };

  const [newLocation] = await db.insert(locations).values(data).returning();

  revalidatePath("/locations");
  redirect(`/locations/${newLocation.id}`);
}

export async function updateLocation(id: string, formData: FormData) {
  const alternativeNamesStr = formData.get("alternativeNames") as string;
  const alternativeNames = alternativeNamesStr
    ? alternativeNamesStr.split(",").map(n => n.trim()).filter(Boolean)
    : null;

  const data = {
    code: formData.get("code") as string,
    name: formData.get("name") as string,
    alternativeNames,
    city: formData.get("city") as string || null,
    stateProvince: formData.get("stateProvince") as string || null,
    country: formData.get("country") as string || null,
    postalCode: formData.get("postalCode") as string || null,
    fullAddress: formData.get("fullAddress") as string || null,
    latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
    longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
    locationType: formData.get("locationType") as string || null,
    description: formData.get("description") as string || null,
    notes: formData.get("notes") as string || null,
    updatedAt: new Date(),
  };

  await db.update(locations).set(data).where(eq(locations.id, id));

  revalidatePath(`/locations/${id}`);
  redirect(`/locations/${id}`);
}

export async function deleteLocation(id: string) {
  await db.delete(locations).where(eq(locations.id, id));

  revalidatePath("/locations");
  redirect("/locations");
}

// ============================================================================
// BULK ASSET ASSIGNMENT
// ============================================================================

export async function bulkAssignAssets({
  assetIds,
  eventId,
  sessionId,
}: {
  assetIds: string[];
  eventId: string | null;
  sessionId: string | null;
}) {
  try {
    // Validate that we have either eventId or sessionId, but not both
    if ((eventId && sessionId) || (!eventId && !sessionId)) {
      return { success: false, error: "Must specify either event or session, but not both" };
    }

    // Update all selected assets
    await db
      .update(archiveAssets)
      .set({
        eventId: eventId || null,
        sessionId: sessionId || null,
        updatedAt: new Date(),
      })
      .where(sql`${archiveAssets.id} = ANY(${assetIds})`);

    revalidatePath("/assets");
    return { success: true };
  } catch (error: any) {
    console.error("Bulk assign error:", error);
    return { success: false, error: error.message || "Failed to assign assets" };
  }
}
