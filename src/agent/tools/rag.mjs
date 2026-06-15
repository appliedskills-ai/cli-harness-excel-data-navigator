// src/agent/tools/rag.mjs
//
// Agent tool for semantic lookup — wraps src/rag/retrieve.mjs, returning grounded rows the agent
// can cite. `score` is passed through unchanged so the grounding layer can apply its threshold.
import { retrieveRows } from '../../rag/retrieve.mjs';

/**
 * @returns {Promise<{ rowid: number, score: number, row: object }[]>}
 */
export async function ragSearch({ datasetId, query, k = 8 }) {
  return retrieveRows(datasetId, query, k);
}

export const ragTool = { name: 'rag_search', params: { datasetId: 'string', query: 'string', k: 'number?' } };
