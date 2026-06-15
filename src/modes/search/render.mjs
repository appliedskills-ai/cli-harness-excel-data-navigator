// src/modes/search/render.mjs
//
// The Search-mode output renderer: NL answer + SQL echo + citations footer, aligned tables,
// labelled aggregation blocks, and the generative executive summary (the only generative output,
// kept grounded with an explicit confidence / abstain note). Plain stdout strings — no rendering
// dependency. Consumes the { answer/answerText, citations, toolResults } shape from buildGroundedAnswer.
import { GROUNDING_SYSTEM_PROMPT, hasSufficientEvidence } from '../../agent/grounding.mjs';
import { selectProvider } from '../../providers/interface/selector.mjs';

const ABSTAIN_NOTE = "(insufficient data — abstaining; no confident answer from the grounded tool results)";
const fmtNum = (n) =>
  typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : String(n);

/** NL answer text + a citations footer (source __rowids and/or SQL). */
export function renderAnswer({ answerText, answer, citations, unknown } = {}) {
  const text = answer ?? answerText ?? '';
  if (unknown || !citations) {
    return `${text}\n${unknown ? ABSTAIN_NOTE : ''}`.trimEnd();
  }
  const parts = [text];
  if (citations.rowids?.length) parts.push(`Sources: __rowid ${citations.rowids.join(', ')}`);
  if (citations.sql?.length) parts.push(`SQL: ${citations.sql.join(' ; ')}`);
  return parts.join('\n');
}

/** Echo executed SQL in a fenced, copy-pasteable block. */
export function renderSqlEcho(sql) {
  return ['```sql', String(sql).trim(), '```'].join('\n');
}

const truncate = (s, w) => (s.length > w ? s.slice(0, Math.max(0, w - 1)) + '…' : s);

/** Aligned table from row objects; "(no rows)" for an empty set. */
export function renderTable(rows, { columns, maxColWidth = 40 } = {}) {
  if (!rows || rows.length === 0) return '(no rows)';
  const cols = columns ?? Object.keys(rows[0]);
  const widths = cols.map((c) =>
    Math.min(maxColWidth, Math.max(String(c).length, ...rows.map((r) => String(r[c] ?? '').length))),
  );
  const line = (cells) => cells.map((cell, i) => truncate(String(cell ?? ''), widths[i]).padEnd(widths[i])).join(' | ');
  const header = line(cols);
  const sep = widths.map((w) => '-'.repeat(w)).join('-+-');
  return [header, sep, ...rows.map((r) => line(cols.map((c) => r[c])))].join('\n');
}

/** Labelled aggregation blocks with thousands separators. */
export function renderAggregations(aggs) {
  if (!aggs || aggs.length === 0) return '(no aggregations)';
  return aggs
    .map((a) => {
      const label = a.column ? `${a.op}(${a.column})` : a.op;
      return `${label} = ${fmtNum(a.value)}`;
    })
    .join('\n');
}

/**
 * Generative executive summary — grounded, with an explicit confidence / abstain note. When the
 * evidence is empty / below threshold, renders the abstain note instead of a narrative.
 */
export async function renderExecutiveSummary({ toolResults, provider = selectProvider() }) {
  if (!hasSufficientEvidence(toolResults)) {
    return `Executive summary:\n${ABSTAIN_NOTE}`;
  }
  const { text } = await provider.chat({
    system: GROUNDING_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Synthesize a short executive summary ONLY from these grounded results:\n${JSON.stringify(toolResults).slice(0, 4000)}`,
      },
    ],
  });
  // Confidence signal from the evidence volume (row counts + RAG hit scores).
  const entries = toolResults.flat?.() ?? toolResults;
  const rowCount = entries.reduce((s, e) => s + (Array.isArray(e?.rows) ? e.rows.length : 0), 0);
  const ragScore = Math.max(0, ...entries.filter((e) => typeof e?.score === 'number').map((e) => e.score));
  const confidence = rowCount > 0 || ragScore >= 0.5 ? 'high' : 'low';
  return `Executive summary:\n${text}\n(confidence: ${confidence})`;
}
