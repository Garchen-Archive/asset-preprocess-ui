import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Serverless-friendly config:
// - prepare: false — required for PgBouncer/Supavisor transaction mode
// - max: 1 — each serverless invocation uses a single connection
const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
export const db = drizzle(client, { schema });
