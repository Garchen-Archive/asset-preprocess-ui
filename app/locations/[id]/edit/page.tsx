import { db } from "@/lib/db/client";
import { locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateLocation } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
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

      <form action={updateLocation.bind(null, params.id)} className="space-y-6">
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
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="fullAddress">Full Address</Label>
              <Input
                id="fullAddress"
                name="fullAddress"
                defaultValue={location.fullAddress || ""}
                placeholder="Complete address"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                defaultValue={location.city || ""}
                placeholder="City"
              />
            </div>

            <div>
              <Label htmlFor="stateProvince">State/Province</Label>
              <Input
                id="stateProvince"
                name="stateProvince"
                defaultValue={location.stateProvince || ""}
                placeholder="State or Province"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={location.country || ""}
                placeholder="Country"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={location.postalCode || ""}
                placeholder="Postal/ZIP code"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Geographic Coordinates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={location.latitude || ""}
                placeholder="e.g., 41.8781"
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={location.longitude || ""}
                placeholder="e.g., -87.6298"
              />
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
    </div>
  );
}
