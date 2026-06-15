// src/ingest/xlsx.mjs
//
// XLSX reader producing the same { headers, rows } shape as the CSV reader, keeping all
// downstream code format-agnostic. readXlsxInteractive prompts for a sheet only when a
// workbook has more than one.
// `xlsx` is a CommonJS module; ESM named imports fail, so destructure the default export.
import xlsx from 'xlsx';
import * as p from '@clack/prompts';

const { readFile, utils } = xlsx;

/** @returns {string[]} sheet names in workbook order */
export function listSheets(path) {
  const wb = readFile(path);
  return wb.SheetNames;
}

/**
 * Read one sheet into the uniform table shape.
 * @param {string} path
 * @param {string} [sheetName] defaults to the first/only sheet
 * @returns {{ headers: string[], rows: any[][] }}
 */
export function readXlsx(path, sheetName) {
  const wb = readFile(path);
  const name = sheetName ?? wb.SheetNames[0];
  const ws = wb.Sheets[name];
  if (!ws) throw new Error(`Sheet not found: ${name}`);
  const matrix = utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });
  if (matrix.length === 0) return { headers: [], rows: [] };
  const [headers, ...rows] = matrix;
  return { headers: headers.map((h) => String(h ?? '')), rows };
}

/**
 * Read an xlsx, prompting for a sheet only when there is more than one.
 * @returns {Promise<{ headers: string[], rows: any[][] }>}
 */
export async function readXlsxInteractive(path) {
  const sheets = listSheets(path);
  if (sheets.length <= 1) return readXlsx(path, sheets[0]);

  const choice = await p.select({
    message: 'Which sheet do you want to ingest?',
    options: sheets.map((s) => ({ value: s, label: s })),
  });
  if (p.isCancel(choice)) {
    p.cancel('Ingestion cancelled.');
    process.exit(0);
  }
  return readXlsx(path, choice);
}
