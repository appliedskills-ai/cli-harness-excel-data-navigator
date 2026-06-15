---
name: setup-excel-data-navigator
description: Bring a fresh checkout of the Excel/CSV Data Navigator to a runnable, validated state — configure the single zod EnvSchema, the derived bootstrap object, preset catalogs, the better-sqlite3 handle and data/out dirs, the per-session JSONL interaction log, and the healthz gate. Use when setting up the app for the first time, adding an env var, adding a preset catalog, choosing the storage backend, or diagnosing a startup/config failure.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
argument-hint: "[env-var | preset-name | \"verify\"]"
---

# Setup — Excel/CSV Data Navigator

Configure the harness so `npm start` (`src/cli/main.mjs`) boots cleanly. Setup is **config, not
code**: the env contract, the derived bootstrap, the preset catalogs, the sqlite handle + data
dirs, the session log, and the healthz gate. For dependency installation see the
[`install-data-navigator-deps`](../install-data-navigator-deps/SKILL.md) skill; for loading a
dataset see [`ingest-tabular-to-sqlite`](../ingest-tabular-to-sqlite/SKILL.md).

## 1. Env is the only `process.env` reader (`src/config/env.mjs`)

`EnvSchema` (a single `z.object`) is the **whole** configuration contract. Every other module
imports the frozen `env` export — **never** read `process.env` directly. The schema is parsed once
at load; an invalid env prints `error.format()` and `process.exit(1)`, so a misconfigured app fails
loudly at startup rather than misbehaving later.

Field conventions — match these when adding a field:

- **Secrets** are `.optional()` — `ANTHROPIC_API_KEY`, `COPILOT_TOKEN`. The app runs zero-config
  offline without them; a provider throws only when actually invoked.
- **Discrete choices** are `z.enum(...)` — `MODEL_PROVIDER` (`claude`|`copilot`, default `claude`),
  `EMBED_PROVIDER` (`claude`|`copilot`, optional), `STORAGE_BACKEND` (`filesystem`|`sqlite`,
  default `filesystem`).
- **Non-secret knobs** carry a `.default(...)` so the app runs with no `.env` — `DATA_DIR`
  (`./data`), `OUT_DIR` (`./out`), `RAG_MIN_SCORE` (`0.2`), `RAG_MIN_HITS` (`1`),
  `MAX_TOOL_ITERATIONS` (`6`). Use `z.coerce.number()` for numeric env (env values are strings).

```js
// Good — secret optional, choice as enum, knob defaulted+coerced; read the validated export
ANTHROPIC_API_KEY: z.string().min(1).optional(),
STORAGE_BACKEND:   z.enum(['filesystem', 'sqlite']).default('filesystem'),
RAG_MIN_SCORE:     z.coerce.number().default(0.2),
import { env } from '../config/env.mjs';   // everywhere else
const dir = env.DATA_DIR;                   // never process.env.DATA_DIR

// Bad — required secret breaks zero-config; raw read bypasses validation
ANTHROPIC_API_KEY: z.string(),              // app won't boot without a key
const dir = process.env.DATA_DIR;           // unvalidated, undefined by default
```

`.env` is loaded via `import 'dotenv/config'` at the top of `env.mjs`. Put real secrets in `.env`
(gitignored); never commit a key. For test fixtures use a `.env.testdata` file with a neutral key
name, per the user's global convention.

## 2. Derived config lives in bootstrap (`src/config/bootstrap.mjs`)

`buildBootstrap()` derives `{ modelProvider, embedProvider, storageBackend, dataDir, outDir }` from
the validated `env` **once**, frozen, so modes don't re-derive defaults. `embedProvider` mirrors
`modelProvider` unless `EMBED_PROVIDER` overrides it. Importing `bootstrap` is also what triggers
env validation on load (the CLI imports it first for exactly this reason). Add a derived value here,
not inline in a mode.

## 3. Preset catalogs keep the envelope (`src/config/catalogs.mjs` + `presets/*.json`)

Every catalog under `src/config/presets/` follows the envelope
`{ version, id, kind, title, description, presets:[{ id, kind, label, detail, description }] }` and is
loaded through `loadCatalog()`, which throws on any missing envelope or preset field. The top-level
menu labels come from `analysis-modes.json` via `loadAnalysisModes()` — add a mode by adding a
preset entry, not by hardcoding a label in the CLI. Do not ship a catalog missing `version`/`kind`
or a `presets[]` entry missing `id`/`label`.

## 4. SQLite handle + data dirs (`src/db/sqlite.mjs`)

`getDb()` is a process-singleton `better-sqlite3` handle at `<DATA_DIR>/navigator.db`, opened in
`WAL` mode with `foreign_keys = ON`; it `mkdirSync(env.DATA_DIR, { recursive: true })` so the dir is
created on first use. Read `DATA_DIR` from `env`, never `process.env`. There is nothing to
"migrate" at setup — tables are created lazily on first ingest (`ensureDatasetsTable`, `createTable`).

## 5. Session interaction log (`src/store/jsonl-log.mjs`)

Each run gets a `SESSION_ID` from `newSessionId()` (a `randomUUID`, validated against the shared
`/^[A-Za-z0-9-]{8,64}$/`). `logInteraction(request, response)` appends one JSON line per
request/response pair to `<DATA_DIR>/sessions/<SESSION_ID>.jsonl` — append-only, earlier lines are
never rewritten. The same regex guards `sessionLogPath()` to prevent path traversal; reuse
`SESSION_ID_RE` rather than a fresh literal. Every mode calls `logInteraction` exactly once per
request.

## 6. Verify (`make healthz`, `.bin/healthz.sh`)

`./.bin/healthz.sh` (or `make healthz` if wired) checks node present, `package.json` present,
`src/cli/main.mjs` present, and prints `{status:ok|fail}`; `--json` emits the JSON twin and exits
non-zero on fail. Run it after setup as the smoke gate, then `npm start` to confirm the clack menu
renders.

```bash
node -v                       # must satisfy engines.node >=20
./.bin/healthz.sh --json      # {"status":"ok",...} before first run
npm start                     # clack intro + analysis-mode menu
```

## Setup checklist

1. `node -v` ≥ 20; deps installed (`make install`).
2. `.env` present if you need a live provider; otherwise zero-config offline is fine.
3. Pick `STORAGE_BACKEND` / `MODEL_PROVIDER` only if overriding the defaults.
4. `./.bin/healthz.sh --json` → `ok`.
5. `npm start` renders the menu without an env-validation crash.

## Reference files

- `src/config/env.mjs` — the single `EnvSchema` + frozen `env` (start here).
- `src/config/bootstrap.mjs` — derived `bootstrap` config object.
- `src/config/catalogs.mjs`, `src/config/presets/analysis-modes.json` — preset envelope + loader.
- `src/db/sqlite.mjs` — `getDb()` singleton, WAL, `DATA_DIR`.
- `src/store/jsonl-log.mjs` — `SESSION_ID` + per-session JSONL log.
- `.bin/healthz.sh`, `.bin/lib.sh` — the JSON-twin health gate.
- Related: `.claude/rules/config-store-schema.md` (edit-time projection of the env/preset/store
  contract).
