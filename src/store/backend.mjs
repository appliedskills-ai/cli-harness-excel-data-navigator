// src/store/backend.mjs
//
// Backend selector — returns the active session record backend per STORAGE_BACKEND.
// Never hardcode a backend.
import { env } from '../config/env.mjs';
import { createFsSessionBackend } from './sessions-fs.mjs';
import { createSqliteSessionBackend } from './sessions-sqlite.mjs';

export function getBackend() {
  return env.STORAGE_BACKEND === 'sqlite'
    ? createSqliteSessionBackend()
    : createFsSessionBackend();
}
