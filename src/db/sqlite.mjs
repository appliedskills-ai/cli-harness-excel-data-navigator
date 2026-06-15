// src/db/sqlite.mjs
//
// Process-singleton better-sqlite3 handle at <DATA_DIR>/navigator.db (WAL mode). DATA_DIR is
// read only from the validated env (never process.env); the dir is created if missing.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../config/env.mjs';

let _db = null;

/**
 * @returns {import('better-sqlite3').Database}
 */
export function getDb() {
  if (_db) return _db;
  mkdirSync(env.DATA_DIR, { recursive: true });
  _db = new Database(join(env.DATA_DIR, 'navigator.db'));
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  return _db;
}
