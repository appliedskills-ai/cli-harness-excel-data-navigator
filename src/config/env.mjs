// src/config/env.mjs
//
// This is the ONLY module that reads `process.env`. Import `env` everywhere else —
// never read `process.env` directly in app code. The single zod `EnvSchema` below is
// the entire configuration contract: secrets are `.optional()`, discrete choices are
// `z.enum(...)`, and non-secret knobs carry a `.default(...)` so the app runs zero-config.
import 'dotenv/config';
import { z } from 'zod';

export const EnvSchema = z.object({
  MODEL_PROVIDER: z.enum(['claude','copilot']).default('claude'),
  EMBED_PROVIDER: z.enum(['claude','copilot']).optional(),
  STORAGE_BACKEND: z.enum(['filesystem', 'sqlite']).default('filesystem'),
  DATA_DIR: z.string().min(1).default('./data'),
  OUT_DIR: z.string().min(1).default('./out'),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  COPILOT_TOKEN: z.string().min(1).optional(),
  // Grounded-truth guardrail knobs (Epic 03): the unknown-response thresholds.
  RAG_MIN_SCORE: z.coerce.number().default(0.2),
  RAG_MIN_HITS: z.coerce.number().int().default(1),
  // Search-mode agent orchestration cap (Epic 05): max tool-call iterations per question.
  MAX_TOOL_ITERATIONS: z.coerce.number().int().default(6),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
