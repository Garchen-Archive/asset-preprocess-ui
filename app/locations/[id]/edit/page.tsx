import { db } from "@/lib/db/client";
import { locations, addresses, locationAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateLocationWithAddress } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { LocationAddressTable } from "@/components/location-address-card";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({
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
      postalCode: addresses.postalCode,
      fullAddress: addresses.fullAddress,
      latitude: addresses.latitude,
      longitude: addresses.longitude,
    })
    .from(locationAddresses)
    .innerJoin(addresses, eq(locationAddresses.addressId, addresses.id))
    .where(eq(locationAddresses.locationId, params.id));

  // Separate primary and non-primary addresses
  const primaryAddress = linkedAddresses.find(a => a.isPrimary);
  const otherAddresses = linkedAddresses
    .filter(a => !a.isPrimary)
    .sort((a, b) => {
      const aDate = a.effectiveFrom || "";
      const bDate = b.effectiveFrom || "";
      if (aDate && !bDate) return -1;
      if (!aDate && bDate) return 1;
      return bDate.localeCompare(aDate);
    });

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${params.id}` },
    { label: "Edit" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Edit Location</h1>
        <p className="text-muted-foreground">Update location information</p>
      </div>

      <form action={updateLocationWithAddress.bind(null, params.id)} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                defaultValue={location.code}
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
                defaultValue={location.name}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="alternativeNames">Alternative Names</Label>
              <Input
                id="alternativeNames"
                name="alternativeNames"
                defaultValue={location.alternativeNames?.join(", ") || ""}
                placeholder="Comma-separated alternative names or translations"
              />
            </div>

            <div>
              <Label htmlFor="locationType">Location Type</Label>
              <select
                id="locationType"
                name="locationType"
                defaultValue={location.locationType || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select type...</option>
                <option value="dharma_center">Dharma Center</option>
                <option value="monastery">Monastery</option>
                <option value="retreat_center">Retreat Center</option>
                <option value="campus">Campus</option>
                <option value="hotel">Hotel</option>
                <option value="online">Online Platform</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={location.timezone || ""}
                placeholder="e.g., America/Phoenix, Asia/Taipei"
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="isOnline"
                name="isOnline"
                type="checkbox"
                defaultChecked={location.isOnline || false}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isOnline">This is an online/virtual location</Label>
            </div>
          </div>
        </div>

        {/* Primary Address - Integrated */}
        <div className="rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Primary Address</h2>
              <p className="text-xs text-muted-foreground">
                The main physical address for this location
              </p>
            </div>
            {!primaryAddress && (
              <Button size="sm" type="button" asChild>
                <Link href={`/locations/${params.id}/addresses/new?primary=true`}>
                  Add Primary Address
                </Link>
              </Button>
            )}
          </div>

          {primaryAddress ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hidden fields for IDs */}
              <input type="hidden" name="primaryAddressId" value={primaryAddress.addressId} />
              <input type="hidden" name="primaryLinkId" value={primaryAddress.linkId} />

              <div className="md:col-span-2">
                <Label htmlFor="primaryLabel">Label</Label>
                <Input
                  id="primaryLabel"
                  name="primaryLabel"
                  defaultValue={primaryAddress.label || ""}
                  placeholder="e.g., Main Center, Retreat Land"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="primaryFullAddress">Full Address</Label>
                <Input
                  id="primaryFullAddress"
                  name="primaryFullAddress"
                  defaultValue={primaryAddress.fullAddress || ""}
                  placeholder="Complete street address"
                />
              </div>

              <div>
                <Label htmlFor="primaryCity">City</Label>
                <Input
                  id="primaryCity"
                  name="primaryCity"
                  defaultValue={primaryAddress.city || ""}
                />
              </div>

              <div>
                <Label htmlFor="primaryStateProvince">State/Province</Label>
                <Input
                  id="primaryStateProvince"
                  name="primaryStateProvince"
                  defaultValue={primaryAddress.stateProvince || ""}
                />
              </div>

              <div>
                <Label htmlFor="primaryCountry">Country</Label>
                <Input
                  id="primaryCountry"
                  name="primaryCountry"
                  defaultValue={primaryAddress.country || ""}
                />
              </div>

              <div>
                <Label htmlFor="primaryPostalCode">Postal Code</Label>
                <Input
                  id="primaryPostalCode"
                  name="primaryPostalCode"
                  defaultValue={primaryAddress.postalCode || ""}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No primary address set</p>
              <p className="text-xs mt-1">Click &quot;Add Primary Address&quot; to create one</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={location.description || ""}
                placeholder="Brief description of the location"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={location.notes || ""}
                placeholder="Additional notes or context"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/locations/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>

      {/* Past & Alternative Addresses Section */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Past & Alternative Addresses</h2>
            <p className="text-xs text-muted-foreground">
              Historical or secondary addresses for this location
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" asChild>
              <Link href={`/locations/${params.id}/addresses/new`}>Add Address</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/locations/${params.id}/addresses/link`}>Link Existing</Link>
            </Button>
          </div>
        </div>
        {otherAddresses.length > 0 ? (
          <LocationAddressTable
            addresses={otherAddresses}
            locationId={params.id}
          />
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No additional addresses</p>
          </div>
        )}
      </div>
    </div>
  );
}
