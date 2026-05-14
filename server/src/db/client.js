import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

/**
 * Database client. SQLite file in dev (./evalax.db); for production point
 * DRIZZLE_URL at Postgres and swap the driver in drizzle.config.js.
 */
const sqlitePath = process.env.DATABASE_URL || './evalax.db';
const sqlite = new Database(sqlitePath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { schema };
