"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

export interface VenueWithDetails {
  id: string;
  name: string | null;
  spaceLabel: string | null;
  venueType: string | null;
  locationId: string;
  locationName: string;
  locationCode: string;
  isOnline: boolean | null;
  addressId: string | null;
  addressLabel: string | null;
  city: string | null;
  country: string | null;
  fullAddress: string | null;
}

interface VenueSelectProps {
  venues: VenueWithDetails[];
  defaultValue?: string | null;
  value?: string | null;
  onChange?: (venueId: string) => void;
  name?: string;
  label?: string;
  required?: boolean;
}

export function VenueSelect({
  venues,
  defaultValue,
  value,
  onChange,
  name = "venueId",
  label = "Venue",
  required = false,
}: VenueSelectProps) {
  const [search, setSearch] = useState("");
  // Support both controlled (value/onChange) and uncontrolled (defaultValue) modes
  const [internalSelectedId, setInternalSelectedId] = useState<string>(defaultValue || "");
  const selectedId = value !== undefined ? (value || "") : internalSelectedId;
  const setSelectedId = (id: string) => {
    if (onChange) {
      onChange(id);
    } else {
      setInternalSelectedId(id);
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  const filteredVenues = useMemo(() => {
    if (!search) return venues;
    const searchLower = search.toLowerCase();
    return venues.filter(
      (venue) =>
        venue.locationName.toLowerCase().includes(searchLower) ||
        venue.locationCode.toLowerCase().includes(searchLower) ||
        venue.spaceLabel?.toLowerCase().includes(searchLower) ||
        venue.name?.toLowerCase().includes(searchLower) ||
        venue.city?.toLowerCase().includes(searchLower) ||
        venue.country?.toLowerCase().includes(searchLower)
    );
  }, [venues, search]);

  const selectedVenue = venues.find((v) => v.id === selectedId);

  // Format venue display: "Location Name - Room (City, Country)" or "Location Name - Online"
  const getVenueLabel = (venue: VenueWithDetails) => {
    const parts = [venue.locationName];

    if (venue.spaceLabel) {
      parts[0] = `${venue.locationName} - ${venue.spaceLabel}`;
    } else if (venue.name) {
      parts[0] = `${venue.locationName} - ${venue.name}`;
    }

    if (venue.isOnline) {
      return `${parts[0]} (Online)`;
    }

    if (venue.city || venue.country) {
      const location = [venue.city, venue.country].filter(Boolean).join(", ");
      return `${parts[0]} (${location})`;
    }

    return parts[0];
  };

  // Shorter display for selected value
  const getSelectedLabel = (venue: VenueWithDetails) => {
    if (venue.spaceLabel) {
      return `${venue.locationName} - ${venue.spaceLabel}`;
    }
    if (venue.name) {
      return `${venue.locationName} - ${venue.name}`;
    }
    return venue.locationName;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search venues by location, room, or city..."
          value={isOpen ? search : (selectedVenue ? getSelectedLabel(selectedVenue) : "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={selectedId} />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {!required && (
              <div
                className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
                onClick={() => {
                  setSelectedId("");
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                <span className="text-muted-foreground">None</span>
              </div>
            )}
            {filteredVenues.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No venues found
              </div>
            ) : (
              filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm ${
                    selectedId === venue.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(venue.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium">
                    {venue.locationName}
                    {venue.spaceLabel && (
                      <span className="font-normal text-muted-foreground"> - {venue.spaceLabel}</span>
                    )}
                    {!venue.spaceLabel && venue.name && (
                      <span className="font-normal text-muted-foreground"> - {venue.name}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {venue.isOnline ? (
                      <span className="text-blue-600">Online</span>
                    ) : venue.city || venue.country ? (
                      <span>{[venue.city, venue.country].filter(Boolean).join(", ")}</span>
                    ) : (
                      <span>No address</span>
                    )}
                    {venue.venueType && (
                      <span className="ml-2 px-1 py-0.5 bg-muted rounded text-xs">
                        {venue.venueType}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
