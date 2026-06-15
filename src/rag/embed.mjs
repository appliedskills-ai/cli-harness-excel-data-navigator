// src/rag/embed.mjs
//
// Turn ingested rows into vectors (via the provider seam's embed()) and upsert them into the RAG
// engine keyed by `<datasetId>:<__rowid>` so re-ingesting a dataset updates rather than duplicates.
import { env } from '../config/env.mjs';
import { bootstrap } from '../config/bootstrap.mjs';
import { selectProvider } from '../providers/interface/selector.mjs';
import { findByName } from '../db/metadata.mjs';
import { readRows } from '../db/tables.mjs';
import * as engine from './engine.mjs';

// Resolve the EMBED provider through the same seam by overriding MODEL_PROVIDER with the
// effective embed provider from bootstrap.
const embedProvider = () => selectProvider({ ...env, MODEL_PROVIDER: bootstrap.embedProvider });

/** Deterministic "<col>: <value>"-joined text for a row (stable columnDefs order, skips __rowid). */
export function rowToText(columnDefs, row) {
  return columnDefs.map((d) => `${d.name}: ${row[d.name] ?? ''}`).join(' | ');
}

function loadDataset(datasetId) {
  const meta = findByName(datasetId);
  if (!meta) throw new Error(`Unknown dataset: ${datasetId}`);
  return { meta, rows: readRows(meta.tableName) };
}

/**
 * Serialize + embed every row of a dataset.
 * @returns {Promise<{ rowid: number, datasetId: string, vector: number[] }[]>}
 */
export async function embedRows(datasetId) {
  const { meta, rows } = loadDataset(datasetId);
  const provider = embedProvider();
  if (!provider.capabilities.embed) {
    throw new Error(`Provider "${provider.name}" does not support embed`);
  }
  const texts = rows.map((r) => rowToText(meta.columnDefs, r));
  const { vectors } = await provider.embed({ inputs: texts }); // reads EmbedResult.vectors
  return rows.map((r, i) => ({ rowid: r.__rowid, datasetId, vector: vectors[i] }));
}

/**
 * Embed + upsert a dataset's rows into the engine, keyed deterministically by `<datasetId>:<rowid>`.
 * @returns {Promise<{ datasetId: string, count: number }>}
 */
export async function indexRows(datasetId) {
  const items = await embedRows(datasetId);
  const handle = await engine.open();
  const records = items.map((it) => ({
    id: `${it.datasetId}:${it.rowid}`,
    vector: it.vector,
    metadata: { rowid: it.rowid, datasetId: it.datasetId },
  }));
  await engine.index(handle, records);
  return { datasetId, count: records.length };
}
