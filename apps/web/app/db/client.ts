import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Create postgres client with SSL support
const client = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  prepare: false,
});

// Initialize Drizzle ORM with schema
export const db = drizzle(client, { schema });

// Export types for better TypeScript support
export type Database = typeof db;
