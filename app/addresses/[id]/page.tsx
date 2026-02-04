import { db } from "@/lib/db/client";
import { addresses, locationAddresses, locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { notFound } from "next/navigation";
import { deleteAddress } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AddressDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [address] = await db
    .select()
    .from(addresses)
    .where(eq(addresses.id, params.id))
    .limit(1);

  if (!address) {
    notFound();
  }

  // Get locations linked to this address
  const linkedLocations = await db
    .select({
      linkId: locationAddresses.id,
      isPrimary: locationAddresses.isPrimary,
      effectiveFrom: locationAddresses.effectiveFrom,
      effectiveTo: locationAddresses.effectiveTo,
      locationId: locations.id,
      locationName: locations.name,
      locationCode: locations.code,
    })
    .from(locationAddresses)
    .innerJoin(locations, eq(locationAddresses.locationId, locations.id))
    .where(eq(locationAddresses.addressId, params.id));

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Addresses", href: "/addresses" },
    { label: address.label || "Address" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl font-bold">{address.label || "Address"}</h1>
        </div>
        <Button asChild>
          <Link href={`/addresses/${params.id}/edit`}>Edit</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Address Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {address.label && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Label</dt>
                  <dd className="text-sm mt-1">{address.label}</dd>
                </div>
              )}
              {address.fullAddress && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Full Address</dt>
                  <dd className="text-sm mt-1">{address.fullAddress}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">City</dt>
                <dd className="text-sm mt-1">{address.city || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">State/Province</dt>
                <dd className="text-sm mt-1">{address.stateProvince || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                <dd className="text-sm mt-1">{address.country || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Postal Code</dt>
                <dd className="text-sm mt-1">{address.postalCode || "—"}</dd>
              </div>
            </dl>
          </div>

          {(address.latitude || address.longitude) && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Geographic Coordinates</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Latitude</dt>
                  <dd className="text-sm mt-1 font-mono">{address.latitude?.toFixed(6) || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Longitude</dt>
                  <dd className="text-sm mt-1 font-mono">{address.longitude?.toFixed(6) || "—"}</dd>
                </div>
                {address.latitude && address.longitude && (
                  <div className="md:col-span-2">
                    <a
                      href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}
              </dl>
            </div>
          )}

          {linkedLocations.length > 0 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Linked Locations ({linkedLocations.length})</h2>
              <div className="space-y-3">
                {linkedLocations.map((loc) => (
                  <div key={loc.linkId} className="p-4 rounded-md border bg-muted/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/locations/${loc.locationId}`} className="font-medium text-sm text-blue-600 hover:underline">
                        {loc.locationName}
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono">{loc.locationCode}</span>
                      {loc.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                    </div>
                    {(loc.effectiveFrom || loc.effectiveTo) && (
                      <p className="text-xs text-muted-foreground">
                        {loc.effectiveFrom && `From: ${loc.effectiveFrom}`}
                        {loc.effectiveFrom && loc.effectiveTo && " — "}
                        {loc.effectiveTo ? `To: ${loc.effectiveTo}` : loc.effectiveFrom ? " (Current)" : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm mt-1">{new Date(address.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                <dd className="text-sm mt-1">{new Date(address.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {address.notes && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <p className="text-sm">{address.notes}</p>
            </div>
          )}

          <div className="rounded-lg border border-destructive/50 p-6">
            <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Deleting this address is permanent and cannot be undone.
            </p>
            <form action={deleteAddress.bind(null, params.id)}>
              <Button type="submit" variant="destructive" size="sm">
                Delete Address
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
