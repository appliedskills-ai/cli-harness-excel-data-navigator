// src/agent/grounding.mjs
//
// The grounding contract that makes the agent trustworthy: every answer cites the exact evidence
// it used (source __rowids and/or the SQL it ran) and asserts only what the tool results support.
// When evidence is insufficient, the agent says "I don't know" instead of fabricating.
import { env } from '../config/env.mjs';

export const GROUNDING_SYSTEM_PROMPT = [
  'You are a data-analysis assistant grounded STRICTLY in tool results.',
  'Rules:',
  '- Answer ONLY from the provided tool results (SQL rows, aggregate values, RAG hits).',
  '- For every claim, cite the source __rowid(s) and/or the exact SQL you ran.',
  '- NEVER invent data, columns, or rows that are not present in the tool results.',
  "- If the tool results do not support an answer, say you don't know — do not guess.",
  'Only assert what is directly supported by the tool results.',
].join('\n');

/** Heuristic classification of a single tool-result entry. */
function isRagHit(e) {
  return e && typeof e === 'object' && 'score' in e && 'rowid' in e;
}
function flatten(toolResults) {
  // Accept either a flat array of entries or nested arrays (e.g. a RAG hit list).
  const out = [];
  for (const r of toolResults ?? []) {
    if (Array.isArray(r)) out.push(...r);
    else out.push(r);
  }
  return out;
}

/** Extract { rowids, sql } from the SQL / aggregate / RAG tool outputs. */
export function collectCitations(toolResults) {
  const rowids = new Set();
  const sql = [];
  for (const e of flatten(toolResults)) {
    if (!e || typeof e !== 'object') continue;
    if (typeof e.sql === 'string') sql.push(e.sql);
    if (isRagHit(e) && e.rowid != null) rowids.add(e.rowid);
    if (Array.isArray(e.rows)) {
      for (const row of e.rows) if (row && row.__rowid != null) rowids.add(row.__rowid);
    }
  }
  return { rowids: [...rowids], sql };
}

/**
 * True when the evidence is strong enough to answer.
 * False when ALL SQL/aggregate results are empty AND there are fewer than `minHits`
 * RAG hits at or above `minScore`.
 */
export function hasSufficientEvidence(
  toolResults,
  { minHits = env.RAG_MIN_HITS, minScore = env.RAG_MIN_SCORE } = {},
) {
  const entries = flatten(toolResults);
  const sqlHasRows = entries.some((e) => Array.isArray(e?.rows) && e.rows.length > 0);
  const aggHasValue = entries.some(
    (e) => e && typeof e === 'object' && 'value' in e && e.value !== null && e.value !== 0,
  );
  const goodRagHits = entries.filter((e) => isRagHit(e) && e.score >= minScore).length;
  if (sqlHasRows || aggHasValue) return true;
  return goodRagHits >= minHits;
}

/** The fixed, explicit unknown-response message. */
export function unknownResponse(question) {
  return (
    "I don't know — the dataset doesn't contain enough information to answer that. " +
    '(No matching rows or sufficiently confident matches were found.)'
  );
}

/**
 * Attach a citations block to the rendered answer, or short-circuit to the unknown response when
 * the evidence is insufficient — the agent must not fabricate.
 * @returns {{ answer: string, citations?: { rowids: any[], sql: string[] }, unknown?: boolean }}
 */
export function buildGroundedAnswer({ answerText, toolResults, question } = {}) {
  if (!hasSufficientEvidence(toolResults)) {
    return { answer: unknownResponse(question), unknown: true };
  }
  return { answer: answerText, citations: collectCitations(toolResults), unknown: false };
}
