"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { unlinkAddressFromLocation, setLocationAddressPrimary } from "@/lib/actions";

interface LinkedAddress {
  linkId: string;
  isPrimary: boolean | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  addressId: string;
  label: string | null;
  city: string | null;
  stateProvince: string | null;
  country: string | null;
  fullAddress: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function LocationAddressTable({
  addresses,
  locationId,
}: {
  addresses: LinkedAddress[];
  locationId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const hasPrimaryAddress = addresses.some((a) => a.isPrimary);

  const handleSetPrimary = (linkId: string) => {
    if (hasPrimaryAddress) {
      const confirmed = confirm(
        "This location already has a primary address. Setting this address as primary will replace the current one. Continue?"
      );
      if (!confirmed) return;
    }
    startTransition(() => {
      setLocationAddressPrimary(linkId, locationId);
    });
  };

  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium">Label</th>
            <th className="px-4 py-3 text-left text-sm font-medium">City</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Country</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Effective Dates</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((addr) => (
            <tr key={addr.linkId} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3 text-sm">
                <Link
                  href={`/addresses/${addr.addressId}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {addr.label || addr.fullAddress || "Address"}
                </Link>
                {addr.fullAddress && addr.label && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                    {addr.fullAddress}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-sm">{addr.city || "—"}</td>
              <td className="px-4 py-3 text-sm">{addr.country || "—"}</td>
              <td className="px-4 py-3 text-sm">
                {addr.effectiveFrom || addr.effectiveTo ? (
                  <span className="text-xs">
                    {addr.effectiveFrom}
                    {addr.effectiveFrom && addr.effectiveTo && " — "}
                    {addr.effectiveTo ? addr.effectiveTo : addr.effectiveFrom ? " (Current)" : ""}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                {addr.isPrimary ? (
                  <Badge variant="default" className="text-xs">Primary</Badge>
                ) : (
                  <button
                    onClick={() => handleSetPrimary(addr.linkId)}
                    disabled={isPending}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50"
                  >
                    {isPending ? "Setting..." : "Set Primary"}
                  </button>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/locations/${locationId}/addresses/${addr.linkId}/edit`}>Edit</Link>
                  </Button>
                  <form action={unlinkAddressFromLocation.bind(null, addr.linkId, locationId)}>
                    <Button size="sm" variant="ghost" type="submit" className="text-destructive">
                      Remove
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
