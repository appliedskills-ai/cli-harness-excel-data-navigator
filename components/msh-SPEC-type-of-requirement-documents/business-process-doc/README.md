# Business Process Document

Documents a business workflow as **As-Is** or **To-Be** — its actors, ordered steps with routing, exception handling, and the KPIs that measure it.

## Overview

A Business Process Document captures *how work flows* across people and systems. Each step declares its type (manual / automated / decision gateway / sub-process), the actor responsible, inputs/outputs, and conditional `nextSteps` routing. Exceptions name where a process breaks down and how it is recovered or escalated.

## Schema

Root interface: `BusinessProcessDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, process owner, author, `state` (As-Is/To-Be), version |
| `overview` | Purpose, scope, triggering events, expected outcomes, systems involved |
| `actors[]` | Human / System / External Entity roles |
| `processSteps[]` | Step type, actor ref, inputs, outputs, conditional `nextSteps` routing |
| `exceptions[]` | Where breakdown occurs, condition, handling procedure, escalation role |
| `metrics[]` | KPI baseline (As-Is) vs target (To-Be) + measurement method |

## Example

- [`examples/new-hire-it-provisioning.json`](examples/new-hire-it-provisioning.json) — the new-hire IT provisioning process.
