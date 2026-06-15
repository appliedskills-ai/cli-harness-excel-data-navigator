// src/rag/retrieve.mjs
//
// Read side of RAG: embed a query through the provider seam, fetch top-K nearest vectors from the
// engine adapter, then join each hit back to its full SQL row by __rowid.
import { env } from '../config/env.mjs';
import { bootstrap } from '../config/bootstrap.mjs';
import { selectProvider } from '../providers/interface/selector.mjs';
import { findByName } from '../db/metadata.mjs';
import { readRowsByRowid } from '../db/tables.mjs';
import * as engine from './engine.mjs';

const MAX_K = 50;
const embedProvider = () => selectProvider({ ...env, MODEL_PROVIDER: bootstrap.embedProvider });

/**
 * Embed the query and return ranked hits (rowid + score), filtered to the dataset.
 * @returns {Promise<{ rowid: number, score: number, datasetId: string }[]>}
 */
export async function retrieve(datasetId, queryText, k = 8) {
  const kk = Math.max(1, Math.min(k, MAX_K));
  const provider = embedProvider();
  const { vectors } = await provider.embed({ inputs: [queryText] });
  const vector = vectors[0];
  const handle = await engine.open();
  const hits = await engine.query(handle, vector, kk * 4); // over-fetch, then filter by dataset
  return hits
    .filter((h) => h.metadata?.datasetId === datasetId)
    .slice(0, kk)
    .map((h) => ({ rowid: h.metadata.rowid, score: h.score, datasetId }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Retrieve + join each hit back to its full SQL row, preserving descending-score order.
 * Hits with no matching SQL row are dropped.
 * @returns {Promise<{ rowid: number, score: number, row: object }[]>}
 */
export async function retrieveRows(datasetId, queryText, k = 8) {
  const hits = await retrieve(datasetId, queryText, k);
  const meta = findByName(datasetId);
  if (!meta) return [];
  const rows = readRowsByRowid(meta.tableName, hits.map((h) => h.rowid));
  const byRowid = new Map(rows.map((r) => [r.__rowid, r]));
  return hits
    .map((h) => ({ rowid: h.rowid, score: h.score, row: byRowid.get(h.rowid) }))
    .filter((h) => h.row !== undefined);
}
