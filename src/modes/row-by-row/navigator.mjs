// src/modes/row-by-row/navigator.mjs
//
// The cursor — a stable, __rowid-ordered iterator over a dataset with the primitives the loop and
// controls call. Clamps at dataset bounds; rejects out-of-range jumps. Reads rows only via src/db.
import { findByName } from '../../db/metadata.mjs';
import { readRowsOrdered } from '../../db/tables.mjs';

const EMPTY_MARKER = '(empty)';
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

/** Create a cursor over the dataset's rows (rows arrive pre-sorted ORDER BY __rowid from src/db). */
export function createNavigator(datasetId) {
  const meta = findByName(datasetId);
  if (!meta) throw new Error(`Unknown dataset: ${datasetId}`);
  const rows = readRowsOrdered(meta.tableName); // canonical ORDER BY __rowid sequence
  const columnDefs = meta.columnDefs;
  let index = 0;

  const count = () => rows.length;
  const clamp = (i) => Math.max(0, Math.min(i, rows.length - 1));

  return {
    columnDefs,
    count,
    position: () => (rows.length === 0 ? 0 : index + 1), // 1-based
    current: () => (rows.length === 0 ? null : rows[index]),
    next: () => {
      index = clamp(index + 1);
      return rows[index] ?? null;
    },
    previous: () => {
      index = clamp(index - 1);
      return rows[index] ?? null;
    },
    jump: (n) => {
      if (!Number.isInteger(n) || n < 1 || n > rows.length) {
        return { error: `out of range: ${n} (1..${rows.length})` };
      }
      index = n - 1;
      return rows[index];
    },
    rowidAt: (i) => rows[i]?.__rowid ?? null,
    indexOfRowid: (rowid) => rows.findIndex((r) => r.__rowid === rowid),
  };
}

/**
 * Format the current row as a readable key/value table string. Pure (string in / string out).
 * null / undefined / empty-string render as the (empty) marker so missing data is visible.
 */
export function renderRow(row, columnDefs) {
  if (!row) return '(no row)';
  const cols = (columnDefs && columnDefs.length)
    ? columnDefs.map((d) => d.name)
    : Object.keys(row).filter((k) => k !== '__rowid');
  const header = `Row __rowid ${row.__rowid}`;
  const lines = cols.map((name) => `  ${name}: ${isEmpty(row[name]) ? EMPTY_MARKER : row[name]}`);
  return [header, ...lines].join('\n');
}
