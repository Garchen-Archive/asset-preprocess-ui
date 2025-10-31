import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent } from "@/lib/actions";
import { db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/events"
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to Events
        </Link>
        <h1 className="text-3xl font-bold">Create New Event</h1>
      </div>

      <form action={createEvent} className="space-y-8">
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
                placeholder="e.g., 2024-summer-retreat"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                name="eventName"
                required
                placeholder="e.g., Summer Retreat 2024"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="parentEventId">Parent Event</Label>
              <select
                id="parentEventId"
                name="parentEventId"
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
                placeholder="e.g., Retreat, Teaching, Empowerment"
              />
            </div>

            <div>
              <Label htmlFor="eventDateStart">Start Date</Label>
              <Input id="eventDateStart" name="eventDateStart" type="date" />
            </div>

            <div>
              <Label htmlFor="eventDateEnd">End Date</Label>
              <Input id="eventDateEnd" name="eventDateEnd" type="date" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g., Dharma Teaching, Practice Session"
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
                placeholder="e.g., Bodhichitta, Six Perfections"
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
                placeholder="Event description"
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
                placeholder="e.g., Garchen Buddhist Institute"
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

            <div className="md:col-span-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" placeholder="Country" />
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>

            <div>
              <Label htmlFor="createdBy">Created By</Label>
              <Input id="createdBy" name="createdBy" placeholder="Your name" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/events">Cancel</Link>
          </Button>
          <Button type="submit">Create Event</Button>
        </div>
      </form>
    </div>
  );
}
