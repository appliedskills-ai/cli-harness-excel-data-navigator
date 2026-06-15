// src/config/bootstrap.mjs
//
// Single derived configuration object so modes don't re-derive defaults everywhere.
// Reads only the validated `env` — never `process.env`.
import { env } from './env.mjs';

// modelProvider: default to 'claude' when MODEL_PROVIDER is unset.
const modelProvider = env.MODEL_PROVIDER ?? 'claude';
// embedProvider: mirror the model provider unless EMBED_PROVIDER overrides it.
const embedProvider = env.EMBED_PROVIDER ?? modelProvider;
// storageBackend: already defaulted to 'filesystem' by the schema.
const storageBackend = env.STORAGE_BACKEND;
// directory paths: schema-defaulted to ./data and ./out.
const dataDir = env.DATA_DIR;
const outDir = env.OUT_DIR;

export function buildBootstrap() {
  return Object.freeze({ modelProvider, embedProvider, storageBackend, dataDir, outDir });
}

export const bootstrap = buildBootstrap();
