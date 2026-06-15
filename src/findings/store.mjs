// src/findings/store.mjs
//
// One cross-mode store for notes / flags / agent findings, all keyed the same way and persisted
// THROUGH the Epic-01 session record store (a findings[] slice on the record) — no separate file
// or sqlite table, no forked backend. The active backend (createFsSessionBackend /
// createSqliteSessionBackend, defined in src/store/sessions-fs.mjs and src/store/sessions-sqlite.mjs)
// is resolved by the selector below; this module never opens a store directly.
import { getBackend } from '../store/backend.mjs';

const SESSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

export const KIND = Object.freeze({
  NOTE: 'note', // user free text
  FLAG: 'flag', // a marked row
  FINDING: 'finding', // an agent-generated insight
});
const KINDS = new Set(Object.values(KIND));

/**
 * Append a note / flag / finding to the session record's findings[] slice.
 * @param {{ sessionId: string, datasetId: string, rowid?: number|null, kind: string, body: any }} entry
 */
export async function saveFinding({ sessionId, datasetId, rowid = null, kind, body }) {
  if (!SESSION_ID_RE.test(sessionId)) throw new Error(`Invalid sessionId: ${sessionId}`);
  if (!KINDS.has(kind)) throw new Error(`Invalid finding kind: ${kind} (expected ${[...KINDS].join('|')})`);
  const backend = getBackend();
  const record = backend.get(sessionId) ?? { sessionId };
  const findings = Array.isArray(record.findings) ? record.findings : [];
  const stored = { sessionId, datasetId, rowid, kind, body, createdAt: new Date().toISOString() };
  findings.push(stored);
  backend.put({ ...record, sessionId, findings });
  return stored;
}

/**
 * List the session's findings, filtered by kind (when given) and rowid:
 *  - rowid === null   → session/dataset-level entries
 *  - rowid === undefined → any row
 * Newest-first.
 * @param {{ sessionId: string, kind?: string|null, rowid?: number|null }} q
 */
export async function listFindings({ sessionId, kind = null, rowid = undefined }) {
  const record = getBackend().get(sessionId);
  const findings = Array.isArray(record?.findings) ? record.findings : [];
  return findings
    .filter((e) => (kind == null ? true : e.kind === kind))
    .filter((e) => (rowid === undefined ? true : e.rowid === rowid))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}
