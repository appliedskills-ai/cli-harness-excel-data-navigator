// src/providers/interface/selector.mjs
//
// The selector is the ONLY place that knows which concrete providers exist. One registry row
// per backend; it resolves the active provider from env.MODEL_PROVIDER, runs a credential check,
// and falls back to the deterministic offline stub when no credentials are present so the CLI
// and tests work without a live key. No vendor imports here — only the binding factories.
import { env } from '../../config/env.mjs';
import { createClaudeProvider } from '../claude-provider.mjs';
import { createCopilotProvider } from '../copilot-provider.mjs';
import { createOfflineProvider } from '../offline-provider.mjs';

const REGISTRY = [
  { id: 'claude', create: createClaudeProvider, hasCredentials: () => !!env.ANTHROPIC_API_KEY },
  { id: 'copilot', create: createCopilotProvider, hasCredentials: () => !!env.COPILOT_TOKEN },
];

/** Registered provider ids, for diagnostics. */
export function listProviders() {
  return REGISTRY.map((r) => r.id);
}

/**
 * Resolve the active provider. Returns the offline stub when the selected provider has no
 * credentials configured.
 * @param {object} [cfg] defaults to the validated env
 * @returns {import('./contract.mjs').Provider}
 */
export function selectProvider(cfg = env) {
  const row = REGISTRY.find((r) => r.id === cfg.MODEL_PROVIDER);
  if (!row) {
    throw new Error(`Unknown MODEL_PROVIDER: ${cfg.MODEL_PROVIDER} (known: ${listProviders().join(', ')})`);
  }
  if (!row.hasCredentials()) {
    return createOfflineProvider();
  }
  return row.create();
}
