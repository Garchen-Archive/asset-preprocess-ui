import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Asset Catalog Hub</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Catalog and prepare Assets for GA Pipeline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link
          href="/assets"
          className="p-6 border rounded-lg hover:border-primary hover:shadow-lg transition-all"
        >
          <h2 className="text-2xl font-semibold mb-2">Assets</h2>
          <p className="text-muted-foreground">
            Browse, search, and manage archive assets including videos, audio files, and documents
          </p>
        </Link>

        <Link
          href="/events"
          className="p-6 border rounded-lg hover:border-primary hover:shadow-lg transition-all"
        >
          <h2 className="text-2xl font-semibold mb-2">Events</h2>
          <p className="text-muted-foreground">
            Manage teaching events, sessions and their relationships
          </p>
        </Link>
      </div>
    </div>
  );
}
