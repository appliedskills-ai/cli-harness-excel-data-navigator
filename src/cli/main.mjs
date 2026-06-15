// src/cli/main.mjs
//
// CLI entrypoint that `npm start` runs. Opens a @clack/prompts session, presents the
// top-level action menu, and dispatches to a mode handler via a dispatch table.
//
// Exit-code policy: 0 = success or user cancel; 1 = unexpected error.
import * as p from '@clack/prompts';
import { bootstrap } from '../config/bootstrap.mjs'; // triggers env validation on load
import { loadAnalysisModes } from '../config/catalogs.mjs';
import { logInteraction } from '../store/jsonl-log.mjs';

// p.isCancel must be checked after EVERY prompt — a single missed guard turns Ctrl-C
// into an unhandled rejection. guard() makes that uniform and impossible to forget.
function guard(v) {
  if (p.isCancel(v)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return v;
}

// Dispatch table (not a switch chain) so later epics register real handlers by
// replacing a stub row without touching control flow.
const dispatch = {
  ingest: async () => p.note('Ingest mode arrives in Epic 02 (Data Ingestion & Persistence).', 'Coming soon'),
  rowByRow: async () => p.note('Row-by-Row mode arrives in Epic 04 (Row-by-Row Analysis Mode).', 'Coming soon'),
  search: async () => p.note('Search mode arrives in Epic 05 (Dataset Search & Discovery Mode).', 'Coming soon'),
  resume: async () => p.note('Resume mode arrives in Epic 04 (Row-by-Row Analysis Mode).', 'Coming soon'),
};

async function main() {
  p.intro('Excel/CSV Data Navigator');

  // Source ingest/row-by-row/search labels from the preset catalog so they stay
  // consistent with the analysis-modes envelope; Resume is a built-in action.
  const modes = loadAnalysisModes();
  const byId = Object.fromEntries(modes.map((m) => [m.id, m]));
  const options = [
    { value: 'ingest', label: byId.ingest?.label ?? 'Ingest', hint: byId.ingest?.detail },
    { value: 'rowByRow', label: byId['row-by-row']?.label ?? 'Row-by-Row', hint: byId['row-by-row']?.detail },
    { value: 'search', label: byId.search?.label ?? 'Search', hint: byId.search?.detail },
    { value: 'resume', label: 'Resume', hint: 'Continue a saved session' },
  ];

  const action = guard(await p.select({ message: 'What would you like to do?', options }));

  const handler = dispatch[action];
  if (!handler) {
    p.note('Unknown action', 'Error');
  } else {
    logInteraction({ action }, { dispatched: true });
    await handler();
  }

  p.outro('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    p.log.error(String(err?.message ?? err));
    process.exit(1);
  });
