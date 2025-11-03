"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/lib/db/schema";

interface Session {
  id: string;
  sessionId: string;
  sessionName: string;
  sessionDate: string | null;
  sequenceInEvent: number | null;
}

interface ExpandableEventRowProps {
  event: Event;
  sessionCount: number;
  assetCount: number;
  index: number;
}

export function ExpandableEventRow({
  event,
  sessionCount,
  assetCount,
  index,
}: ExpandableEventRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleRowClick = async () => {
    if (!isExpanded && sessionCount > 0 && sessions.length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/events/${event.id}/sessions`);
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <tr
        className="border-b hover:bg-muted/50 cursor-pointer"
        onClick={handleRowClick}
      >
        <td className="px-4 py-3 text-sm text-muted-foreground">
          {sessionCount > 0 && (
            <span className="mr-2">{isExpanded ? "▼" : "▶"}</span>
          )}
          {index + 1}
        </td>
        <td className="px-4 py-3 text-sm font-mono">{event.eventId}</td>
        <td className="px-4 py-3 text-sm">{event.eventName}</td>
        <td className="px-4 py-3 text-sm">{event.eventType || "—"}</td>
        <td className="px-4 py-3 text-sm">
          {event.eventDateStart && event.eventDateEnd
            ? `${event.eventDateStart} to ${event.eventDateEnd}`
            : event.eventDateStart || "—"}
        </td>
        <td className="px-4 py-3 text-sm">
          {event.city && event.country
            ? `${event.city}, ${event.country}`
            : event.country || "—"}
        </td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              sessionCount > 0
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {sessionCount}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              assetCount > 0
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {assetCount}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              event.catalogingStatus === "Ready"
                ? "bg-green-100 text-green-700"
                : event.catalogingStatus === "In Progress"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {event.catalogingStatus || "Not Started"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/events/${event.id}`}
            className="text-blue-600 hover:underline"
          >
            View
          </Link>
        </td>
      </tr>
      {isExpanded && sessionCount > 0 && (
        <tr>
          <td colSpan={10} className="px-4 py-2 bg-muted/30">
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-2">
                Loading sessions...
              </div>
            ) : (
              <div className="pl-8 py-2 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground mb-2">
                  Sessions ({sessionCount}):
                </div>
                {sessions.map((session) => (
                  <div key={session.id} className="text-sm">
                    <Link
                      href={`/sessions/${session.id}`}
                      className="text-blue-600 hover:underline inline-flex items-center gap-2"
                    >
                      <span className="font-mono text-xs text-muted-foreground">
                        {session.sequenceInEvent
                          ? `#${session.sequenceInEvent}`
                          : "—"}
                      </span>
                      <span>{session.sessionName}</span>
                      {session.sessionDate && (
                        <span className="text-xs text-muted-foreground">
                          ({session.sessionDate})
                        </span>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
