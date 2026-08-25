import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
    "Set it in .env.local — see .env.example for reference."
  );
}

// Create PostgreSQL client
const client = postgres(DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Type helpers
export type Database = typeof db;
export type Schema = typeof schema;

// Helper to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Helper to get raw SQL client for migrations
export function getRawClient() {
  return client;
}
