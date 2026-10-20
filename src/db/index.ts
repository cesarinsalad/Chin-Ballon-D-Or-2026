import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

function createDb(): AppDatabase {
  const url = process.env.DATABASE_URL;
  if (url) {
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    const client = postgres(url, { max: 1, ssl: isLocal ? undefined : "require" });
    return drizzlePostgresJs(client, { schema });
  }
  const client = new PGlite({ dataDir: ".pglite" });
  return drizzlePglite(client, { schema }) as unknown as AppDatabase;
}

let instance: AppDatabase | undefined;

export function db(): AppDatabase {
  if (!instance) instance = createDb();
  return instance;
}
