// src/store/runs.mjs
//
// Run-artifact storage helpers (artifact-report-schema conventions). A run writes exactly one dir
// OUT_DIR/runs/<runId>/ with runId = <fileKey>_<sessionId>_<timestamp> — file key leads, ISO stamp
// trails, three underscore-separated segments. Runs sort newest-first via byNewestRun on the
// embedded timestamp token (runStamp), NEVER a lexical sort of dir names.
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.mjs';

const runsRoot = () => path.join(env.OUT_DIR, 'runs');

/** Build a runId from its three segments (file key leading, ISO stamp trailing). */
export function makeRunId(fileKey, sessionId, timestamp) {
  return `${fileKey}_${sessionId}_${timestamp}`;
}

/** The trailing timestamp token of a runId (the third underscore-separated segment onward). */
export function runStamp(runId) {
  const parts = String(runId).split('_');
  return parts.slice(2).join('_'); // tolerate underscores inside an ISO stamp
}

/** Newest-first comparator on the embedded stamp (never a lexical dir-name sort). */
export function byNewestRun(a, b) {
  return runStamp(b).localeCompare(runStamp(a));
}

/** Resolve (and create) the run dir under OUT_DIR/runs/. */
export function runDirFor(runId) {
  const dir = path.join(runsRoot(), runId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** All run ids, newest-first. */
export function listRuns() {
  if (!fs.existsSync(runsRoot())) return [];
  return fs.readdirSync(runsRoot()).filter((n) => !n.startsWith('.')).sort(byNewestRun);
}

/** Write a text artifact under runDirFor(runId). @returns absolute path */
export function writeText(runId, relName, text) {
  const p = path.join(runDirFor(runId), relName);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return p;
}

/** Write a JSON artifact under runDirFor(runId). @returns absolute path */
export function writeJson(runId, relName, obj) {
  return writeText(runId, relName, JSON.stringify(obj, null, 2));
}
