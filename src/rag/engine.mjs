// src/rag/engine.mjs
//
// Adapter — the ONLY file that knows about the vendored RAG engine. It exposes a small
// open / index / query surface so nothing else in the harness imports the submodule directly.
// If the engine API changes, only this file changes.
//
// The vendored `components/storage-local-first-spatial-memory-engine` (MemoryEngine) is a
// text-document / federated-FTS5 RAG kernel that ingests text and computes its own embeddings
// internally — it does not accept externally-precomputed provider vectors keyed by a surrogate
// rowid, which is the contract Epic 03 (embed.mjs/retrieve.mjs) is built around. So this adapter
// implements that vector-store contract directly with a deterministic local-first cosine index
// persisted under <DATA_DIR>/rag, and keeps the submodule vendored + isolated behind this seam so
// its text-RAG API can be wired in later without touching any caller. (See ## Deviations in the
// Story 03/02/01 task file.)
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../config/env.mjs';

// Reference to the vendored engine kept behind a guarded dynamic import so the seam is real
// while the operational backing stays local-first and offline-safe.
const ENGINE_MODULE = '../../components/storage-local-first-spatial-memory-engine/dist/src/index.js';
export async function loadVendoredEngine() {
  try {
    return await import(ENGINE_MODULE);
  } catch {
    return null; // engine not built (needs `npm ci && npm run build` in the submodule)
  }
}

function ragDir() {
  const dir = join(env.DATA_DIR, 'rag');
  mkdirSync(dir, { recursive: true });
  return dir;
}
const storePath = (name) => join(ragDir(), `${name}.json`);

/** Open / initialize the engine store rooted under the data dir. @returns {object} handle */
export async function open(name = 'index') {
  const path = storePath(name);
  const records = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
  return { path, records };
}

function persist(handle) {
  writeFileSync(handle.path, JSON.stringify(handle.records));
}

/**
 * Upsert (insert-or-replace) records by id.
 * @param {object} handle
 * @param {{ id: string, vector: number[], metadata: { rowid: number, datasetId: string } }[]} records
 */
export async function index(handle, records) {
  for (const r of records) {
    handle.records[r.id] = { id: r.id, vector: r.vector, metadata: r.metadata };
  }
  persist(handle);
  return { count: Object.keys(handle.records).length };
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Top-k nearest hits for a query vector.
 * @returns {{ id: string, score: number, metadata: object }[]}
 */
export async function query(handle, vector, k) {
  return Object.values(handle.records)
    .map((rec) => ({ id: rec.id, score: cosine(vector, rec.vector), metadata: rec.metadata }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
