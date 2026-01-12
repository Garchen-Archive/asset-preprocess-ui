"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { bulkAssignAssets } from "@/lib/actions";

interface Event {
  id: string;
  eventName: string;
}

interface Session {
  id: string;
  sessionName: string;
  eventId: string | null;
}

interface SessionWithHierarchy {
  session: Session;
  event: Event | null;
}

interface BulkAssignModalProps {
  selectedAssetIds: string[];
  events: Event[];
  sessions: SessionWithHierarchy[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkAssignModal({
  selectedAssetIds,
  events,
  sessions,
  onClose,
  onSuccess,
}: BulkAssignModalProps) {
  const [mode, setMode] = useState<"event" | "session">("event");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await bulkAssignAssets({
        assetIds: selectedAssetIds,
        eventId: mode === "event" ? selectedEventId : null,
        sessionId: mode === "session" ? selectedSessionId : null,
      });

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to assign assets");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedSession = sessions.find((s) => s.session.id === selectedSessionId);

  const canSubmit =
    (mode === "event" && selectedEventId) ||
    (mode === "session" && selectedSessionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Bulk Assign Assets
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Assigning {selectedAssetIds.length} asset{selectedAssetIds.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Assignment Mode */}
          <div>
            <label className="text-sm font-medium block mb-2">Assignment Level</label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="bulk-mode-event"
                  name="bulk-assignment-mode"
                  value="event"
                  checked={mode === "event"}
                  onChange={() => {
                    setMode("event");
                    setSelectedSessionId("");
                  }}
                  className="h-4 w-4"
                />
                <label htmlFor="bulk-mode-event" className="text-sm cursor-pointer">
                  Event (Quick)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="bulk-mode-session"
                  name="bulk-assignment-mode"
                  value="session"
                  checked={mode === "session"}
                  onChange={() => {
                    setMode("session");
                    setSelectedEventId("");
                  }}
                  className="h-4 w-4"
                />
                <label htmlFor="bulk-mode-session" className="text-sm cursor-pointer">
                  Session (Detailed)
                </label>
              </div>
            </div>
          </div>

          {/* Event Selection */}
          {mode === "event" && (
            <div>
              <label htmlFor="bulk-event-select" className="text-sm font-medium block mb-2">
                Select Event
              </label>
              <select
                id="bulk-event-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Select an Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
              {selectedEvent && (
                <p className="text-xs text-muted-foreground mt-1">
                  All {selectedAssetIds.length} assets will be assigned directly to "{selectedEvent.eventName}"
                </p>
              )}
            </div>
          )}

          {/* Session Selection */}
          {mode === "session" && (
            <div>
              <label htmlFor="bulk-session-select" className="text-sm font-medium block mb-2">
                Select Session
              </label>
              <select
                id="bulk-session-select"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Select a Session --</option>
                {sessions.map(({ session, event }) => (
                  <option key={session.id} value={session.id}>
                    {event ? `${event.eventName} > ` : ""}{session.sessionName}
                  </option>
                ))}
              </select>
              {selectedSession && (
                <p className="text-xs text-muted-foreground mt-1">
                  All {selectedAssetIds.length} assets will be assigned to session "{selectedSession.session.sessionName}"
                  {selectedSession.event && ` in event "${selectedSession.event.eventName}"`}
                </p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <strong className="font-medium">Note:</strong> This will overwrite any existing assignments for the selected assets.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Assigning..." : `Assign ${selectedAssetIds.length} Asset${selectedAssetIds.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
