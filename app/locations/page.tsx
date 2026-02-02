import { db } from "@/lib/db/client";
import { locations, addresses, locationAddresses } from "@/lib/db/schema";
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

  // Build where conditions for locations
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(locations.name, `%${search}%`),
        ilike(locations.code, `%${search}%`)
      )
    );
  }

  if (typeFilter) {
    conditions.push(eq(locations.locationType, typeFilter));
  }

  // Get locations with filters
  const locationsList = await db
    .select()
    .from(locations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(locations.createdAt));

  // Get primary addresses for all locations via junction table
  const primaryAddresses = await db
    .select({
      locationId: locationAddresses.locationId,
      city: addresses.city,
      stateProvince: addresses.stateProvince,
      country: addresses.country,
    })
    .from(locationAddresses)
    .innerJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(eq(locationAddresses.isPrimary, true));

  // Build a map of locationId -> primary address
  const primaryAddressMap = new Map(
    primaryAddresses.map((pa) => [pa.locationId, pa])
  );

  // Apply country filter based on primary address
  let filteredLocations = locationsList;
  if (countryFilter) {
    filteredLocations = locationsList.filter((loc) => {
      const pa = primaryAddressMap.get(loc.id);
      return pa?.country === countryFilter;
    });
  }

  // Also include locations whose primary address city matches search
  if (search) {
    const searchLower = search.toLowerCase();
    const cityMatchIds = new Set(
      primaryAddresses
        .filter((pa) => pa.city?.toLowerCase().includes(searchLower))
        .map((pa) => pa.locationId)
    );
    const existingIds = new Set(filteredLocations.map((l) => l.id));
    const additional = locationsList.filter(
      (l) => cityMatchIds.has(l.id) && !existingIds.has(l.id)
    );
    filteredLocations = [...filteredLocations, ...additional];
  }

  // Get unique countries from primary addresses for filter dropdown
  const countries = await db
    .selectDistinct({ country: addresses.country })
    .from(locationAddresses)
    .innerJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(and(
      eq(locationAddresses.isPrimary, true),
      sql`${addresses.country} IS NOT NULL AND ${addresses.country} != ''`
    ))
    .orderBy(addresses.country);

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
        Showing {filteredLocations.length} locations
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
            {filteredLocations.map((location) => {
              const pa = primaryAddressMap.get(location.id);
              return (
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
                  <td className="px-4 py-3 text-sm">{pa?.city || "—"}</td>
                  <td className="px-4 py-3 text-sm">{pa?.stateProvince || "—"}</td>
                  <td className="px-4 py-3 text-sm">{pa?.country || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/locations/${location.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No locations found. Create your first location to get started.
        </div>
      )}
    </div>
  );
}
