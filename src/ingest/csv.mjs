// src/ingest/csv.mjs
//
// Pure, side-effect-free CSV reader: path in, { headers, rows } out. No DB, no prompts.
// The XLSX reader matches this output contract exactly so downstream code is format-agnostic.
import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

/**
 * Read a CSV file into a uniform table shape.
 * @param {string} path
 * @returns {{ headers: string[], rows: any[][] }}
 */
export function readCsv(path) {
  const text = readFileSync(path, 'utf8');
  const records = parse(text, {
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
  if (records.length === 0) return { headers: [], rows: [] };
  const [headers, ...rows] = records;
  return { headers, rows };
}
