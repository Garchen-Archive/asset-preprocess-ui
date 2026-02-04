import { db } from "@/lib/db/client";
import { organizations, locations, organizationLocations, locationAddresses, addresses } from "@/lib/db/schema";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage({
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

  // Build where conditions for organizations
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(organizations.name, `%${search}%`),
        ilike(organizations.code, `%${search}%`)
      )
    );
  }

  if (typeFilter) {
    conditions.push(eq(organizations.orgType, typeFilter));
  }

  // Get organizations with filters
  const organizationsList = await db
    .select()
    .from(organizations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(organizations.createdAt));

  // Get primary locations for all organizations via organization_locations junction
  // Then get the primary address for each location via location_addresses
  const primaryLocationsWithAddresses = await db
    .select({
      organizationId: organizationLocations.organizationId,
      locationId: locations.id,
      locationName: locations.name,
      city: addresses.city,
      stateProvince: addresses.stateProvince,
      country: addresses.country,
    })
    .from(organizationLocations)
    .innerJoin(locations, eq(organizationLocations.locationId, locations.id))
    .leftJoin(locationAddresses, and(
      eq(locationAddresses.locationId, locations.id),
      eq(locationAddresses.isPrimary, true)
    ))
    .leftJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(eq(organizationLocations.isPrimary, true));

  // Build a map of organizationId -> primary location info (with address)
  const primaryLocationMap = new Map(
    primaryLocationsWithAddresses.map((pl) => [pl.organizationId, pl])
  );

  // Apply country filter based on primary location's address
  let filteredOrganizations = organizationsList;
  if (countryFilter) {
    filteredOrganizations = organizationsList.filter((org) => {
      const pl = primaryLocationMap.get(org.id);
      return pl?.country === countryFilter;
    });
  }

  // Also include organizations whose primary location's address city matches search
  if (search) {
    const searchLower = search.toLowerCase();
    const cityMatchIds = new Set(
      primaryLocationsWithAddresses
        .filter((pl) => pl.city?.toLowerCase().includes(searchLower))
        .map((pl) => pl.organizationId)
    );
    const existingIds = new Set(filteredOrganizations.map((o) => o.id));
    const additional = organizationsList.filter(
      (o) => cityMatchIds.has(o.id) && !existingIds.has(o.id)
    );
    filteredOrganizations = [...filteredOrganizations, ...additional];
  }

  // Get unique countries from primary location addresses for filter dropdown
  const addressCountries = await db
    .selectDistinct({ country: addresses.country })
    .from(organizationLocations)
    .innerJoin(locations, eq(organizationLocations.locationId, locations.id))
    .innerJoin(locationAddresses, and(
      eq(locationAddresses.locationId, locations.id),
      eq(locationAddresses.isPrimary, true)
    ))
    .innerJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(and(
      eq(organizationLocations.isPrimary, true),
      sql`${addresses.country} IS NOT NULL AND ${addresses.country} != ''`
    ))
    .orderBy(addresses.country);

  const countries = addressCountries.map(c => c.country).filter(Boolean).sort() as string[];

  // Get unique org types for filter
  const types = await db
    .selectDistinct({ type: organizations.orgType })
    .from(organizations)
    .where(sql`${organizations.orgType} IS NOT NULL AND ${organizations.orgType} != ''`)
    .orderBy(organizations.orgType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orgs</h1>
          <p className="text-muted-foreground">
            Manage dharma centers, monasteries, and organizing entities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/organizations/import">Bulk Import</Link>
          </Button>
          <Button asChild>
            <Link href="/organizations/new">Create Org</Link>
          </Button>
        </div>
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
                <option key={c} value={c!}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit">Apply Filters</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/organizations">Clear</Link>
          </Button>
        </div>
      </form>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredOrganizations.length} orgs
        {search && ` matching "${search}"`}
      </div>

      {/* Orgs Table */}
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
            {filteredOrganizations.map((org) => {
              const pl = primaryLocationMap.get(org.id);
              return (
                <tr key={org.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-mono">{org.code}</td>
                  <td className="px-4 py-3 text-sm font-medium">{org.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {org.orgType ? (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700">
                        {org.orgType}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{pl?.city || "—"}</td>
                  <td className="px-4 py-3 text-sm">{pl?.stateProvince || "—"}</td>
                  <td className="px-4 py-3 text-sm">{pl?.country || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <Link
                      href={`/organizations/${org.id}`}
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

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No orgs found. Create your first org to get started.
        </div>
      )}
    </div>
  );
}
