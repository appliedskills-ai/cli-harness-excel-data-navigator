// src/modes/row-by-row/controls.mjs
//
// Free-text command vocabulary → typed command objects (pure, no I/O), plus a small dispatcher
// mapping a parsed command to a loop flow result. DONE advances the cursor; EXIT leaves the mode.
const JUMP_RE = /^JUMP\s+TO\s+ROW\s+(\d+)\s*$/;

/**
 * Parse free-text into a typed command. Never throws; unmatched input → { type: 'unknown', raw }.
 * @returns {{ type: string, [k: string]: any }}
 */
export function parseCommand(input) {
  const raw = String(input ?? '');
  const s = raw.trim().toUpperCase();
  const jump = s.match(JUMP_RE);
  if (jump) return { type: 'jump', n: Number(jump[1]) };
  switch (s) {
    case 'NEXT': return { type: 'next' };
    case 'PREVIOUS': case 'PREV': return { type: 'previous' };
    case 'SKIP': return { type: 'skip' };
    case 'FLAG': return { type: 'flag' };
    case 'ADD NOTE': case 'NOTE': return { type: 'note' };
    case 'SAVE FINDING': case 'FINDING': return { type: 'finding' };
    case 'EXIT': return { type: 'exit' };
    case 'DONE': return { type: 'done' };
    default: return { type: 'unknown', raw };
  }
}

/**
 * Map a parsed command to a flow result the mode loop acts on.
 * @returns {{ action: 'advance'|'stay'|'exit', moved?: any }}
 */
export function applyCommand(command, navigator, ctx) {
  switch (command.type) {
    case 'done':
      return { action: 'advance', moved: navigator.next() };
    case 'skip':
      // advance without recording analysis
      return { action: 'advance', moved: navigator.next() };
    case 'next':
      return { action: 'stay', moved: navigator.next() };
    case 'previous':
      return { action: 'stay', moved: navigator.previous() };
    case 'jump':
      return { action: 'stay', moved: navigator.jump(command.n) };
    case 'exit':
      return { action: 'exit' };
    case 'flag':
    case 'note':
    case 'finding':
      // annotation writes are owned by the Feature 04 handlers in the caller
      return { action: 'stay' };
    default:
      return { action: 'stay' };
  }
}
