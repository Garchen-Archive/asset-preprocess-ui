import { db } from "@/lib/db/client";
import { sessions, events } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessionsList = await db
    .select({
      session: sessions,
      event: events,
    })
    .from(sessions)
    .leftJoin(events, eq(sessions.eventId, events.id))
    .orderBy(desc(sessions.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">
            Manage individual teaching sessions
          </p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">Create Session</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium w-16">#</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Session ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Session Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Event</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessionsList.map(({ session, event }, index) => (
              <tr key={session.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-mono">{session.sessionId}</td>
                <td className="px-4 py-3 text-sm">{session.sessionName}</td>
                <td className="px-4 py-3 text-sm">{event?.eventName || "—"}</td>
                <td className="px-4 py-3 text-sm">{session.sessionDate || "—"}</td>
                <td className="px-4 py-3 text-sm">{session.durationEstimated || "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      session.catalogingStatus === "Ready"
                        ? "bg-green-100 text-green-700"
                        : session.catalogingStatus === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {session.catalogingStatus || "Not Started"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link
                    href={`/sessions/${session.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessionsList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No sessions found. Create your first session to get started.
        </div>
      )}
    </div>
  );
}
