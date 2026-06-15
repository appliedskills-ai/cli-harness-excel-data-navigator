// src/modes/row-by-row/resume.mjs
//
// Resume flow: pick a prior session (or start fresh) via a clack select, then rehydrate the
// rowByRow state slice and re-derive the cursor index from the durable __rowid. Goes through the
// session store + active backend selection — never reads the backing files directly.
import * as p from '@clack/prompts';
import { getBackend } from '../../store/backend.mjs';
import { defaultState } from './state.mjs';

const NEW = 'new';

/** List prior SESSION_IDs (preferring those with a rowByRow slice) in a clack select. */
export async function chooseSession() {
  const backend = getBackend();
  const ids = backend.list();
  const withSlice = [];
  for (const id of ids) {
    const rec = backend.get(id);
    if (rec?.rowByRow) withSlice.push({ id, pos: rec.rowByRow.cursor?.index ?? 0 });
  }
  const options = [
    ...withSlice.map((s) => ({ value: s.id, label: `${s.id} (row ${s.pos + 1})` })),
    { value: NEW, label: 'Start fresh' },
  ];
  const choice = await p.select({ message: 'Resume a session?', options });
  if (p.isCancel(choice)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return choice; // a SESSION_ID, or 'new'
}

/**
 * Load + rehydrate the rowByRow slice and position the cursor at the saved __rowid.
 * @returns {Promise<{ cursor, notes, findings, flags, agentObservations }>}
 */
export async function resumeSession(sessionId, navigator) {
  const rec = getBackend().get(sessionId);
  const state = rec?.rowByRow ?? defaultState();

  if (state.cursor?.rowid != null) {
    const idx = navigator.indexOfRowid(state.cursor.rowid);
    if (idx >= 0) {
      navigator.jump(idx + 1); // jump is 1-based
    } else {
      // saved __rowid no longer exists — clamp to nearest valid position and note it
      navigator.jump(Math.min((state.cursor.index ?? 0) + 1, Math.max(1, navigator.count())));
      state.cursorNote = `saved __rowid ${state.cursor.rowid} no longer present; clamped`;
    }
  }
  return state;
}

export { NEW };
