"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectWithCreate } from "@/components/multi-select-with-create";
import { updateEvent } from "@/lib/actions";
import type { Event, Topic, Category, Location, Address } from "@/lib/db/schema";

type LocationAddressLink = {
  locationId: string;
  addressId: string;
  isPrimary: boolean | null;
};

interface EditEventFormProps {
  event: Event;
  eventsList: Event[];
  parentEvent: Event | null;
  allTopics: Topic[];
  allCategories: Category[];
  allLocations: Location[];
  allAddresses: Address[];
  locationAddressLinks: LocationAddressLink[];
  selectedTopicIds: string[];
  selectedCategoryIds: string[];
}

function getAddressLabel(addr: Address): string {
  const label = addr.label ? `${addr.label} — ` : "";
  const detail = addr.fullAddress || [addr.city, addr.country].filter(Boolean).join(", ") || addr.id.slice(0, 8);
  return `${label}${detail}`;
}

export function EditEventForm({
  event,
  eventsList,
  parentEvent,
  allTopics,
  allCategories,
  allLocations,
  allAddresses,
  locationAddressLinks,
  selectedTopicIds: initialTopicIds,
  selectedCategoryIds: initialCategoryIds,
}: EditEventFormProps) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);

  // Derive initial venue location from the event's current venueAddressId
  const deriveVenueLocationId = (): string => {
    if (event.venueAddressId) {
      const link = locationAddressLinks.find((l) => l.addressId === event.venueAddressId);
      if (link) return link.locationId;
    }
    return event.locationId || "";
  };

  // Controlled state for location fields
  const [selectedLocationId, setSelectedLocationId] = useState(event.locationId || "");
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(event.organizerId || "");
  const [venueLocationId, setVenueLocationId] = useState(deriveVenueLocationId);
  const [venueAddressId, setVenueAddressId] = useState(event.venueAddressId || "");
  const [venueLocationManuallyChanged, setVenueLocationManuallyChanged] = useState(
    // If venue address belongs to a different location than host, consider it manually set
    deriveVenueLocationId() !== (event.locationId || "")
  );

  // Get addresses linked to the selected venue location
  const venueLinkedAddressIds = locationAddressLinks
    .filter((link) => link.locationId === venueLocationId)
    .map((link) => link.addressId);
  const venueAddresses = allAddresses.filter((addr) => venueLinkedAddressIds.includes(addr.id));

  // Find primary address for a location
  const findPrimaryAddressId = (locId: string): string => {
    const primaryLink = locationAddressLinks.find(
      (link) => link.locationId === locId && link.isPrimary
    );
    if (primaryLink) return primaryLink.addressId;
    const firstLink = locationAddressLinks.find((link) => link.locationId === locId);
    return firstLink?.addressId || "";
  };

  const handleLocationChange = (newLocationId: string) => {
    setSelectedLocationId(newLocationId);
    if (!venueLocationManuallyChanged) {
      setVenueLocationId(newLocationId);
      setVenueAddressId(newLocationId ? findPrimaryAddressId(newLocationId) : "");
    }
  };

  const handleVenueLocationChange = (newVenueLocationId: string) => {
    setVenueLocationId(newVenueLocationId);
    setVenueLocationManuallyChanged(true);
    setVenueAddressId(newVenueLocationId ? findPrimaryAddressId(newVenueLocationId) : "");
  };

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

        {/* Location & Venue */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Location & Venue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="locationId">Host Location</Label>
              <select
                id="locationId"
                name="locationId"
                value={selectedLocationId}
                onChange={(e) => handleLocationChange(e.target.value)}
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

            <div className="md:col-span-2">
              <Label htmlFor="organizerId">Organizer</Label>
              <select
                id="organizerId"
                name="organizerId"
                value={selectedOrganizerId}
                onChange={(e) => setSelectedOrganizerId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select an organizer...</option>
                {allLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Organization that organized this event. <Link href="/locations/new" className="text-blue-600 hover:underline">Create new organizer location</Link> if needed.
              </p>
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <Label htmlFor="venueLocation">Venue Location</Label>
              <select
                id="venueLocation"
                value={venueLocationId}
                onChange={(e) => handleVenueLocationChange(e.target.value)}
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
                Defaults to the host location. Change if the venue is at a different location.
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="venueAddressId">Venue Address</Label>
              {venueLocationId ? (
                venueAddresses.length > 0 ? (
                  <select
                    id="venueAddressId"
                    name="venueAddressId"
                    value={venueAddressId}
                    onChange={(e) => setVenueAddressId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select an address...</option>
                    {venueAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {getAddressLabel(addr)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/30">
                      No addresses linked to this location.{" "}
                      <Link
                        href={`/locations/${venueLocationId}`}
                        className="text-blue-600 hover:underline"
                      >
                        Add an address
                      </Link>
                    </div>
                    <input type="hidden" name="venueAddressId" value="" />
                  </>
                )
              ) : (
                <>
                  <div className="text-sm text-muted-foreground border rounded-md px-3 py-2 bg-muted/30">
                    Select a venue location first to see available addresses.
                  </div>
                  <input type="hidden" name="venueAddressId" value="" />
                </>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Specific physical address where this event takes place.
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
