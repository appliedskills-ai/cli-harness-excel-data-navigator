# Migration & Transition Specification

Specifies a **system migration / transition** — current vs. target architecture states, data-migration pattern, backward compatibility, cutover plan, rollback strategy, and a deprecation timeline.

## Overview

This spec governs moving from an old system/datastore to a new one safely. It contrasts current and target states (systems to retire vs. introduce), picks a data-migration pattern (Dual Write, Bulk ETL, CDC, Lazy) with a validation strategy, plans backward compatibility for legacy clients, sequences the cutover with owners and durations, defines the rollback plan (including the point of no return), and schedules final decommissioning.

## Schema

Root interface: `MigrationTransitionSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, lead engineer, status, target completion |
| `architectureStates` | Current/target descriptions, systems to retire / introduce |
| `dataMigration` | Pattern, source/target datastore, volume, validation, downtime |
| `backwardCompatibility` | Translation layer, supported legacy clients, breaking changes |
| `cutoverPlan` | Strategy, downtime window, ordered execution steps |
| `rollbackStrategy` | Point of no return, automatic triggers, manual steps, reconciliation |
| `deprecationTimeline` | Decommission milestones + final date |

## Example

- [`examples/task-graph-mongo-to-postgres.json`](examples/task-graph-mongo-to-postgres.json) — migration spec for a MongoDB→PostgreSQL task graph.
