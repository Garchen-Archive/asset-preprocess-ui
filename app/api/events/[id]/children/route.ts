import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const childEvents = await db
      .select({
        id: events.id,
        eventId: events.eventId,
        eventName: events.eventName,
        eventType: events.eventType,
        eventDateStart: events.eventDateStart,
      })
      .from(events)
      .where(eq(events.parentEventId, params.id))
      .orderBy(asc(events.eventDateStart), asc(events.eventName));

    return NextResponse.json(childEvents);
  } catch (error) {
    console.error("Failed to fetch child events:", error);
    return NextResponse.json(
      { error: "Failed to fetch child events" },
      { status: 500 }
    );
  }
}
