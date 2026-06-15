# Use Case Specification

Describes a single **use case** as flows — actors, preconditions, a main flow, alternate flows, exception flows, and postconditions.

## Overview

A Use Case Specification captures one goal-driven interaction between actors and the system, step by step. The main flow is the happy path; alternate flows branch at a numbered step under a condition and may rejoin; exception flows handle failures and declare the resulting system state (Terminated / Rolled Back / Degraded). Postconditions assert what must be true on success vs. failure. Links back to SRS/PRD requirements keep it traceable.

## Schema

Root interface: `UseCaseSpecification` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, version, status, related requirements |
| `actors[]` | Primary / Secondary / System actors |
| `preconditions` | What must hold before the use case begins |
| `mainFlow[]` | Numbered happy-path steps (actor + action) |
| `alternateFlows[]` | Branch step, condition, steps, optional rejoin point |
| `exceptions[]` | Branch step, failure condition, handling steps, resulting state |
| `postconditions` | `onSuccess` / `onFailure` guarantees |

## Example

- [`examples/manual-component-regeneration.json`](examples/manual-component-regeneration.json) — use case for manual component regeneration.
