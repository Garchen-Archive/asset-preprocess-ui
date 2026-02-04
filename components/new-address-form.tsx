"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export function NewAddressForm({
  locationId,
  locationName,
  hasPrimaryAddress,
  hasAnyAddresses,
  action,
}: {
  locationId: string;
  locationName: string;
  hasPrimaryAddress: boolean;
  hasAnyAddresses: boolean;
  action: (formData: FormData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    const isPrimary = formData.get("isPrimary") === "on";
    if (isPrimary && hasPrimaryAddress) {
      const confirmed = confirm(
        "This location already has a primary address. Creating this address as primary will replace the current one. Continue?"
      );
      if (!confirmed) return;
    }
    action(formData);
  };

  return (
    <form action={handleSubmit} ref={formRef} className="space-y-6">
      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Address Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              placeholder='e.g., "Main Center", "Retreat Land"'
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="fullAddress">Full Address</Label>
            <Input
              id="fullAddress"
              name="fullAddress"
              placeholder="Complete address"
            />
          </div>

          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" placeholder="City" />
          </div>

          <div>
            <Label htmlFor="stateProvince">State/Province</Label>
            <Input id="stateProvince" name="stateProvince" placeholder="State or Province" />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" placeholder="Country" />
          </div>

          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" name="postalCode" placeholder="Postal/ZIP code" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Geographic Coordinates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" type="number" step="any" placeholder="e.g., 41.8781" />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" type="number" step="any" placeholder="e.g., -87.6298" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Link Settings</h2>
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
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              id="isPrimary"
              name="isPrimary"
              type="checkbox"
              defaultChecked={!hasAnyAddresses}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isPrimary" className="mb-0">Primary address for this location</Label>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <Textarea id="notes" name="notes" placeholder="Additional notes about this address" rows={3} />
      </div>

      <div className="flex gap-4">
        <Button type="submit">Create & Add Address</Button>
        <Button type="button" variant="outline" asChild>
          <Link href={`/locations/${locationId}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
