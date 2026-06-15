// src/modes/row-by-row/generate.mjs
//
// Per-row briefing: a Summary + Key observations (model-generated, grounded on the row's values),
// Potential anomalies + Suggested questions (also model-generated under the grounding posture), and
// Missing-data (computed LOCALLY from the row — never hallucinated). Goes through the provider seam;
// no vendor SDK import here.
import { selectProvider } from '../../providers/interface/selector.mjs';

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

/** Stable column→value grounding context for a row. */
function groundingContext(row, columnDefs) {
  const cols = (columnDefs && columnDefs.length) ? columnDefs.map((d) => d.name) : Object.keys(row);
  return cols.map((name) => `${name}: ${isEmpty(row[name]) ? '(empty)' : row[name]}`).join('\n');
}

/** Columns whose value is null / undefined / empty — computed directly from the row, not the model. */
export function computeMissingData(row, columnDefs) {
  const cols = (columnDefs && columnDefs.length) ? columnDefs.map((d) => d.name) : Object.keys(row);
  return cols.filter((name) => isEmpty(row[name]));
}

// Defensive parse of a delimited / JSON-ish reply into named sections.
function parseSections(text) {
  let obj = null;
  try { obj = JSON.parse(text); } catch { /* fall through to delimited parse */ }
  if (obj && typeof obj === 'object') {
    return {
      summary: String(obj.summary ?? ''),
      observations: Array.isArray(obj.observations) ? obj.observations : [],
      anomalies: Array.isArray(obj.anomalies) ? obj.anomalies : [],
      suggestedQuestions: Array.isArray(obj.suggestedQuestions) ? obj.suggestedQuestions : [],
    };
  }
  // Fallback: first non-empty line is the summary, bullet lines are observations.
  const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean);
  const summary = lines.find((l) => !l.startsWith('-')) ?? '';
  const observations = lines.filter((l) => l.startsWith('-')).map((l) => l.replace(/^-\s*/, ''));
  return { summary, observations, anomalies: [], suggestedQuestions: [] };
}

/** Summary + Key observations portion of the briefing. */
export async function generateSummary(row, schema, columnDefs, provider = selectProvider()) {
  const system =
    'You brief an analyst on ONE data row. Assert only what the row values support. ' +
    'Reply as JSON: { "summary": string, "observations": string[] }.';
  const messages = [
    { role: 'user', content: `Schema: ${schema}\nRow:\n${groundingContext(row, columnDefs)}` },
  ];
  const { text } = await provider.chat({ system, messages });
  const parsed = parseSections(text);
  return { summary: parsed.summary, observations: parsed.observations };
}

/**
 * Full per-row briefing. missingData is always computed locally.
 * @returns {Promise<{ summary, observations[], anomalies[], missingData[], suggestedQuestions[] }>}
 */
export async function generateBriefing(row, schema, columnDefs, provider = selectProvider()) {
  const system =
    'You brief an analyst on ONE data row. Assert only what the row values support. Reply as JSON: ' +
    '{ "summary": string, "observations": string[], "anomalies": string[], "suggestedQuestions": string[] }.';
  const messages = [
    { role: 'user', content: `Schema: ${schema}\nRow:\n${groundingContext(row, columnDefs)}` },
  ];
  const { text } = await provider.chat({ system, messages });
  const parsed = parseSections(text);
  return {
    summary: parsed.summary,
    observations: parsed.observations,
    anomalies: parsed.anomalies,
    missingData: computeMissingData(row, columnDefs),
    suggestedQuestions: parsed.suggestedQuestions,
  };
}
