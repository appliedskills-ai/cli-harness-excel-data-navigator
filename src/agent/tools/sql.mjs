// src/agent/tools/sql.mjs
//
// NL→SQL generation (grounded by the real schema) + a defense-in-depth read-only executor.
// Generated SQL must never mutate the user's data: we open read-only AND statically reject any
// non-SELECT statement, then cap the result set.
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { env } from '../../config/env.mjs';
import { selectProvider } from '../../providers/interface/selector.mjs';
import { findByName } from '../../db/metadata.mjs';

/**
 * Turn a question into a single read-only SELECT, grounded by the dataset's real schema.
 * @returns {Promise<{ sql: string, columnDefs: object[], table: string }>}
 */
export async function generateSql({ datasetId, question }) {
  const meta = findByName(datasetId);
  if (!meta) throw new Error(`Unknown dataset: ${datasetId}`);
  const { tableName: table, columnDefs } = meta;
  const schema = columnDefs.map((d) => `${d.name} ${d.sqlType}`).join(', ');
  const system =
    'You translate questions into a SINGLE read-only SQLite SELECT. ' +
    'Use ONLY the columns provided. No DDL/DML, no multiple statements, no comments. ' +
    'Return only the SQL.';
  const messages = [
    {
      role: 'user',
      content:
        `Table "${table}" has columns: ${schema}.\n` +
        `Write one SELECT that answers: ${question}`,
    },
  ];
  const provider = selectProvider();
  const { text } = await provider.chat({ system, messages }); // reads ChatResult.text
  const sql = text.replace(/```sql/gi, '').replace(/```/g, '').trim();
  return { sql, columnDefs, table };
}

/**
 * Reject anything that is not a single read-only SELECT.
 * @param {string} sql
 */
export function assertSelectOnly(sql) {
  const trimmed = String(sql).trim().replace(/;\s*$/, '');
  if (trimmed.includes(';')) {
    throw new Error('read-only: only a single SELECT is allowed (multiple statements rejected)');
  }
  const lowered = trimmed.toLowerCase();
  if (!/^(select|with)\b/.test(lowered)) {
    throw new Error('read-only: only SELECT is allowed');
  }
  if (/\b(insert|update|delete|drop|alter|create|replace|attach|pragma|vacuum)\b/.test(lowered)) {
    throw new Error('read-only: only SELECT is allowed (DDL/DML keyword detected)');
  }
  return trimmed;
}

/**
 * Execute a guarded SELECT on a read-only connection, capped at maxRows.
 * @returns {Promise<{ sql: string, rows: object[], truncated: boolean }>}
 */
export async function executeReadOnly({ sql, maxRows = 500 }) {
  const safe = assertSelectOnly(sql);
  const db = new Database(join(env.DATA_DIR, 'navigator.db'), { readonly: true });
  try {
    const all = db.prepare(safe).all();
    const rows = all.slice(0, maxRows);
    return { sql: safe, rows, truncated: all.length > maxRows };
  } finally {
    db.close();
  }
}

/** Chain generate → assert → execute. */
export async function runSqlTool({ datasetId, question, maxRows = 500 }) {
  const { sql } = await generateSql({ datasetId, question });
  assertSelectOnly(sql);
  return executeReadOnly({ sql, maxRows });
}

export const sqlTool = { name: 'run_sql', params: { datasetId: 'string', question: 'string', maxRows: 'number?' } };
