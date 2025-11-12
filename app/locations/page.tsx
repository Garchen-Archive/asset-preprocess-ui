import { db } from "@/lib/db/client";
import { locations } from "@/lib/db/schema";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    type?: string;
    country?: string;
  };
}) {
  const search = searchParams.search || "";
  const typeFilter = searchParams.type || "";
  const countryFilter = searchParams.country || "";

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(locations.name, `%${search}%`),
        ilike(locations.code, `%${search}%`),
        ilike(locations.city, `%${search}%`)
      )
    );
  }

  if (typeFilter) {
    conditions.push(eq(locations.locationType, typeFilter));
  }

  if (countryFilter) {
    conditions.push(eq(locations.country, countryFilter));
  }

  // Get locations with filters
  const locationsList = await db
    .select()
    .from(locations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(locations.createdAt));

  // Get unique countries for filter
  const countries = await db
    .selectDistinct({ country: locations.country })
    .from(locations)
    .where(sql`${locations.country} IS NOT NULL AND ${locations.country} != ''`)
    .orderBy(locations.country);

  // Get unique location types for filter
  const types = await db
    .selectDistinct({ type: locations.locationType })
    .from(locations)
    .where(sql`${locations.locationType} IS NOT NULL AND ${locations.locationType} != ''`)
    .orderBy(locations.locationType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">
            Manage teaching centers, dharma centers, and venues
          </p>
        </div>
        <Button asChild>
          <Link href="/locations/new">Create Location</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <form className="rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              name="search"
              placeholder="Search by name, code, or city..."
              defaultValue={search}
            />
          </div>

          <div>
            <select
              name="type"
              defaultValue={typeFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {types.map((t) => (
                <option key={t.type} value={t.type!}>
                  {t.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="country"
              defaultValue={countryFilter}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c.country} value={c.country!}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit">Apply Filters</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/locations">Clear</Link>
          </Button>
        </div>
      </form>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {locationsList.length} locations
        {search && ` matching "${search}"`}
      </div>

      {/* Locations Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium">City</th>
              <th className="px-4 py-3 text-left text-sm font-medium">State/Province</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Country</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locationsList.map((location) => (
              <tr key={location.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-mono">{location.code}</td>
                <td className="px-4 py-3 text-sm font-medium">{location.name}</td>
                <td className="px-4 py-3 text-sm">
                  {location.locationType ? (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                      {location.locationType}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{location.city || "—"}</td>
                <td className="px-4 py-3 text-sm">{location.stateProvince || "—"}</td>
                <td className="px-4 py-3 text-sm">{location.country || "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/locations/${location.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {locationsList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No locations found. Create your first location to get started.
        </div>
      )}
    </div>
  );
}
