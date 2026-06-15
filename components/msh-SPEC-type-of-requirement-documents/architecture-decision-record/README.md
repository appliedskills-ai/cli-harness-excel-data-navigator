# Architecture Decision Record (ADR)

Captures a single, significant architectural decision — the context that forced it, the choice made, the alternatives weighed, and the long-term consequences of living with it.

## Overview

An ADR is a short, immutable record. Once accepted it is not edited; it is superseded by a newer ADR. The `relatedDocuments` field threads the lineage (`supersedes` / `supersededBy`) so the decision history stays traceable.

## Schema

Root interface: `ArchitectureDecisionRecord` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, date, `status`, tags |
| `context` | The forces, constraints, and problem that triggered the decision |
| `decision` | The position chosen, stated in active voice |
| `alternativesConsidered` | Each option's pros, cons, and reason for rejection |
| `consequences` | Resulting `positive` / `negative` / `neutral` trade-offs |
| `relatedDocuments` | `supersedes` / `supersededBy` / `references` lineage links |

**Status lifecycle:** `Proposed → Accepted → Rejected → Deprecated → Superseded`

## Example

- [`examples/task-graph-postgres-vs-neo4j.json`](examples/task-graph-postgres-vs-neo4j.json) — choosing the persistence backend for a task graph.
