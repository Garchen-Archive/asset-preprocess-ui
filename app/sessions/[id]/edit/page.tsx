import { db } from "@/lib/db/client";
import { sessions, events } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSession } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const [sessionData] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, params.id))
    .limit(1);

  if (!sessionData) {
    notFound();
  }

  const eventsList = await db.select().from(events).orderBy(asc(events.eventName));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/sessions/${params.id}`}
          className="text-sm text-muted-foreground hover:underline mb-2 inline-block"
        >
          ← Back to Session
        </Link>
        <h1 className="text-3xl font-bold">Edit Session</h1>
        <p className="text-muted-foreground">{sessionData.sessionName}</p>
      </div>

      <form action={updateSession.bind(null, params.id)} className="space-y-8">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="sessionId">Session ID *</Label>
              <Input
                id="sessionId"
                name="sessionId"
                required
                defaultValue={sessionData.sessionId}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="sessionName">Session Name *</Label>
              <Input
                id="sessionName"
                name="sessionName"
                required
                defaultValue={sessionData.sessionName}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="eventId">Event *</Label>
              <select
                id="eventId"
                name="eventId"
                defaultValue={sessionData.eventId || ""}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select Event</option>
                {eventsList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sessionDate">Session Date</Label>
              <Input
                id="sessionDate"
                name="sessionDate"
                type="date"
                defaultValue={sessionData.sessionDate || ""}
              />
            </div>

            <div>
              <Label htmlFor="sessionTime">Session Time</Label>
              <Input
                id="sessionTime"
                name="sessionTime"
                type="time"
                defaultValue={sessionData.sessionTime || ""}
              />
            </div>

            <div>
              <Label htmlFor="sessionStartTime">Start Time</Label>
              <Input
                id="sessionStartTime"
                name="sessionStartTime"
                type="time"
                defaultValue={sessionData.sessionStartTime || ""}
              />
              <p className="text-xs text-muted-foreground mt-1">Optional: Specific start time</p>
            </div>

            <div>
              <Label htmlFor="sessionEndTime">End Time</Label>
              <Input
                id="sessionEndTime"
                name="sessionEndTime"
                type="time"
                defaultValue={sessionData.sessionEndTime || ""}
              />
              <p className="text-xs text-muted-foreground mt-1">Optional: Specific end time</p>
            </div>

            <div>
              <Label htmlFor="sequenceInEvent">Sequence in Event</Label>
              <Input
                id="sequenceInEvent"
                name="sequenceInEvent"
                type="number"
                defaultValue={sessionData.sequenceInEvent || ""}
              />
            </div>

            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                defaultValue={sessionData.topic || ""}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={sessionData.category || ""}
              />
            </div>

            <div>
              <Label htmlFor="durationEstimated">Duration (Estimated)</Label>
              <Input
                id="durationEstimated"
                name="durationEstimated"
                defaultValue={sessionData.durationEstimated || ""}
              />
            </div>

            <div>
              <Label htmlFor="catalogingStatus">Cataloging Status</Label>
              <select
                id="catalogingStatus"
                name="catalogingStatus"
                defaultValue={sessionData.catalogingStatus || ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Needs Review">Needs Review</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="sessionDescription">Description</Label>
              <Textarea
                id="sessionDescription"
                name="sessionDescription"
                defaultValue={sessionData.sessionDescription || ""}
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={sessionData.notes || ""}
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="additionalMetadata">Additional Metadata (JSON)</Label>
              <Textarea
                id="additionalMetadata"
                name="additionalMetadata"
                defaultValue={sessionData.additionalMetadata ? JSON.stringify(sessionData.additionalMetadata, null, 2) : ""}
                placeholder='{"key": "value"}'
                rows={6}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter valid JSON for additional metadata fields
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/sessions/${params.id}`}>Cancel</Link>
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
