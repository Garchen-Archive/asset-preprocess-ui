import { db } from "@/lib/db/client";
import { categories, eventCategories, sessionCategories } from "@/lib/db/schema";
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

    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, params.id))
      .returning();

    if (!updatedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error("Error updating category:", error);

    // Handle unique constraint violation
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update category" },
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
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, params.id))
      .returning();

    if (!deletedCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
