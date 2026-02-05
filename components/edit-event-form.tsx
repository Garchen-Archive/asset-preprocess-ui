"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectWithCreate } from "@/components/multi-select-with-create";
import { VenueSelect, type VenueWithDetails } from "@/components/venue-select";
import { OrgSelect } from "@/components/org-select";
import { updateEvent } from "@/lib/actions";
import type { Event, Topic, Category, Organization } from "@/lib/db/schema";

interface EditEventFormProps {
  event: Event;
  eventsList: Event[];
  parentEvent: Event | null;
  allTopics: Topic[];
  allCategories: Category[];
  allOrganizations: Organization[];
  allVenues: VenueWithDetails[];
  orgLocationMappings: { organizationId: string; locationId: string }[];
  selectedTopicIds: string[];
  selectedCategoryIds: string[];
}

export function EditEventForm({
  event,
  eventsList,
  parentEvent,
  allTopics,
  allCategories,
  allOrganizations,
  allVenues,
  orgLocationMappings,
  selectedTopicIds: initialTopicIds,
  selectedCategoryIds: initialCategoryIds,
}: EditEventFormProps) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);

  // Controlled state for organization fields
  const [hostOrganizationId, setHostOrganizationId] = useState(event.hostOrganizationId || "");
  const [organizerOrganizationId, setOrganizerOrganizationId] = useState(event.organizerOrganizationId || "");
  const [onlineHostOrganizationId, setOnlineHostOrganizationId] = useState(event.onlineHostOrganizationId || "");
  const [venueId, setVenueId] = useState(event.venueId || "");
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [showSpaceOverride, setShowSpaceOverride] = useState(!!event.spaceLabel);

  // Get the selected venue details
  const selectedVenue = allVenues.find((v) => v.id === venueId);

  // Get host org's locations and venues
  const hostOrgLocationIds = orgLocationMappings
    .filter((m) => m.organizationId === hostOrganizationId)
    .map((m) => m.locationId);
  const hostOrgVenues = allVenues.filter((v) => hostOrgLocationIds.includes(v.locationId));

  // Check if selected venue belongs to host org
  const venueIsFromHostOrg = selectedVenue && hostOrgLocationIds.includes(selectedVenue.locationId);

  // Auto-select venue when host org changes
  const handleHostOrgChange = (newHostOrgId: string) => {
    setHostOrganizationId(newHostOrgId);
    setShowVenuePicker(false);

    // Auto-select venue from host org's location
    if (newHostOrgId) {
      const newOrgLocationIds = orgLocationMappings
        .filter((m) => m.organizationId === newHostOrgId)
        .map((m) => m.locationId);

      if (newOrgLocationIds.length > 0) {
        const matchingVenue = allVenues.find((v) => newOrgLocationIds.includes(v.locationId));
        if (matchingVenue) {
          setVenueId(matchingVenue.id);
        }
      }
    }
  };

  // Use host org's venue
  const useHostOrgVenue = () => {
    if (hostOrgVenues.length > 0) {
      setVenueId(hostOrgVenues[0].id);
      setShowVenuePicker(false);
    }
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

        {/* Orgs & Venue */}
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Orgs & Venue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <OrgSelect
                organizations={allOrganizations}
                name="hostOrganizationId"
                label="Host Org"
                value={hostOrganizationId}
                onChange={handleHostOrgChange}
                placeholder="Search host org..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                The org hosting this event at their location. <Link href="/organizations/new" className="text-blue-600 hover:underline">Create new</Link>
              </p>
            </div>

            <div className="md:col-span-2">
              <OrgSelect
                organizations={allOrganizations}
                name="onlineHostOrganizationId"
                label="Online Host Org (optional)"
                value={onlineHostOrganizationId}
                onChange={setOnlineHostOrganizationId}
                placeholder="Search online host org..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Org responsible for online streaming/hosting (Zoom, YouTube, etc.)
              </p>
            </div>

            <div className="md:col-span-2 opacity-50">
              <OrgSelect
                organizations={allOrganizations}
                name="organizerOrganizationId"
                label="Organizer Org (optional, for future use)"
                value={organizerOrganizationId}
                onChange={setOrganizerOrganizationId}
                placeholder="Search organizer org..."
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Org that organized/sponsored this event (often same as host)
              </p>
            </div>

            {/* Venue Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <Label className="mb-2 block">Venue</Label>

              {/* Hidden input for form submission */}
              <input type="hidden" name="venueId" value={venueId} />

              {/* Show venue card when a venue is selected and not in picker mode */}
              {selectedVenue && !showVenuePicker ? (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-base">
                        {selectedVenue.locationName}
                        {selectedVenue.spaceLabel && (
                          <span className="text-muted-foreground font-normal"> — {selectedVenue.spaceLabel}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedVenue.isOnline ? (
                          <span className="text-blue-600">Online venue</span>
                        ) : selectedVenue.fullAddress ? (
                          <span>{selectedVenue.fullAddress}</span>
                        ) : selectedVenue.city || selectedVenue.country ? (
                          <span>{[selectedVenue.city, selectedVenue.country].filter(Boolean).join(", ")}</span>
                        ) : (
                          <span className="italic">No address</span>
                        )}
                      </div>
                      {venueIsFromHostOrg && (
                        <div className="text-xs text-green-600 mt-2">
                          ✓ From host org&apos;s location
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => setShowVenuePicker(true)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVenueId(""); setShowVenuePicker(false); }}
                        className="text-sm text-muted-foreground hover:text-red-600"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              ) : showVenuePicker ? (
                /* Venue picker mode */
                <div className="space-y-3">
                  <VenueSelect
                    venues={allVenues}
                    value={venueId}
                    onChange={(id) => {
                      setVenueId(id);
                      if (id) setShowVenuePicker(false);
                    }}
                    name=""
                    label=""
                  />
                  <div className="flex gap-2">
                    {hostOrgVenues.length > 0 && !venueIsFromHostOrg && (
                      <button
                        type="button"
                        onClick={useHostOrgVenue}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Use host org venue
                      </button>
                    )}
                    {selectedVenue && (
                      <button
                        type="button"
                        onClick={() => setShowVenuePicker(false)}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* No venue selected */
                <div className="rounded-lg border-2 border-dashed p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">No venue selected</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {hostOrgVenues.length > 0 ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          onClick={useHostOrgVenue}
                        >
                          Use Host Org Venue
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setShowVenuePicker(true)}
                        >
                          Choose Different
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setShowVenuePicker(true)}
                      >
                        Select Venue
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                <Link href="/locations" className="text-blue-600 hover:underline">Manage locations & venues</Link>
              </p>
            </div>

            {/* Space Override - collapsed by default */}
            <div className="md:col-span-2">
              {!showSpaceOverride ? (
                <button
                  type="button"
                  onClick={() => setShowSpaceOverride(true)}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  + Override room/space
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label htmlFor="spaceLabel">Space Override</Label>
                    <button
                      type="button"
                      onClick={() => setShowSpaceOverride(false)}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Hide
                    </button>
                  </div>
                  <Input
                    id="spaceLabel"
                    name="spaceLabel"
                    defaultValue={event.spaceLabel || ""}
                    placeholder="e.g., Main Hall, Room 201"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only if different from the venue&apos;s default
                  </p>
                </div>
              )}
              {!showSpaceOverride && <input type="hidden" name="spaceLabel" value={event.spaceLabel || ""} />}
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
