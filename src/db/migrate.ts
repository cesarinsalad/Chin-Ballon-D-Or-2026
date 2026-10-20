import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePostgresJs } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    process.loadEnvFile();
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    const instance = db() as PostgresJsDatabase<typeof schema>;
    await migratePostgresJs(instance, { migrationsFolder: "drizzle" });
  } else {
    const instance = db() as unknown as Parameters<typeof migratePglite>[0];
    await migratePglite(instance, { migrationsFolder: "drizzle" });
  }
  console.log("Migraciones aplicadas.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
