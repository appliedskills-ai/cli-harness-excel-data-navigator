// src/store/sessions-fs.mjs
//
// Filesystem-backed session record store (the default per STORAGE_BACKEND, and the
// reference shape the sqlite backend must match in lockstep).
//
// Canonical session record shape (shared by BOTH backends):
//   { sessionId, runId: null, mode, datasetId, cursor, notes, findings, flags, createdAt, updatedAt }
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.mjs';

const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

function recordPath(id) {
  if (!SESSION_ID_RE.test(id)) {
    throw new Error(`Invalid sessionId: ${id}`);
  }
  return path.join(env.DATA_DIR, 'records', `${id}.json`);
}

export function createFsSessionBackend() {
  return {
    get(id) {
      const p = recordPath(id);
      if (!fs.existsSync(p)) return null;
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    },
    put(record) {
      if (!SESSION_ID_RE.test(record?.sessionId)) {
        throw new Error(`Invalid sessionId: ${record?.sessionId}`);
      }
      const p = recordPath(record.sessionId);
      const now = new Date().toISOString();
      const existing = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
      // Shallow copy + timestamp stamping; never mutate the input in place.
      const next = {
        runId: null,
        ...record,
        createdAt: existing?.createdAt ?? record.createdAt ?? now,
        updatedAt: now,
      };
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(next, null, 2));
      return next;
    },
    list() {
      const dir = path.join(env.DATA_DIR, 'records');
      if (!fs.existsSync(dir)) return [];
      return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.slice(0, -'.json'.length));
    },
  };
}
