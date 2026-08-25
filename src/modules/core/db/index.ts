// Re-export SQLite database
export { db, checkDatabaseConnection } from "./sqlite";
export type { Database } from "./sqlite";

// Legacy schema exports for compatibility
import * as sqliteSchema from "./sqlite-schema";
export const schema = sqliteSchema;
