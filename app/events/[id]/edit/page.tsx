import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { eq, asc, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateEvent } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, params.id))
    .limit(1);

  if (!event) {
    notFound();
  }

  // Get all events except the current one for parent event selector
  const eventsList = await db
    .select()
    .from(events)
    .where(ne(events.id, params.id))
    .orderBy(asc(events.eventName));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/events/${params.id}`}
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">{event.eventName}</p>
      </div>

      <form action={updateEvent.bind(null, params.id)} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="eventId">Event ID *</Label>
              <Input
                id="eventId"
                name="eventId"
                required
                defaultValue={event.eventId}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                name="eventName"
                required
                defaultValue={event.eventName}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="parentEventId">Parent Event</Label>
              <select
                id="parentEventId"
                name="parentEventId"
                defaultValue={event.parentEventId || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">None (Top-level event)</option>
                {eventsList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.eventName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Optional: Select a parent event to create a hierarchical structure
              </p>
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Input
                id="eventType"
                name="eventType"
                defaultValue={event.eventType || ""}
              />
            </div>

            <div>
              <Label htmlFor="eventDateStart">Start Date</Label>
              <Input
                id="eventDateStart"
                name="eventDateStart"
                type="date"
                defaultValue={event.eventDateStart || ""}
              />
            </div>

            <div>
              <Label htmlFor="eventDateEnd">End Date</Label>
              <Input
                id="eventDateEnd"
                name="eventDateEnd"
                type="date"
                defaultValue={event.eventDateEnd || ""}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={event.category || ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-delimited categories
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                defaultValue={event.topic || ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-delimited topics
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                name="eventDescription"
                defaultValue={event.eventDescription || ""}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="centerName">Center Name</Label>
              <Input
                id="centerName"
                name="centerName"
                defaultValue={event.centerName || ""}
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={event.city || ""} />
            </div>

            <div>
              <Label htmlFor="stateProvince">State/Province</Label>
              <Input
                id="stateProvince"
                name="stateProvince"
                defaultValue={event.stateProvince || ""}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={event.country || ""} />
            </div>
          </div>
        </div>

        {/* Administrative */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Administrative</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="catalogingStatus">Cataloging Status</Label>
              <select
                id="catalogingStatus"
                name="catalogingStatus"
                defaultValue={event.catalogingStatus || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={event.notes || ""}
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="additionalMetadata">Additional Metadata (JSON)</Label>
              <Textarea
                id="additionalMetadata"
                name="additionalMetadata"
                defaultValue={event.additionalMetadata ? JSON.stringify(event.additionalMetadata, null, 2) : ""}
                placeholder='{"key": "value"}'
                rows={6}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter valid JSON for additional metadata fields
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/events/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
