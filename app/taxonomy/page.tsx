import { db } from "@/lib/db/client";
import { topics, categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { TopicsManager } from "@/components/topics-manager";
import { CategoriesManager } from "@/components/categories-manager";

export const dynamic = "force-dynamic";

export default async function TaxonomyPage() {
  const allTopics = await db.select().from(topics).orderBy(asc(topics.name));
  const allCategories = await db.select().from(categories).orderBy(asc(categories.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Topics & Categories</h1>
        <p className="text-muted-foreground">
          Manage topics and categories that can be assigned to events and sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Topics</h2>
          <TopicsManager initialTopics={allTopics} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <CategoriesManager initialCategories={allCategories} />
        </div>
      </div>
    </div>
  );
}
