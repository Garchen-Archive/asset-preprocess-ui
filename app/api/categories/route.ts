import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, type } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!type || !type.trim()) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const [newCategory] = await db
      .insert(categories)
      .values({ name: name.trim(), type: type.trim() })
      .returning();

    return NextResponse.json(newCategory);
  } catch (error: any) {
    console.error("Error creating category:", error);

    // Handle unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
