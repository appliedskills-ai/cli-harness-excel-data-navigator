// src/ingest/source-prompt.mjs
//
// Interactive clack `text` prompt collecting the source file path. Validates inline that the
// file exists and has a supported extension (.csv/.xlsx). A p.isCancel guard follows the prompt.
import { existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import * as p from '@clack/prompts';

const SUPPORTED = new Set(['.csv', '.xlsx']);

/**
 * Prompt for a path to an existing .csv/.xlsx file.
 * @returns {Promise<string>} validated path
 */
export async function promptSourcePath() {
  const value = await p.text({
    message: 'Path to the .csv or .xlsx file to ingest',
    placeholder: './data/sales.csv',
    validate(input) {
      if (!input) return 'A file path is required';
      const ext = extname(input).toLowerCase();
      if (!SUPPORTED.has(ext)) return 'File must be a .csv or .xlsx';
      if (!existsSync(input) || !statSync(input).isFile()) return 'No file at that path';
      return undefined;
    },
  });
  if (p.isCancel(value)) {
    p.cancel('Ingestion cancelled.');
    process.exit(0);
  }
  return value;
}
