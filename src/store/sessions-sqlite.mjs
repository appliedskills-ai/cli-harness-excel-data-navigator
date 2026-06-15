// src/store/sessions-sqlite.mjs
//
// sqlite-backed session record store (WAL mode, exact DDL) storing the SAME record shape
// as the fs backend. The two backends stay in lockstep — identical interface and record
// shape. Columns/WAL must not drift.
import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';
import { env } from '../config/env.mjs';

const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export function createSqliteSessionBackend() {
  fs.mkdirSync(env.DATA_DIR, { recursive: true });
  const db = new Database(path.join(env.DATA_DIR, 'sessions.db'));
  db.pragma('journal_mode = WAL');
  db.exec('CREATE TABLE IF NOT EXISTS sessions (session_id TEXT PRIMARY KEY, data TEXT, updated_at TEXT)');

  const selStmt = db.prepare('SELECT data FROM sessions WHERE session_id = ?');
  const upsertStmt = db.prepare(
    'INSERT INTO sessions (session_id, data, updated_at) VALUES (@session_id, @data, @updated_at) ' +
      'ON CONFLICT(session_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
  );
  const listStmt = db.prepare('SELECT session_id FROM sessions');

  return {
    get(id) {
      if (!SESSION_ID_RE.test(id)) throw new Error(`Invalid sessionId: ${id}`);
      const row = selStmt.get(id);
      return row ? JSON.parse(row.data) : null;
    },
    put(record) {
      if (!SESSION_ID_RE.test(record?.sessionId)) {
        throw new Error(`Invalid sessionId: ${record?.sessionId}`);
      }
      const now = new Date().toISOString();
      const existing = this.get(record.sessionId);
      const next = {
        runId: null,
        ...record,
        createdAt: existing?.createdAt ?? record.createdAt ?? now,
        updatedAt: now,
      };
      upsertStmt.run({ session_id: next.sessionId, data: JSON.stringify(next), updated_at: now });
      return next;
    },
    list() {
      return listStmt.all().map((r) => r.session_id);
    },
  };
}
