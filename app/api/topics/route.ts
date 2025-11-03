import { db } from "@/lib/db/client";
import { topics } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [newTopic] = await db
      .insert(topics)
      .values({ name: name.trim() })
      .returning();

    return NextResponse.json(newTopic);
  } catch (error: any) {
    console.error("Error creating topic:", error);

    // Handle unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: "A topic with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allTopics = await db.select().from(topics).orderBy(topics.name);
    return NextResponse.json(allTopics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
