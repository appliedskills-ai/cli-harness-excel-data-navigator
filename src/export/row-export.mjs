// src/export/row-export.mjs
//
// Row → doc-type Markdown export. Fills the chosen doc type's fields grounded on the row: a field
// the row supplies is filled; a field it does not is an explicit abstention marker (never an
// invented value). Markdown is the only output format. The artifact lands under
// OUT_DIR/runs/<runId>/ via the storage helpers (artifact-report-schema conventions).
import { selectProvider } from '../providers/interface/selector.mjs';
import { writeText, makeRunId, runDirFor, byNewestRun } from '../store/runs.mjs';

const ABSTAIN = '_Not present in source row._';

// Case-insensitive lookup of a doc-type field name against the row's keys.
function valueFor(field, row) {
  if (row[field] != null && String(row[field]).trim() !== '') return row[field];
  const key = Object.keys(row).find((k) => k.toLowerCase() === String(field).toLowerCase());
  if (key && row[key] != null && String(row[key]).trim() !== '') return row[key];
  return undefined;
}

/**
 * Fill the docType's template from the row and render Markdown.
 * @param {{ row: object, docType: { id, label, fields }, provider? }} args
 * @returns {Promise<{ markdown: string, docTypeId: string, fields: object }>}
 */
export async function extractRowToDocType({ row, docType, provider = selectProvider() }) {
  const fields = {};
  const lines = [`# ${docType.label ?? docType.id}`, ''];
  for (const field of docType.fields ?? []) {
    const v = valueFor(field, row);
    fields[field] = v === undefined ? ABSTAIN : v;
    lines.push(`## ${field}`, v === undefined ? ABSTAIN : String(v), '');
  }
  // Narrative synthesis routed through the provider seam under the grounding posture.
  let narrative = '';
  try {
    const present = Object.entries(fields).filter(([, v]) => v !== ABSTAIN);
    const { text } = await provider.chat({
      system:
        'Write a 1-2 sentence summary grounded ONLY on the provided field values. ' +
        'Assert nothing the values do not support.',
      messages: [{ role: 'user', content: JSON.stringify(Object.fromEntries(present)) }],
    });
    narrative = text;
  } catch {
    narrative = ABSTAIN;
  }
  lines.push('## Summary', narrative || ABSTAIN, '');
  return { markdown: lines.join('\n'), docTypeId: docType.id, fields };
}

/**
 * Write the Markdown as a run artifact: runId = <fileKey>_<sessionId>_<timestamp>, under
 * OUT_DIR/runs/ via the storage helpers; newest-first via byNewestRun.
 * @returns {Promise<{ runId: string, path: string }>}
 */
export async function writeRowExport({ fileKey, sessionId, markdown, docTypeId, timestamp }) {
  const stamp = timestamp ?? new Date().toISOString().replace(/[:.]/g, '-');
  const runId = makeRunId(fileKey, sessionId, stamp);
  runDirFor(runId); // ensures the dir exists under OUT_DIR/runs/
  const path = writeText(runId, `document-${docTypeId}.md`, markdown);
  // byNewestRun is the canonical newest-first comparator (re-exported for callers listing runs).
  void byNewestRun;
  return { runId, path };
}

export { byNewestRun };
