"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { formatDateRange } from "@/lib/utils";

export interface EventOption {
  id: string;
  eventName: string;
  eventDateStart?: string | null;
  eventDateEnd?: string | null;
  eventType?: string | null;
}

interface EventSelectProps {
  events: EventOption[];
  value?: string;
  onChange?: (eventId: string) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function EventSelect({
  events,
  value = "",
  onChange,
  name,
  label,
  placeholder = "Search events...",
  disabled = false,
}: EventSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const dateRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return null;
    return formatDateRange(start, end);
  };

  const filteredEvents = useMemo(() => {
    if (!search) return events;
    const searchLower = search.toLowerCase();
    return events.filter((e) =>
      e.eventName.toLowerCase().includes(searchLower) ||
      (e.eventType && e.eventType.toLowerCase().includes(searchLower)) ||
      (e.eventDateStart && e.eventDateStart.includes(search))
    );
  }, [events, search]);

  const selectedEvent = events.find((e) => e.id === value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={isOpen ? search : (selectedEvent ? selectedEvent.eventName : "")}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
        />

        {name && <input type="hidden" name={name} value={value} />}

        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
            <div
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
              onClick={() => {
                onChange?.("");
                setSearch("");
                setIsOpen(false);
              }}
            >
              <span className="text-muted-foreground">None</span>
            </div>
            {filteredEvents.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No events found
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm ${
                    value === event.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    onChange?.(event.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <div>{event.eventName}</div>
                  {(event.eventDateStart || event.eventType) && (
                    <div className="text-xs text-muted-foreground">
                      {[event.eventType, dateRange(event.eventDateStart, event.eventDateEnd)]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected event details */}
      {selectedEvent && !isOpen && (
        <div className="text-xs text-muted-foreground mt-1.5 space-y-0.5 pl-1">
          <div className="flex flex-wrap gap-x-3">
            {selectedEvent.eventType && (
              <span><span className="opacity-50">Type:</span> {selectedEvent.eventType}</span>
            )}
            {(selectedEvent.eventDateStart || selectedEvent.eventDateEnd) && (
              <span><span className="opacity-50">Date:</span> {dateRange(selectedEvent.eventDateStart, selectedEvent.eventDateEnd)}</span>
            )}
          </div>
          <div>
            <span className="opacity-50">ID:</span>{" "}
            <a
              href={`/events/${selectedEvent.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] hover:text-blue-600"
            >
              {selectedEvent.id}
            </a>
          </div>
        </div>
      )}

      {isOpen && !disabled && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
