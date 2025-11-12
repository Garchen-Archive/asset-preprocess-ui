import { db } from "@/lib/db/client";
import { topics, eventTopics, sessionTopics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, type } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updateData: any = { name: name.trim(), updatedAt: new Date() };
    if (type !== undefined) {
      if (!type || !type.trim()) {
        return NextResponse.json({ error: "Type cannot be empty" }, { status: 400 });
      }
      updateData.type = type.trim();
    }

    const [updatedTopic] = await db
      .update(topics)
      .set(updateData)
      .where(eq(topics.id, params.id))
      .returning();

    if (!updatedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTopic);
  } catch (error: any) {
    console.error("Error updating topic:", error);

    // Handle unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: "A topic with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update topic" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete will cascade to junction tables due to ON DELETE CASCADE
    const [deletedTopic] = await db
      .delete(topics)
      .where(eq(topics.id, params.id))
      .returning();

    if (!deletedTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
