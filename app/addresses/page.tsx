import { db } from "@/lib/db/client";
import { addresses } from "@/lib/db/schema";
import { desc, ilike, or, and, sql, isNull } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || "";

  const conditions = [isNull(addresses.deletedAt)];

  if (search) {
    conditions.push(
      or(
        ilike(addresses.label, `%${search}%`),
        ilike(addresses.city, `%${search}%`),
        ilike(addresses.country, `%${search}%`),
        ilike(addresses.fullAddress, `%${search}%`)
      )!
    );
  }

  const addressList = await db
    .select()
    .from(addresses)
    .where(and(...conditions))
    .orderBy(desc(addresses.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">Manage all addresses</p>
        </div>
        <Button asChild>
          <Link href="/addresses/new">Create Address</Link>
        </Button>
      </div>

      <form className="rounded-lg border p-4">
        <div className="flex gap-4">
          <Input
            name="search"
            placeholder="Search by label, city, country..."
            defaultValue={search}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/addresses">Clear</Link>
          </Button>
        </div>
      </form>

      <div className="text-sm text-muted-foreground">
        Showing {addressList.length} addresses
        {search && ` matching "${search}"`}
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Label</th>
              <th className="px-4 py-3 text-left text-sm font-medium">City</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Country</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Full Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addressList.map((addr) => (
              <tr key={addr.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium">{addr.label || "—"}</td>
                <td className="px-4 py-3 text-sm">{addr.city || "—"}</td>
                <td className="px-4 py-3 text-sm">{addr.country || "—"}</td>
                <td className="px-4 py-3 text-sm truncate max-w-xs">{addr.fullAddress || "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/addresses/${addr.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addressList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No addresses found.
        </div>
      )}
    </div>
  );
}
