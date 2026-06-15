// src/db/metadata.mjs
//
// Dataset catalog: the `datasets` table holding the five required metadata fields (name,
// uploaded_at, row_count, column_defs, version) plus the physical table_name — storing
// table_name separately from the user-facing name is what enables <name>_v<N> versioning.
import { getDb } from './sqlite.mjs';
import { createTable, bulkInsert } from './tables.mjs';

export function ensureDatasetsTable() {
  getDb()
    .prepare(
      `CREATE TABLE IF NOT EXISTS datasets (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         uploaded_at TEXT NOT NULL,
         row_count INTEGER NOT NULL,
         column_defs TEXT NOT NULL,
         version INTEGER NOT NULL,
         table_name TEXT NOT NULL
       )`,
    )
    .run();
}

/**
 * Write one dataset metadata row on ingest.
 * @param {{ name: string, rowCount: number, columnDefs: object[], version: number, tableName: string }} m
 * @returns {number} inserted row id
 */
export function writeDatasetMeta({ name, rowCount, columnDefs, version, tableName }) {
  ensureDatasetsTable();
  const info = getDb()
    .prepare(
      `INSERT INTO datasets (name, uploaded_at, row_count, column_defs, version, table_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(name, new Date().toISOString(), rowCount, JSON.stringify(columnDefs), version, tableName);
  return Number(info.lastInsertRowid);
}

// Map the snake_case `datasets` columns to the canonical camelCase metadata shape the rest of
// the harness consumes (name, version, rowCount, tableName, columnDefs, uploadedAt).
const hydrate = (row) =>
  row && {
    id: row.id,
    name: row.name,
    uploadedAt: row.uploaded_at,
    rowCount: row.row_count,
    version: row.version,
    tableName: row.table_name,
    columnDefs: JSON.parse(row.column_defs),
  };

/** All datasets, newest upload first, with columnDefs parsed. */
export function listDatasets() {
  ensureDatasetsTable();
  return getDb()
    .prepare(`SELECT * FROM datasets ORDER BY uploaded_at DESC`)
    .all()
    .map(hydrate);
}

/** Latest-version dataset row for a name, or null. */
export function findByName(name) {
  ensureDatasetsTable();
  // version DESC picks the highest version; id DESC picks the latest write within that version
  // (append/replace insert a fresh metadata row at the same version).
  const row = getDb()
    .prepare(`SELECT * FROM datasets WHERE name = ? ORDER BY version DESC, id DESC LIMIT 1`)
    .get(name);
  return hydrate(row) ?? null;
}

/** Physical table name for a versioned dataset. */
export const versionedTableName = (name, n) => `${name}_v${n}`;

/**
 * Create a new version: bump version, create <name>_v<N>, insert, write metadata.
 * @param {object} existing  metadata row from findByName
 * @returns {object} the new metadata row
 */
export function nextVersion(existing, columnDefs, rows) {
  const version = existing.version + 1;
  const tableName = versionedTableName(existing.name, version);
  createTable(tableName, columnDefs);
  const count = bulkInsert(tableName, columnDefs, rows);
  const id = writeDatasetMeta({ name: existing.name, rowCount: count, columnDefs, version, tableName });
  return { id, name: existing.name, rowCount: count, columnDefs, version, tableName };
}
