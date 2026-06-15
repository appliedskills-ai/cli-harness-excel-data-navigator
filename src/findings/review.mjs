// src/findings/review.mjs
//
// Clack review view over the cross-mode findings store: prompt for a filter (all / by kind / by
// row), list the matching entries grouped by kind + rowid, and return cleanly to the caller (no
// process exit). Every prompt is followed by an isCancel guard.
import * as p from '@clack/prompts';
import { KIND, listFindings } from './store.mjs';

export async function reviewFindings(sessionId) {
  const filter = await p.select({
    message: 'Review which findings?',
    options: [
      { value: 'all', label: 'All' },
      { value: 'kind', label: 'By kind' },
      { value: 'row', label: 'By row' },
    ],
  });
  if (p.isCancel(filter)) {
    p.cancel('Cancelled.');
    return;
  }

  let kind = null;
  let rowid;
  if (filter === 'kind') {
    const k = await p.select({
      message: 'Which kind?',
      options: Object.values(KIND).map((v) => ({ value: v, label: v })),
    });
    if (p.isCancel(k)) {
      p.cancel('Cancelled.');
      return;
    }
    kind = k;
  } else if (filter === 'row') {
    const r = await p.text({ message: '__rowid to filter by' });
    if (p.isCancel(r)) {
      p.cancel('Cancelled.');
      return;
    }
    rowid = Number(r);
  }

  const entries = await listFindings({ sessionId, kind, rowid });
  if (entries.length === 0) {
    p.note('(no findings match)', 'Findings');
    return entries;
  }
  const lines = entries.map(
    (e) => `[${e.kind}] rowid=${e.rowid ?? '-'} (${e.createdAt}): ${typeof e.body === 'string' ? e.body : JSON.stringify(e.body)}`,
  );
  p.note(lines.join('\n'), 'Findings');
  return entries;
}
