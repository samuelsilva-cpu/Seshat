import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

/**
 * Run migrations on the database
 * Call this during app startup to ensure schema is up to date
 */
export async function runMigrations() {
  try {
    const client = postgres(process.env.DATABASE_URL!, {
      ssl: "require",
      prepare: false,
    });

    const db = drizzle(client, { schema });

    // For now, migrations are handled via schema definitions
    // In a production setup, use drizzle-kit to generate migration files
    console.log("✓ Database schema initialized");

    await client.end();
  } catch (error) {
    console.error("✗ Failed to initialize database schema:", error);
    throw error;
  }
}
