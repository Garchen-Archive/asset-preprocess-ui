"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";

interface Session {
  id: string;
  sessionName: string;
  sessionId: string;
  eventId: string | null;
}

interface Event {
  id: string;
  eventName: string;
}

interface SessionWithHierarchy {
  session: Session;
  event: Event | null;
}

interface SessionSelectProps {
  sessions: SessionWithHierarchy[];
  defaultValue?: string | null;
  name?: string;
  label?: string;
}

export function SessionSelect({
  sessions,
  defaultValue,
  name = "sessionId",
  label = "Session",
}: SessionSelectProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(defaultValue || "");
  const [isOpen, setIsOpen] = useState(false);

  const filteredSessions = useMemo(() => {
    if (!search) return sessions;
    const searchLower = search.toLowerCase();
    return sessions.filter(
      ({ session, event }) =>
        session.sessionName.toLowerCase().includes(searchLower) ||
        session.sessionId.toLowerCase().includes(searchLower) ||
        event?.eventName.toLowerCase().includes(searchLower)
    );
  }, [sessions, search]);

  const selectedSession = sessions.find((s) => s.session.id === selectedId);

  const getHierarchyLabel = (item: SessionWithHierarchy) => {
    const parts = [];
    if (item.event) parts.push(item.event.eventName);
    parts.push(item.session.sessionName);
    return parts.join(" > ");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search by event or session..."
          value={isOpen ? search : (selectedSession ? getHierarchyLabel(selectedSession) : "")}
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
            {filteredSessions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No sessions found
              </div>
            ) : (
              filteredSessions.map((item) => (
                <div
                  key={item.session.id}
                  className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm ${
                    selectedId === item.session.id ? "bg-accent" : ""
                  }`}
                  onClick={() => {
                    setSelectedId(item.session.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <div className="font-medium">{item.session.sessionName}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.event && <span>{item.event.eventName}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {item.session.sessionId}
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
