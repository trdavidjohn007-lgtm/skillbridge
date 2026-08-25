import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as sqliteSchema from "./sqlite-schema";
import path from "path";

// Database file path - stored in the project directory
const DB_PATH = path.join(process.cwd(), "skillbridge.db");

// Create SQLite connection
const sqlite = new Database(DB_PATH);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema: sqliteSchema });

// Type helpers
export type Database = typeof db;
export type SQLiteSchema = typeof sqliteSchema;

// Helper to check database connection
export function checkDatabaseConnection(): boolean {
  try {
    sqlite.prepare("SELECT 1").get();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Helper to initialize database tables
export function initializeDatabase() {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      role TEXT DEFAULT 'learner',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tutor_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      subjects TEXT DEFAULT '[]',
      is_online INTEGER DEFAULT 0,
      total_hours REAL DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      avg_rating REAL DEFAULT 0,
      trust_score REAL DEFAULT 5.0,
      verified_badge INTEGER DEFAULT 0,
      anonymous_name TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS p2p_learner_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      interests TEXT DEFAULT '[]',
      total_hours REAL DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      anonymous_name TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS help_requests (
      id TEXT PRIMARY KEY,
      learner_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      tags TEXT DEFAULT '[]',
      duration_mins INTEGER DEFAULT 30,
      credit_cost INTEGER DEFAULT 30,
      status TEXT DEFAULT 'pending',
      matched_tutor_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS p2p_sessions (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL,
      learner_id TEXT NOT NULL,
      tutor_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      started_at TEXT DEFAULT (datetime('now')),
      ended_at TEXT,
      duration_seconds INTEGER,
      credits_transferred INTEGER
    );

    CREATE TABLE IF NOT EXISTS session_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      is_system INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS credit_ledger (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      session_id TEXT,
      balance INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS p2p_ratings (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      stars INTEGER NOT NULL,
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS p2p_reports (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      reporter_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS p2p_resources (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      platform TEXT NOT NULL,
      type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      session_id TEXT,
      topic TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log("✅ Database tables initialized");
}
