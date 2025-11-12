"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectWithCreate } from "@/components/multi-select-with-create";
import { updateEvent } from "@/lib/actions";
import type { Event, Topic, Category, Location } from "@/lib/db/schema";

interface EditEventFormProps {
  event: Event;
  eventsList: Event[];
  parentEvent: Event | null;
  allTopics: Topic[];
  allCategories: Category[];
  allLocations: Location[];
  selectedTopicIds: string[];
  selectedCategoryIds: string[];
}

export function EditEventForm({
  event,
  eventsList,
  parentEvent,
  allTopics,
  allCategories,
  allLocations,
  selectedTopicIds: initialTopicIds,
  selectedCategoryIds: initialCategoryIds,
}: EditEventFormProps) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/events/${event.id}`}
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to Event
        </Link>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">{event.eventName}</p>
      </div>

      <form action={updateEvent.bind(null, event.id)} className="space-y-8">
        {/* Basic Information */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <MultiSelectWithCreate
                name="categoryIds"
                label="Categories"
                availableItems={allCategories}
                selectedIds={selectedCategoryIds}
                onSelectionChange={setSelectedCategoryIds}
              />
            </div>

            <div className="md:col-span-2">
              <MultiSelectWithCreate
                name="topicIds"
                label="Topics"
                availableItems={allTopics}
                selectedIds={selectedTopicIds}
                onSelectionChange={setSelectedTopicIds}
              />
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
              <Label htmlFor="locationId">Location</Label>
              <select
                id="locationId"
                name="locationId"
                defaultValue={event.locationId || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a location...</option>
                {allLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Select from existing locations. <Link href="/locations/new" className="text-blue-600 hover:underline">Create new location</Link> if needed.
              </p>
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/events/${event.id}`}>Cancel</Link>
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
