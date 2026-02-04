import { db } from "@/lib/db/client";
import { locations, addresses, locationAddresses, venues } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
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

  // Separate primary address from other addresses
  const primaryAddress = linkedAddresses.find((a) => a.isPrimary);
  const otherAddresses = linkedAddresses.filter((a) => !a.isPrimary);

  // Sort other addresses by effectiveFrom descending (latest first), nulls after dated entries
  otherAddresses.sort((a, b) => {
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

            {/* Primary Address - displayed inline as part of location */}
            {primaryAddress && (
              <>
                <hr className="my-6" />
                <h3 className="text-lg font-semibold mb-4">Primary Address</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {primaryAddress.label && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Label</dt>
                      <dd className="text-sm mt-1">{primaryAddress.label}</dd>
                    </div>
                  )}
                  {primaryAddress.fullAddress && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-muted-foreground">Full Address</dt>
                      <dd className="text-sm mt-1">{primaryAddress.fullAddress}</dd>
                    </div>
                  )}
                  {primaryAddress.city && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">City</dt>
                      <dd className="text-sm mt-1">{primaryAddress.city}</dd>
                    </div>
                  )}
                  {primaryAddress.stateProvince && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">State/Province</dt>
                      <dd className="text-sm mt-1">{primaryAddress.stateProvince}</dd>
                    </div>
                  )}
                  {primaryAddress.country && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                      <dd className="text-sm mt-1">{primaryAddress.country}</dd>
                    </div>
                  )}
                  {(primaryAddress.latitude || primaryAddress.longitude) && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Coordinates</dt>
                      <dd className="text-sm mt-1 font-mono">
                        {primaryAddress.latitude}, {primaryAddress.longitude}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/locations/${params.id}/addresses/${primaryAddress.linkId}/edit`}>
                      Edit Primary Address
                    </Link>
                  </Button>
                </div>
              </>
            )}
            {!primaryAddress && (
              <>
                <hr className="my-6" />
                <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  <p>No primary address set</p>
                  <div className="flex gap-2 justify-center mt-2">
                    <Button size="sm" asChild>
                      <Link href={`/locations/${params.id}/addresses/new`}>Add Address</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Past & Alternative Addresses */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Past & Alternative Addresses {otherAddresses.length > 0 && `(${otherAddresses.length})`}
              </h2>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href={`/locations/${params.id}/addresses/new`}>Add Address</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/locations/${params.id}/addresses/link`}>Add Existing</Link>
                </Button>
              </div>
            </div>
            {otherAddresses.length > 0 ? (
              <LocationAddressTable
                addresses={otherAddresses}
                locationId={params.id}
              />
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No past or alternative addresses</p>
                <p className="text-xs mt-1">Click &quot;Add Address&quot; to add a historical or alternative address</p>
              </div>
            )}
          </div>

          {/* Is Online */}
          {location.isOnline && (
            <div className="rounded-lg border p-6 bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Online Location</Badge>
                <p className="text-sm text-muted-foreground">This is an online/virtual location.</p>
              </div>
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
