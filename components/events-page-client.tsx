"use client";

import { useState } from "react";
import Link from "next/link";
import { ExpandableEventRow } from "./expandable-event-row";
import { EventsBulkEditModal } from "./events-bulk-edit-modal";
import { Button } from "./ui/button";
import type { Event } from "@/lib/db/schema";

type EventRow = {
  event: Event;
  parentEventName: string | null;
  locationName: string | null;
  sessionCount: number;
  assetCount: number;
  childEventCount: number;
};

type EventsPageClientProps = {
  eventsList: EventRow[];
  locations: { id: string; name: string }[];
  availableTypes: string[];
  offset: number;
  sortBy: string;
  sortOrder: string;
  searchParams: Record<string, string | undefined>;
};

export function EventsPageClient({
  eventsList,
  locations,
  availableTypes,
  offset,
  sortBy,
  sortOrder,
  searchParams,
}: EventsPageClientProps) {
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  const getSortUrl = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value != null && value !== "") params.set(key, value);
    });
    params.set("sortBy", column);
    params.set("sortOrder", newSortOrder);
    params.delete("page");
    return `/events?${params}`;
  };

  const SortableHeader = ({ column, children }: { column: string; children: React.ReactNode }) => {
    const isActive = sortBy === column;
    return (
      <th className="px-4 py-3 text-left text-sm font-medium">
        <Link
          href={getSortUrl(column)}
          className="flex items-center gap-1 hover:underline group cursor-pointer"
        >
          {children}
          {isActive ? (
            <span className="text-xs font-bold">
              {sortOrder === "asc" ? "\u2191" : "\u2193"}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
              {"\u2195"}
            </span>
          )}
        </Link>
      </th>
    );
  };

  const allEventIds = eventsList.map((e) => e.event.id);
  const allSelected = allEventIds.length > 0 && allEventIds.every((id) => selectedEventIds.includes(id));
  const someSelected = selectedEventIds.length > 0 && !allSelected;

  const handleToggleEvent = (eventId: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(allEventIds);
    }
  };

  const handleBulkEditSuccess = () => {
    setSelectedEventIds([]);
    window.location.reload();
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedEventIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-blue-900">
                {selectedEventIds.length} event{selectedEventIds.length !== 1 ? "s" : ""} selected
              </div>
              <button
                onClick={() => setSelectedEventIds([])}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowBulkEditModal(true)}
                size="sm"
                variant="outline"
              >
                Edit Fields
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleToggleAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium w-16">#</th>
              <SortableHeader column="eventName">Event Name</SortableHeader>
              <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
              <SortableHeader column="eventDateStart">Date Range</SortableHeader>
              <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Child Events</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Sessions</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Assets</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventsList.map(({ event, parentEventName, locationName, sessionCount, assetCount, childEventCount }, index) => (
              <ExpandableEventRow
                key={event.id}
                event={event}
                parentEventName={parentEventName}
                locationName={locationName}
                childEventCount={childEventCount}
                sessionCount={sessionCount}
                assetCount={assetCount}
                index={index + offset}
                isSelected={selectedEventIds.includes(event.id)}
                onToggleSelect={() => handleToggleEvent(event.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {eventsList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No events found. Create your first event to get started.
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <EventsBulkEditModal
          selectedEventIds={selectedEventIds}
          locations={locations}
          availableTypes={availableTypes}
          onClose={() => setShowBulkEditModal(false)}
          onSuccess={handleBulkEditSuccess}
        />
      )}
    </>
  );
}
