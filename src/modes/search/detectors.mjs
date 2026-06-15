// src/modes/search/detectors.mjs
//
// Deterministic, column-aware data-quality detectors built on the Epic-03 READ-ONLY SQL /
// aggregation tools — fast, reproducible, never writing. Results are structured (with __rowids);
// formatting belongs to the renderer, not here.
import { executeReadOnly } from '../../agent/tools/sql.mjs';
import { aggregate } from '../../agent/tools/aggregate.mjs';
import { findByName } from '../../db/metadata.mjs';
import { selectProvider } from '../../providers/interface/selector.mjs';

const quoteIdent = (s) => `"${String(s).replace(/"/g, '""')}"`;
const resolve = (dataset) => {
  const id = typeof dataset === 'string' ? dataset : dataset?.name;
  const meta = findByName(id);
  if (!meta) throw new Error(`Unknown dataset: ${id}`);
  return { id, meta };
};

/** Per-column NULL/empty counts via the aggregation tool. */
export async function detectMissingValues({ dataset }) {
  const { id, meta } = resolve(dataset);
  const out = [];
  for (const d of meta.columnDefs) {
    const missing = await aggregate({ datasetId: id, column: d.name, op: 'missing' });
    const total = await aggregate({ datasetId: id, column: d.name, op: 'count' });
    out.push({ column: d.name, missingCount: missing.value ?? 0, total: total.value ?? 0 });
  }
  return out;
}

/** Numeric outliers beyond an IQR bound (read-only SQL). Returns rows with their __rowid. */
export async function detectOutliers({ dataset, column, method = 'iqr' }) {
  const { meta } = resolve(dataset);
  const def = meta.columnDefs.find((d) => d.name === column);
  if (!def) throw new Error(`Unknown column: ${column}`);
  const col = quoteIdent(column);
  const tbl = quoteIdent(meta.tableName);
  // IQR bound via guarded SELECTs (no window funcs needed): quartiles by row offset.
  const { rows: cntRows } = await executeReadOnly({ sql: `SELECT COUNT(*) AS n FROM ${tbl} WHERE ${col} IS NOT NULL` });
  const n = cntRows[0]?.n ?? 0;
  if (n < 4) return { method, bound: null, outliers: [] };
  const at = async (offset) => {
    const { rows } = await executeReadOnly({ sql: `SELECT ${col} AS v FROM ${tbl} WHERE ${col} IS NOT NULL ORDER BY ${col} LIMIT 1 OFFSET ${Math.floor(offset)}` });
    return Number(rows[0]?.v);
  };
  const q1 = await at(n * 0.25);
  const q3 = await at(n * 0.75);
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  const { rows } = await executeReadOnly({ sql: `SELECT __rowid, ${col} AS value FROM ${tbl} WHERE ${col} < ${lo} OR ${col} > ${hi}` });
  return { method, bound: { lo, hi }, outliers: rows };
}

/** Duplicate rows via GROUP BY … HAVING COUNT(*) > 1. */
export async function detectDuplicateRows({ dataset, keyColumns }) {
  const { meta } = resolve(dataset);
  const cols = (keyColumns && keyColumns.length ? keyColumns : meta.columnDefs.map((d) => d.name))
    .map(quoteIdent);
  const tbl = quoteIdent(meta.tableName);
  const group = cols.join(', ');
  const sql =
    `SELECT ${group}, COUNT(*) AS cnt, GROUP_CONCAT(__rowid) AS rowids ` +
    `FROM ${tbl} GROUP BY ${group} HAVING COUNT(*) > 1`;
  const { rows } = await executeReadOnly({ sql });
  return rows.map((r) => ({ ...r, rowids: String(r.rowids ?? '').split(',').map(Number) }));
}

/** Deterministic trend over a time-ordered numeric series. */
export async function summarizeTrend({ dataset, timeColumn, valueColumn }) {
  const { meta } = resolve(dataset);
  const t = quoteIdent(timeColumn);
  const v = quoteIdent(valueColumn);
  const tbl = quoteIdent(meta.tableName);
  const { rows } = await executeReadOnly({ sql: `SELECT ${t} AS t, ${v} AS v FROM ${tbl} WHERE ${v} IS NOT NULL ORDER BY ${t}` });
  const points = rows.map((r) => ({ t: r.t, v: Number(r.v) }));
  if (points.length < 2) return { direction: 'flat', changePct: 0, points };
  const first = points[0].v;
  const last = points[points.length - 1].v;
  const changePct = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;
  const direction = changePct > 1 ? 'up' : changePct < -1 ? 'down' : 'flat';
  return { direction, changePct, points };
}

/**
 * Provider-generated analyst suggestions, grounded: only suggestions that reference a REAL column
 * survive (others are discarded).
 */
export async function suggestInvestigations({ dataset, provider = selectProvider() }) {
  const { meta } = resolve(dataset);
  const names = meta.columnDefs.map((d) => d.name);
  const schema = meta.columnDefs.map((d) => `${d.name} ${d.sqlType}`).join(', ');
  const { text } = await provider.chat({
    system: 'Suggest investigations an analyst should run. Reference ONLY the given columns. Reply as a JSON string array.',
    messages: [{ role: 'user', content: `Columns: ${schema}` }],
  });
  let suggestions = [];
  try { suggestions = JSON.parse(text); } catch { suggestions = String(text).split('\n').map((l) => l.trim()).filter(Boolean); }
  // Discard any suggestion that names no real column (grounding against the schema).
  return suggestions.filter((s) => names.some((n) => String(s).toLowerCase().includes(n.toLowerCase())));
}
