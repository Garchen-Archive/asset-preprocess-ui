import { db } from "@/lib/db/client";
import { organizations, locations, organizationLocations, locationAddresses, addresses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { updateOrganization } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditOrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const [organization] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, params.id))
    .limit(1);

  if (!organization) {
    notFound();
  }

  // Get locations for this organization via organization_locations junction table
  const linkedLocations = await db
    .select({
      linkId: organizationLocations.id,
      isPrimary: organizationLocations.isPrimary,
      role: organizationLocations.role,
      locationId: locations.id,
      locationCode: locations.code,
      locationName: locations.name,
      locationType: locations.locationType,
      isOnline: locations.isOnline,
      // Primary address info
      city: addresses.city,
      country: addresses.country,
    })
    .from(organizationLocations)
    .innerJoin(locations, eq(organizationLocations.locationId, locations.id))
    .leftJoin(locationAddresses, and(
      eq(locationAddresses.locationId, locations.id),
      eq(locationAddresses.isPrimary, true)
    ))
    .leftJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(eq(organizationLocations.organizationId, params.id));

  // Sort: primary first
  linkedLocations.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Orgs", href: "/organizations" },
    { label: organization.name, href: `/organizations/${params.id}` },
    { label: "Edit" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Edit Organization</h1>
        <p className="text-muted-foreground">Update organization information</p>
      </div>

      <form action={updateOrganization.bind(null, params.id)} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                defaultValue={organization.code}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier (e.g., GBI, GDI)
              </p>
            </div>

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={organization.name}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="alternativeNames">Alternative Names</Label>
              <Input
                id="alternativeNames"
                name="alternativeNames"
                defaultValue={organization.alternativeNames?.join(", ") || ""}
                placeholder="Comma-separated alternative names or translations"
              />
            </div>

            <div>
              <Label htmlFor="orgType">Organization Type</Label>
              <select
                id="orgType"
                name="orgType"
                defaultValue={organization.orgType || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type...</option>
                <option value="dharma_center">Dharma Center</option>
                <option value="monastery">Monastery</option>
                <option value="retreat_center">Retreat Center</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={organization.description || ""}
                placeholder="Brief description of the organization"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={organization.notes || ""}
                placeholder="Additional notes or context"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/organizations/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>

      {/* Locations Section (outside the organization form) */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Locations ({linkedLocations.length})</h2>
          <div className="flex gap-2">
            <Button size="sm" asChild>
              <Link href={`/organizations/${params.id}/locations/link`}>Link Location</Link>
            </Button>
          </div>
        </div>
        {linkedLocations.length > 0 ? (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">City</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Country</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Primary</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {linkedLocations.map((loc) => (
                  <tr key={loc.linkId} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {loc.locationName}
                      {loc.isOnline && (
                        <Badge variant="outline" className="ml-2 text-xs">Online</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {loc.locationType ? (
                        <Badge variant="outline" className="text-xs">{loc.locationType}</Badge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{loc.city || "—"}</td>
                    <td className="px-4 py-3 text-sm">{loc.country || "—"}</td>
                    <td className="px-4 py-3 text-sm">
                      {loc.isPrimary ? (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/locations/${loc.locationId}`}
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
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No locations linked yet</p>
            <p className="text-xs mt-1">Click &quot;Link Location&quot; to add one</p>
          </div>
        )}
      </div>
    </div>
  );
}
