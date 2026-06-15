// src/modes/row-by-row/qa-loop.mjs
//
// The per-row interrogation: an unbounded loop (the only exits are DONE and cancel) that reads a
// question, answers it through the grounded Epic-03 agent tools, displays it, and logs each turn to
// <SESSION_ID>.jsonl. Answers cite their sources or say "I don't know" — never free-form generation.
import * as p from '@clack/prompts';
import { appendLine } from '../../store/jsonl-log.mjs';
import { runSqlTool } from '../../agent/tools/sql.mjs';
import { ragSearch } from '../../agent/tools/rag.mjs';
import { buildGroundedAnswer } from '../../agent/grounding.mjs';
import { findByName } from '../../db/metadata.mjs';
import { readRows } from '../../db/tables.mjs';

/** Other rows sharing the current row's first non-rowid column value (read-only), for citation. */
export function relatedRows(row, datasetId) {
  const meta = findByName(datasetId);
  if (!meta) return [];
  const keyCol = meta.columnDefs[0]?.name;
  if (!keyCol) return [];
  return readRows(meta.tableName)
    .filter((r) => r.__rowid !== row.__rowid && r[keyCol] === row[keyCol])
    .map((r) => r.__rowid);
}

/**
 * Answer one question through the Epic-03 tools + grounding guardrail.
 * @returns {Promise<{ answer: string, tools: string[], citedRowids: any[] }>}
 */
export async function answerQuestion(question, row, deps = {}) {
  const { datasetId } = deps;
  const tools = [];
  const toolResults = [];

  try {
    const sqlRes = await runSqlTool({ datasetId, question });
    tools.push('run_sql');
    toolResults.push(sqlRes);
  } catch {
    /* generation/exec may fail (e.g. offline) — fall through to RAG */
  }
  try {
    const hits = await ragSearch({ datasetId, query: question });
    tools.push('rag_search');
    toolResults.push(...hits);
  } catch {
    /* ignore */
  }

  const related = relatedRows(row, datasetId);
  if (related.length) {
    tools.push('related_rows');
    toolResults.push({ rows: related.map((rowid) => ({ __rowid: rowid })) });
  }

  const grounded = buildGroundedAnswer({
    answerText: `Based on the data for __rowid ${row.__rowid}.`,
    toolResults,
    question,
  });
  return {
    answer: grounded.answer,
    tools,
    citedRowids: grounded.citations?.rowids ?? [],
  };
}

/**
 * Read questions until DONE (or cancel), answering + logging each turn.
 * @param {{ row, sessionId, answerQuestion: Function }} deps
 */
export async function runQaLoop({ row, sessionId, answerQuestion: answer }) {
  // no question limit — the only exits are DONE and cancel
  for (;;) {
    const value = await p.text({ message: `Ask about __rowid ${row.__rowid} (or type DONE)` });
    if (p.isCancel(value)) {
      p.cancel('Cancelled.');
      return { cancelled: true };
    }
    if (String(value).trim().toUpperCase() === 'DONE') return { cancelled: false };

    const { answer: text, tools, citedRowids } = await answer(value, row);
    p.note(text, 'Answer');
    appendLine(sessionId, { type: 'qa', rowid: row.__rowid, question: value }, { answer: text, tools, citedRowids });
  }
}
