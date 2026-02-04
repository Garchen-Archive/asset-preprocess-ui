import { db } from "@/lib/db/client";
import { addresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateAddress } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditAddressPage({
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

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Addresses", href: "/addresses" },
    { label: address.label || "Address", href: `/addresses/${params.id}` },
    { label: "Edit" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Edit Address</h1>
        <p className="text-muted-foreground">
          {address.label || address.fullAddress || "Update address details"}
        </p>
      </div>

      <form action={updateAddress.bind(null, params.id)} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                defaultValue={address.label || ""}
                placeholder='e.g., "Main Center", "Retreat Land"'
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="fullAddress">Full Address</Label>
              <Input
                id="fullAddress"
                name="fullAddress"
                defaultValue={address.fullAddress || ""}
                placeholder="Complete address"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={address.city || ""} placeholder="City" />
            </div>

            <div>
              <Label htmlFor="stateProvince">State/Province</Label>
              <Input id="stateProvince" name="stateProvince" defaultValue={address.stateProvince || ""} placeholder="State or Province" />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={address.country || ""} placeholder="Country" />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" defaultValue={address.postalCode || ""} placeholder="Postal/ZIP code" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Geographic Coordinates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" name="latitude" type="number" step="any" defaultValue={address.latitude || ""} placeholder="e.g., 41.8781" />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" name="longitude" type="number" step="any" defaultValue={address.longitude || ""} placeholder="e.g., -87.6298" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <Textarea id="notes" name="notes" defaultValue={address.notes || ""} placeholder="Additional notes about this address" rows={3} />
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/addresses/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
