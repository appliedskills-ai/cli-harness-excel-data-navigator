// src/store/jsonl-log.mjs
//
// Append-only interaction log. Generates a SESSION_ID matching the shared regex and
// appends one JSON line per interaction under <DATA_DIR>/sessions/. The session-id
// regex is the same one used by the record store and sqlite PK; validate here too to
// prevent path traversal. Earlier lines are never rewritten — append only.
//
// Every mode calls logInteraction(req, res) exactly once per request/response pair.
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.mjs';

const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export function newSessionId() {
  // randomUUID() is hex + hyphens (36 chars) — already within the charset and 8..64 length.
  const id = randomUUID();
  if (!SESSION_ID_RE.test(id)) {
    throw new Error(`Generated session id does not match ${SESSION_ID_RE}: ${id}`);
  }
  return id;
}

export function sessionLogPath(sessionId) {
  if (!SESSION_ID_RE.test(sessionId)) {
    throw new Error(`Invalid sessionId (rejected before path construction): ${sessionId}`);
  }
  return path.join(env.DATA_DIR, 'sessions', `${sessionId}.jsonl`);
}

export function appendLine(sessionId, request, response) {
  const p = sessionLogPath(sessionId);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, JSON.stringify({ ts: new Date().toISOString(), request, response }) + '\n');
}

let currentSessionId = newSessionId();

export function getSessionId() {
  return currentSessionId;
}

export function setSessionId(id) {
  if (!SESSION_ID_RE.test(id)) {
    throw new Error(`Invalid sessionId: ${id}`);
  }
  currentSessionId = id;
  return currentSessionId;
}

export function logInteraction(request, response) {
  appendLine(currentSessionId, request, response);
  return currentSessionId;
}
