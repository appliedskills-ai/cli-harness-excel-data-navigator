// src/ingest/infer-schema.mjs
//
// Deterministic per-column SQL type inference + the richer columnDefs shape reused by table
// DDL, metadata JSON, and append/replace alignment. Precedence: INTEGER → REAL → BOOLEAN →
// DATE → TEXT (first all-match wins). Null/empty values are excluded from the sample.
const isInt = (v) => /^-?\d+$/.test(String(v).trim());
const isNum = (v) => v !== '' && !Number.isNaN(Number(v));
const isBool = (v) => /^(true|false|0|1|yes|no)$/i.test(String(v).trim());
const isDate = (v) => /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?/.test(String(v).trim());
const isNull = (v) => v === null || v === undefined || String(v).trim() === '';

/**
 * Infer a SQL type per column from a bounded sample.
 * @returns {string[]} sqlType per column, index-aligned with headers
 */
export function inferColumnTypes(headers, rows, { sampleSize = 200 } = {}) {
  const sample = rows.slice(0, sampleSize);
  return headers.map((_h, c) => {
    const vals = sample.map((r) => r[c]).filter((v) => !isNull(v));
    if (vals.length === 0) return 'TEXT';
    if (vals.every(isInt)) return 'INTEGER';
    if (vals.every(isNum)) return 'REAL';
    if (vals.every(isBool)) return 'BOOLEAN';
    if (vals.every(isDate)) return 'DATE';
    return 'TEXT';
  });
}

/**
 * @typedef {{ name: string, sqlType: string, nullable: boolean, sample: any }} ColumnDef
 * @returns {ColumnDef[]}
 */
export function buildColumnDefs(headers, rows, opts = {}) {
  const types = inferColumnTypes(headers, rows, opts);
  const sample = rows.slice(0, opts.sampleSize ?? 200);
  return headers.map((name, c) => {
    const colVals = sample.map((r) => r[c]);
    const firstNonNull = colVals.find((v) => !isNull(v)) ?? null;
    const nullable = colVals.some((v) => isNull(v));
    return { name: String(name), sqlType: types[c], nullable, sample: firstNonNull };
  });
}
