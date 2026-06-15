---
name: ingest-tabular-to-sqlite
description: Ingest a CSV or XLSX file into the Data Navigator's SQLite store — read to a uniform {headers, rows} shape, infer per-column SQL types, create a __rowid-keyed data table and bulk-insert in one transaction, write the dataset metadata catalog row, and route name collisions through the four idea-mandated actions (continue / replace / append / new version). Use when adding or modifying the ingestion path, a reader, schema inference, the dataset/metadata DDL, dataset versioning, or the existing-dataset prompt.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
argument-hint: "[csv | xlsx | infer | metadata | existing-dataset]"
---

# Ingest tabular files into SQLite

The data-ingestion path: a CSV/XLSX file → a queryable, embeddable SQLite table with a metadata
catalog row. This is the densest, most error-prone slice of the harness (type coercion, sheet
selection, quoted DDL, versioning) — keep every stage to its single responsibility. Requires deps
installed ([`install-data-navigator-deps`](../install-data-navigator-deps/SKILL.md)) and env
configured ([`setup-excel-data-navigator`](../setup-excel-data-navigator/SKILL.md)).

## Pipeline (read → infer → create+insert → meta → route)

```
source path ──readCsv / readXlsxInteractive──▶ { headers, rows }
            ──buildColumnDefs──▶ ColumnDef[]  (name, sqlType, nullable, sample)
            ──routeIngest──▶ createTable + bulkInsert (+__rowid)  ──▶ writeDatasetMeta
```

## 1. Readers produce ONE uniform shape (`src/ingest/csv.mjs`, `src/ingest/xlsx.mjs`)

Both readers return exactly `{ headers: string[], rows: any[][] }` so every downstream stage is
format-agnostic — never branch on file type past the reader. Readers are pure: path in, table out,
**no DB and no prompts** (except the one sheet-picker below).

- `readCsv(path)` — `csv-parse/sync` with `skip_empty_lines`, `relax_column_count`, `trim`. Empty
  file → `{ headers: [], rows: [] }`. First record is the header row.
- `readXlsx(path, sheetName?)` — defaults to the first sheet; `sheet_to_json(ws, { header: 1,
  blankrows: false, defval: null })`. `xlsx` is CommonJS — `import xlsx from 'xlsx'` then
  `const { readFile, utils } = xlsx` (named ESM imports fail).
- `readXlsxInteractive(path)` — prompts for a sheet **only** when `listSheets(path).length > 1`; a
  single-sheet workbook reads silently. A `p.isCancel` guard follows the prompt.

```js
// Good — downstream stays format-agnostic on the uniform shape
const { headers, rows } = ext === '.xlsx' ? await readXlsxInteractive(path) : readCsv(path);
const columnDefs = buildColumnDefs(headers, rows);

// Bad — leaking the format past the reader
if (ext === '.xlsx') { const wb = xlsx.readFile(path); /* re-parsing downstream */ }
```

## 2. Schema inference is deterministic (`src/ingest/infer-schema.mjs`)

`inferColumnTypes(headers, rows, { sampleSize = 200 })` infers one SQL type per column from a bounded
sample, null/empty excluded, **first all-match wins** with precedence
**INTEGER → REAL → BOOLEAN → DATE → TEXT** (a column of all-empty values falls back to `TEXT`).
`buildColumnDefs(...)` wraps it into `ColumnDef { name, sqlType, nullable, sample }` — the one shape
reused by table DDL, metadata JSON, and append/replace alignment. Preserve the precedence order and
the null-exclusion rule; both DDL and versioning depend on stable `columnDefs`.

## 3. Table create + insert, always `__rowid`-keyed (`src/db/tables.mjs`)

- `createTable(name, columnDefs)` — `CREATE TABLE IF NOT EXISTS` with a mandatory
  `__rowid INTEGER PRIMARY KEY AUTOINCREMENT` surrogate. **Every data table needs `__rowid`** — it is
  the stable join key for RAG/embedding hits later (Epic 03). Identifiers go through `quoteIdent()`
  (double-quote, escape embedded quotes) so a hostile header can't inject SQL.
- `bulkInsert(name, columnDefs, rows)` — one prepared statement inside a single
  `db.transaction(...)`; missing cells coerce to `null` (`r[i] ?? null`). Returns the row count.
- Reads: `readRowsOrdered` (canonical `ORDER BY __rowid` cursor sequence), `readRowsByRowid`
  (parameterized `IN (...)`, never interpolated — for RAG hit → full-row lookup).

```js
// Good — quoted ident, __rowid surrogate, parameterized insert in a transaction
createTable(name, columnDefs);            // adds __rowid PK
const n = bulkInsert(name, columnDefs, rows);

// Bad — interpolated identifier + per-row autocommit (injection + slow)
db.exec(`CREATE TABLE ${name} (${headers.join(',')})`);   // no quoting, no __rowid
for (const r of rows) db.prepare(`INSERT ... VALUES ('${r}')`).run();
```

## 4. Metadata catalog + versioning (`src/db/metadata.mjs`)

`ensureDatasetsTable()` creates the `datasets` catalog holding the five idea-mandated fields
(`name`, `uploaded_at`, `row_count`, `column_defs` as JSON, `version`) plus a separate
`table_name`. Storing `table_name` apart from the user-facing `name` is what enables `<name>_v<N>`
versioning (`versionedTableName`). `writeDatasetMeta(...)` stamps `uploaded_at` with
`new Date().toISOString()` and inserts one row per ingest. `findByName` returns the latest
(`ORDER BY version DESC, id DESC`); `listDatasets` returns newest-upload-first with `column_defs`
parsed. Add a metadata field to the DDL, the `INSERT`, **and** `hydrate()` together.

## 5. Existing-dataset routing — the four actions (`src/ingest/existing-dataset.mjs`)

`routeIngest({ name, columnDefs, rows })` detects a name collision via `findByName` and dispatches.
On a fresh name it does `createTable` + `bulkInsert` + `writeDatasetMeta(version:1)`. On a collision
it prompts (`@clack/prompts`) for one of `ACTIONS`:

- `CONTINUE` — no writes; return the existing metadata row.
- `REPLACE` — `replaceTable` (DROP + recreate + re-insert) at the same version.
- `APPEND` — `appendRecords`, which **rejects a column mismatch** (`sameColumns` by name) before
  inserting, then updates `row_count`.
- `NEW_VERSION` — `nextVersion`: bump version, create `<name>_v<N>`, insert, write fresh metadata.

This module is the **dispatcher**; the DB modules own the mutations. Keep that split — don't inline
DDL here, and don't prompt inside the DB modules. Every prompt has a `p.isCancel` guard that
`p.cancel(...)` + `process.exit(0)` (cancel is exit 0).

## 6. Log the interaction

Per the idea brief, each ingest request/response is one line in the session JSONL. Call
`logInteraction(request, response)` once for the ingest action (see
[`setup-excel-data-navigator`](../setup-excel-data-navigator/SKILL.md) §5).

## Verify

```bash
# fixtures committed at repo root
node -e "import('./src/ingest/csv.mjs').then(m=>console.log(m.readCsv('fixtures/sample.csv')))"
node --test                         # unit tests for readers/inference
```

Edge fixtures to exercise: `fixtures/empty.csv` (no rows), `fixtures/headeronly.csv` (headers, zero
rows), `fixtures/multi.xlsx` (multi-sheet → sheet picker), `fixtures/sample.csv` /
`fixtures/sample.xlsx`.

## Ingest checklist

1. Reader returns `{ headers, rows }`; multi-sheet xlsx prompts, single-sheet doesn't.
2. `columnDefs` typed by the fixed precedence; nulls excluded from the sample.
3. Table created with `__rowid`; identifiers quoted; insert in one transaction.
4. One `datasets` metadata row written with all five fields + `table_name`.
5. Collision routed to CONTINUE/REPLACE/APPEND/NEW_VERSION; APPEND rejects column drift.
6. Each prompt has a `p.isCancel` guard; the interaction is logged once.

## Reference files

- `src/ingest/csv.mjs`, `src/ingest/xlsx.mjs` — readers → uniform `{ headers, rows }`.
- `src/ingest/source-prompt.mjs` — validated path prompt (`.csv`/`.xlsx`, file exists).
- `src/ingest/infer-schema.mjs` — `inferColumnTypes` / `buildColumnDefs`.
- `src/db/tables.mjs` — `createTable` (+`__rowid`), `bulkInsert`, append/replace, reads.
- `src/db/metadata.mjs` — `datasets` catalog, `writeDatasetMeta`, versioning.
- `src/ingest/existing-dataset.mjs` — `routeIngest` + the four `ACTIONS`.
- `src/db/sqlite.mjs` — `getDb()` singleton (WAL, `DATA_DIR`).
- Related: `.claude/rules/config-store-schema.md`; downstream RAG joins on `__rowid` (Epic 03).
