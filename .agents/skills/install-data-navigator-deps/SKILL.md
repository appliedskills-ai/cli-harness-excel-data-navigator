---
name: install-data-navigator-deps
description: Install the Excel/CSV Data Navigator's dependencies deterministically through the make surface — node>=20, the exact pinned dependency set, the public npm registry (never an ambient private mirror), graceful-skip when npm is absent. Use when installing deps on a fresh checkout, in CI, after editing package.json, when an install hangs/fails, or when verifying the toolchain is ready to run.
allowed-tools: Read, Grep, Glob, Bash, Edit
argument-hint: "[\"install\" | \"verify\" | dependency-name]"
---

# Install — Excel/CSV Data Navigator dependencies

Install the harness's dependencies the project's way: through `make install`, against the public
registry, with every version exactly pinned. After this, run
[`setup-excel-data-navigator`](../setup-excel-data-navigator/SKILL.md) to configure env, then
[`ingest-tabular-to-sqlite`](../ingest-tabular-to-sqlite/SKILL.md) to load data.

## 1. Install through the make surface, not bare npm

The root `Makefile` is a thin composition root: `install: node.install` (`Makefile.lang.node`),
which runs `cd "$(ROOT_DIR)" && npm install`. Prefer `make install` over a bare `npm install` so the
registry default and `ROOT_DIR` resolution come along.

```bash
make install     # → node.install → npm install at the repo root
make help        # list documented targets
```

The node recipe is **graceful-degrading**: if `npm` is not on `PATH` it prints `skip: no npm` and
exits 0 (fragments are `-include`d). A "skip" line means the toolchain is missing, not that install
succeeded — install npm/node and re-run.

## 2. Node engine + registry

- `package.json` pins `"engines": { "node": ">=20" }`. Confirm `node -v` ≥ 20 before installing;
  `better-sqlite3` and the langgraph deps assume it.
- `Makefile.vars` sets `NPM_CONFIG_REGISTRY ?= https://registry.npmjs.org` and `export`s it —
  **the public registry is the intentional default**. Never hardcode a private mirror into these
  files.

> **Local-mirror gotcha (this machine):** the user's global npm registry may point at a Verdaccio at
> `http://localhost:4873` running in Docker. If `npm install` hangs with `ECONNREFUSED` on
> `localhost:4873`, fail fast: `lsof -ti tcp:4873` (is it listening?) and `docker info` (is Docker
> up?). Start Docker / the Verdaccio container, or run with the public default
> (`NPM_CONFIG_REGISTRY=https://registry.npmjs.org make install`). Do **not** silently switch the
> repo's registry — surface the Docker/mirror-down state.

## 3. Versions are exactly pinned (no ranges)

`package.json` declares every dependency as an exact version — no `^`, `~`, range, or `*` — so
`npm install` / `npm ci` resolve deterministically:

| Package | Pin | Role |
| --- | --- | --- |
| `@anthropic-ai/sdk` | `0.65.0` | Claude provider binding |
| `@clack/prompts` | `0.11.0` | interactive CLI prompts |
| `@langchain/core` | `1.1.48` | agent/tool primitives |
| `@langchain/langgraph` | `1.3.4` | tool-loop orchestration |
| `better-sqlite3` | `11.10.0` | SQL store (synchronous) |
| `csv-parse` | `5.6.0` | CSV reader |
| `dotenv` | `16.4.7` | `.env` loading |
| `xlsx` | `0.18.5` | Excel reader |
| `zod` | `3.25.76` | env + body validation |

Do not relax a pin to a caret/range. To change or add a pinned version, use the
[`maintain-pinned-deps`](../../.claude/skills/maintain-pinned-deps/SKILL.md) skill or the
`enfore-actual-pinned-dep-versions` enforcer (its five base pins — `@langchain/core`,
`@langchain/langgraph`, `esbuild`, `fastify`, `vite` — are immutable; register extra exact pins via
its `add <pkg>@<version>`). After editing, re-run `make install` and commit `package-lock.json`.

```jsonc
// Good — exact pin, deterministic resolution
"better-sqlite3": "11.10.0",
// Bad — range drifts across installs and CI
"better-sqlite3": "^11.10.0",
```

## 4. Verify the install

```bash
node -v                                   # >= 20
./.bin/healthz.sh --json                  # {"status":"ok",...} — node + package.json + cli main
node -e "import('better-sqlite3').then(()=>console.log('native ok'))"   # native module built
npm test                                  # node --test
npm start                                 # clack menu renders
```

`better-sqlite3` is a native module — a failed install usually means a missing C/C++ toolchain or a
node/ABI mismatch, not a bad version. Reinstall after fixing the toolchain; do not downgrade the pin.

## Install checklist

1. `node -v` ≥ 20.
2. Registry resolves (public default, or Docker/Verdaccio up if using the local mirror).
3. `make install` completes without `skip: no npm` and without `ECONNREFUSED`.
4. `package-lock.json` updated and committed.
5. `./.bin/healthz.sh --json` → `ok`; the native `better-sqlite3` module loads.

## Reference files

- `package.json` — pinned dependency set + `engines.node >=20`.
- `Makefile`, `Makefile.lang.node`, `Makefile.vars` — `make install` chain + public-registry default.
- `.bin/healthz.sh` — post-install JSON-twin gate.
- Related: [`maintain-pinned-deps`](../../.claude/skills/maintain-pinned-deps/SKILL.md),
  `enfore-actual-pinned-dep-versions` (pin enforcement).
