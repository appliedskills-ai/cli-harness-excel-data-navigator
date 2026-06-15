# Solution Design Specification (SDS)

The end-to-end design of a solution — overview, goals, architecture pattern + decisions, components, system flows, dependencies, risks, and a rollout plan.

## Overview

A Solution Design Spec bridges *what* (requirements) and *how* (implementation). It records the architecture pattern and the keyed design decisions behind it, enumerates components and the flows that connect them, maps internal/external/infrastructure dependencies, scores risks on impact × likelihood, and lays out a phased rollout with a rollback procedure.

> Note: the schema file in this folder is `Interface.ts` (capital **I**).

## Schema

Root interface: `SolutionDesignSpec` (`Interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, reviewers, status, tags |
| `goals` | `inScope` / `outOfScope` / success metrics |
| `architecture` | Pattern, description, diagrams, keyed design decisions + rationale |
| `components[]` | Service / Database / UI / Agent / Infrastructure / Harness units |
| `flows[]` | Trigger + sequential steps (optional sequence diagram) |
| `dependencies` | Internal services, external APIs, infrastructure |
| `risks[]` | Impact × likelihood + mitigation |
| `rolloutPlan` | Strategy, phases, rollback procedure |

## Example

- [`examples/cross-platform-auth-sync.json`](examples/cross-platform-auth-sync.json) — design spec for cross-platform auth synchronization.
