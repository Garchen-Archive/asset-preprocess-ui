import { db } from "@/lib/db/client";
import { locations, addresses, locationAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { notFound } from "next/navigation";
import { deleteLocation } from "@/lib/actions";
import { LocationAddressTable } from "@/components/location-address-card";

export const dynamic = "force-dynamic";

export default async function LocationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, params.id))
    .limit(1);

  if (!location) {
    notFound();
  }

  // Get addresses for this location via junction table
  const linkedAddresses = await db
    .select({
      linkId: locationAddresses.id,
      isPrimary: locationAddresses.isPrimary,
      effectiveFrom: locationAddresses.effectiveFrom,
      effectiveTo: locationAddresses.effectiveTo,
      addressId: addresses.id,
      label: addresses.label,
      city: addresses.city,
      stateProvince: addresses.stateProvince,
      country: addresses.country,
      fullAddress: addresses.fullAddress,
      latitude: addresses.latitude,
      longitude: addresses.longitude,
    })
    .from(locationAddresses)
    .innerJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(eq(locationAddresses.locationId, params.id));

  // Sort: primary first, then by effectiveFrom descending (latest first), nulls after dated entries
  linkedAddresses.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    const aDate = a.effectiveFrom || "";
    const bDate = b.effectiveFrom || "";
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    return bDate.localeCompare(aDate);
  });

  // Build breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Locations", href: "/locations" },
    { label: location.name },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl font-bold">{location.name}</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            {location.code}
          </p>
        </div>
        <Button asChild>
          <Link href={`/locations/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Code</dt>
                <dd className="text-sm mt-1 font-mono">{location.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm mt-1">{location.name}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Location Type</dt>
                <dd className="text-sm mt-1">
                  {location.locationType ? (
                    <Badge variant="secondary">{location.locationType}</Badge>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {location.alternativeNames && location.alternativeNames.length > 0 && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Alternative Names</dt>
                  <dd className="text-sm mt-1 flex flex-wrap gap-2">
                    {location.alternativeNames.map((name, idx) => (
                      <Badge key={idx} variant="outline">
                        {name}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Addresses */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Addresses ({linkedAddresses.length})</h2>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/locations/${params.id}/addresses/new`}>Add Address</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/locations/${params.id}/addresses/link`}>Add Existing</Link>
                </Button>
              </div>
            </div>
            {linkedAddresses.length > 0 ? (
              <LocationAddressTable
                addresses={linkedAddresses}
                locationId={params.id}
              />
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No addresses yet</p>
                <p className="text-xs mt-1">Click &quot;Add Address&quot; to create one, or &quot;Add Existing&quot; to associate an existing address</p>
              </div>
            )}
          </div>

          {/* Geographic Coordinates (location-level) */}
          {(location.latitude || location.longitude) && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Geographic Coordinates</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Latitude</dt>
                  <dd className="text-sm mt-1 font-mono">
                    {location.latitude?.toFixed(6) || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Longitude</dt>
                  <dd className="text-sm mt-1 font-mono">
                    {location.longitude?.toFixed(6) || "—"}
                  </dd>
                </div>
                {location.latitude && location.longitude && (
                  <div className="md:col-span-2">
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Description */}
          {location.description && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-sm">{location.description}</p>
            </div>
          )}
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm mt-1">
                  {new Date(location.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm mt-1">
                  {new Date(location.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes */}
          {location.notes && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-sm">{location.notes}</p>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/50 p-6">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this location is permanent and cannot be undone.
            </p>
            <form action={deleteLocation.bind(null, params.id)}>
              <Button type="submit" variant="destructive" size="sm">
                Delete Location
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
