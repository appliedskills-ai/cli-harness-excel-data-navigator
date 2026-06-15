// src/agent/tools/aggregate.mjs
//
// Deterministic per-column statistics — safer and cheaper than asking the LLM to compute them.
// Each op runs as a guarded read-only query (reusing the SQL story's executor) and the column is
// validated against the dataset's real columnDefs before use.
import { findByName } from '../../db/metadata.mjs';
import { executeReadOnly } from './sql.mjs';

const OPS = new Set(['count', 'sum', 'avg', 'min', 'max', 'distinct', 'missing']);
const quoteIdent = (s) => `"${String(s).replace(/"/g, '""')}"`;

/**
 * Run one aggregate op over a column.
 * @param {{ datasetId: string, column: string, op: 'count'|'sum'|'avg'|'min'|'max'|'distinct'|'missing' }} args
 * @returns {Promise<{ op: string, column: string, value: any, sql: string }>}
 */
export async function aggregate({ datasetId, column, op }) {
  if (!OPS.has(op)) throw new Error(`Unknown aggregate op: ${op}`);
  const meta = findByName(datasetId);
  if (!meta) throw new Error(`Unknown dataset: ${datasetId}`);
  const def = meta.columnDefs.find((d) => d.name === column);
  if (!def) throw new Error(`Unknown column "${column}" in dataset "${datasetId}"`);

  const col = quoteIdent(def.name); // validated identifier
  const tbl = quoteIdent(meta.tableName);
  let expr;
  switch (op) {
    case 'count': expr = 'COUNT(*)'; break;
    case 'sum': expr = `SUM(${col})`; break;
    case 'avg': expr = `AVG(${col})`; break;
    case 'min': expr = `MIN(${col})`; break;
    case 'max': expr = `MAX(${col})`; break;
    case 'distinct': expr = `COUNT(DISTINCT ${col})`; break;
    case 'missing': expr = `SUM(CASE WHEN ${col} IS NULL OR ${col} = '' THEN 1 ELSE 0 END)`; break;
    default: throw new Error(`Unhandled op: ${op}`);
  }
  const sql = `SELECT ${expr} AS value FROM ${tbl}`;
  const { rows } = await executeReadOnly({ sql, maxRows: 1 });
  return { op, column: def.name, value: rows[0]?.value ?? null, sql };
}

export const aggregateTool = { name: 'aggregate', params: { datasetId: 'string', column: 'string', op: 'string' } };
