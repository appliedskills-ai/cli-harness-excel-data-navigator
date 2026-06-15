// src/db/tables.mjs
//
// Typed data-table create + bulk insert, plus append/replace write actions. Every data table
// gets a __rowid surrogate primary key so every row has a stable key for later RAG/embedding
// joins (Epic 03). Identifiers are quoted to prevent injection from headers.
import { getDb } from './sqlite.mjs';
import { writeDatasetMeta } from './metadata.mjs';

/** Quote a SQL identifier safely (double-quote, escape embedded quotes). */
export const quoteIdent = (s) => `"${String(s).replace(/"/g, '""')}"`;

/** CREATE TABLE IF NOT EXISTS from columnDefs with a __rowid surrogate. */
export function createTable(name, columnDefs) {
  const cols = columnDefs
    .map((d) => `${quoteIdent(d.name)} ${d.sqlType}${d.nullable ? '' : ' NOT NULL'}`)
    .join(', ');
  getDb()
    .prepare(
      `CREATE TABLE IF NOT EXISTS ${quoteIdent(name)} ` +
        `(__rowid INTEGER PRIMARY KEY AUTOINCREMENT, ${cols})`,
    )
    .run();
}

/** Prepared bulk insert inside one transaction. @returns {number} rows inserted */
export function bulkInsert(name, columnDefs, rows) {
  const db = getDb();
  const cols = columnDefs.map((d) => quoteIdent(d.name)).join(', ');
  const ph = columnDefs.map(() => '?').join(', ');
  const stmt = db.prepare(`INSERT INTO ${quoteIdent(name)} (${cols}) VALUES (${ph})`);
  const insertMany = db.transaction((all) => {
    for (const r of all) stmt.run(columnDefs.map((_d, i) => r[i] ?? null));
  });
  insertMany(rows);
  return rows.length;
}

/** Read every row of a data table as an object (includes the __rowid surrogate). */
export function readRows(tableName) {
  return getDb().prepare(`SELECT * FROM ${quoteIdent(tableName)}`).all();
}

/** Read every row in stable `ORDER BY __rowid` order (the cursor's canonical sequence). */
export function readRowsOrdered(tableName) {
  return getDb().prepare(`SELECT * FROM ${quoteIdent(tableName)} ORDER BY __rowid`).all();
}

/**
 * Batched read-only lookup of full rows by __rowid. Parameterized (never interpolates rowids).
 * @returns {object[]} rows in arbitrary order; callers re-impose ranking
 */
export function readRowsByRowid(tableName, rowids) {
  if (!rowids.length) return [];
  const ph = rowids.map(() => '?').join(', ');
  return getDb()
    .prepare(`SELECT * FROM ${quoteIdent(tableName)} WHERE __rowid IN (${ph})`)
    .all(...rowids);
}

const sameColumns = (a, b) =>
  a.length === b.length && a.every((d, i) => d.name === b[i].name);

/** Append new rows to the existing table; columns must align by name. */
export function appendRecords(existing, columnDefs, rows) {
  if (!sameColumns(existing.columnDefs, columnDefs)) {
    throw new Error(`Append column mismatch for "${existing.name}" — schemas differ`);
  }
  const count = bulkInsert(existing.tableName, columnDefs, rows);
  const total = existing.rowCount + count;
  writeDatasetMeta({
    name: existing.name, rowCount: total, columnDefs,
    version: existing.version, tableName: existing.tableName,
  });
  return { ...existing, rowCount: total };
}

/** Replace: drop + recreate the table from the new columnDefs, then re-insert. */
export function replaceTable(existing, columnDefs, rows) {
  const db = getDb();
  db.prepare(`DROP TABLE IF EXISTS ${quoteIdent(existing.tableName)}`).run();
  createTable(existing.tableName, columnDefs);
  const count = bulkInsert(existing.tableName, columnDefs, rows);
  writeDatasetMeta({
    name: existing.name, rowCount: count, columnDefs,
    version: existing.version, tableName: existing.tableName,
  });
  return { ...existing, rowCount: count, columnDefs };
}
