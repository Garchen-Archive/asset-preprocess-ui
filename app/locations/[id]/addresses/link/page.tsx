import { db } from "@/lib/db/client";
import { locations, addresses, locationAddresses } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { linkAddressToLocation } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LinkAddressPage({
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

  // Get all addresses to select from
  const allAddresses = await db
    .select()
    .from(addresses)
    .where(isNull(addresses.deletedAt));

  // Get already linked address IDs
  const alreadyLinked = await db
    .select({ addressId: locationAddresses.addressId })
    .from(locationAddresses)
    .where(eq(locationAddresses.locationId, params.id));

  const linkedIds = new Set(alreadyLinked.map((l) => l.addressId));
  const availableAddresses = allAddresses.filter((a) => !linkedIds.has(a.id));

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${params.id}` },
    { label: "Add Existing" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Add Existing Address</h1>
        <p className="text-muted-foreground">
          Add an existing address to {location.name}
        </p>
      </div>

      <form action={linkAddressToLocation.bind(null, params.id)} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Select Address</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addressId">Address *</Label>
              <select
                id="addressId"
                name="addressId"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select an address...</option>
                {availableAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label ? `${addr.label} — ` : ""}
                    {addr.fullAddress || [addr.city, addr.country].filter(Boolean).join(", ") || addr.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Don&apos;t see the address you need?{" "}
                <Link href="/addresses/new" className="text-blue-600 hover:underline">
                  Create a new one
                </Link>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isPrimary"
                name="isPrimary"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPrimary" className="mb-0">Primary address for this location</Label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Effective Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="effectiveFrom">Effective From</Label>
              <Input id="effectiveFrom" name="effectiveFrom" type="date" />
            </div>
            <div>
              <Label htmlFor="effectiveTo">Effective To</Label>
              <Input id="effectiveTo" name="effectiveTo" type="date" />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank if this is the current address
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Add Existing Address</Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/locations/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
