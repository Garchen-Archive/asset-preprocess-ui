import { createLocation } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import Link from "next/link";

export default function NewLocationPage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Locations", href: "/locations" },
    { label: "New Location" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Create New Location</h1>
        <p className="text-muted-foreground">
          Add a new teaching center, dharma center, or venue
        </p>
      </div>

      <form action={createLocation} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., GBI"
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
                placeholder="e.g., Garchen Buddhist Institute"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="alternativeNames">Alternative Names</Label>
              <Input
                id="alternativeNames"
                name="alternativeNames"
                placeholder="Comma-separated alternative names or translations"
              />
            </div>

            <div>
              <Label htmlFor="locationType">Location Type</Label>
              <select
                id="locationType"
                name="locationType"
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
          <h2 className="text-xl font-semibold mb-4">Geographic Coordinates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
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
                placeholder="Brief description of the location"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes or context"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Create Location</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/locations">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
