import { db } from "@/lib/db/client";
import { locations, locationAddresses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAddressAndLinkToLocation } from "@/lib/actions";
import { Breadcrumbs, BreadcrumbItem } from "@/components/breadcrumbs";
import { NewAddressForm } from "@/components/new-address-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewLocationAddressPage({
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

  // Check if there's already a primary address
  const existingLinks = await db
    .select({ id: locationAddresses.id, isPrimary: locationAddresses.isPrimary })
    .from(locationAddresses)
    .where(eq(locationAddresses.locationId, params.id));

  const hasAnyAddresses = existingLinks.length > 0;
  const hasPrimaryAddress = existingLinks.some((l) => l.isPrimary);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Locations", href: "/locations" },
    { label: location.name, href: `/locations/${params.id}` },
    { label: "Add Address" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold">Add Address</h1>
        <p className="text-muted-foreground">
          Create a new address and add it to {location.name}
        </p>
      </div>

      <NewAddressForm
        locationId={params.id}
        locationName={location.name}
        hasPrimaryAddress={hasPrimaryAddress}
        hasAnyAddresses={hasAnyAddresses}
        action={createAddressAndLinkToLocation.bind(null, params.id)}
      />
    </div>
  );
}
