import * as sqliteSchema from "./sqlite-schema";

// Lazy-loaded database instance
let _db: any = null;
let _dbAvailable = false;

function getDb() {
  if (_db) return _db;
  try {
    // Dynamic import to avoid build failures when better-sqlite3 isn't available
    const Database = require("better-sqlite3");
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    const path = require("path");

    const DB_PATH = path.join(process.cwd(), "skillbridge.db");
    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    _db = drizzle(sqlite, { schema: sqliteSchema });
    _dbAvailable = true;
    return _db;
  } catch (error) {
    console.warn("SQLite not available, using fallback data:", (error as Error).message);
    _dbAvailable = false;
    return null;
  }
}

// Proxy that returns null db gracefully
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const realDb = getDb();
    if (!realDb) return undefined;
    return (realDb as any)[prop];
  },
});

export function isDbAvailable(): boolean {
  getDb();
  return _dbAvailable;
}

export type Database = typeof db;
export type SQLiteSchema = typeof sqliteSchema;

export function checkDatabaseConnection(): boolean {
  return _dbAvailable;
}

export function initializeDatabase() {
  // No-op on Netlify — tables are created by seed script locally
  console.log("Database initialization skipped (serverless environment)");
}
