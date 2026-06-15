// src/modes/row-by-row/state.mjs
//
// The row-by-row state slice + persist-after-every-action. The slice is namespaced under a
// `rowByRow` key in the session record so it coexists with other fields. notes/findings/flags/
// agentObservations are keyed by __rowid. Persistence goes through the active backend selection
// (STORAGE_BACKEND) — never open a store directly.
import { getBackend } from '../../store/backend.mjs';

/** Empty slice: empty per-row maps; cursor null until the first row. */
export function defaultState() {
  return { cursor: null, notes: {}, findings: {}, flags: {}, agentObservations: {} };
}

/** Record { rowid, index } from the current navigator position. */
export function updateCursor(state, navigator) {
  const row = navigator.current();
  state.cursor = row ? { rowid: row.__rowid, index: navigator.position() - 1 } : null;
  return state;
}

/** Append a note to state.notes[rowid]. */
export function addNote(state, rowid, text) {
  (state.notes[rowid] ??= []).push(text);
  return state;
}

/** Set a flag (boolean or reason string) for a row. */
export function setFlag(state, rowid, value = true) {
  state.flags[rowid] = value;
  return state;
}

/** Append a finding to state.findings[rowid]. */
export function saveFinding(state, rowid, finding) {
  (state.findings[rowid] ??= []).push(finding);
  return state;
}

/** Store the Feature-02 briefing object under state.agentObservations[rowid]. */
export function recordObservations(state, rowid, briefing) {
  state.agentObservations[rowid] = briefing;
  return state;
}

/**
 * Persist the slice into the session record (merged under `rowByRow`) via the active backend.
 * Persist-after-every-action: the caller invokes this after each handler.
 */
export function persist(sessionId, state, extra = {}) {
  const backend = getBackend();
  const existing = backend.get(sessionId) ?? {};
  const record = {
    ...existing,
    sessionId,
    mode: existing.mode ?? 'row-by-row',
    rowByRow: state,
    ...extra,
  };
  return backend.put(record);
}
