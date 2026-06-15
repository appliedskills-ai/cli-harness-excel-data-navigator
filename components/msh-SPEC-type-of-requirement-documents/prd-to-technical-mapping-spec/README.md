# PRD-to-Technical Mapping Specification

Translates PRD requirements into **engineering work** — each product requirement is mapped to its technical translation, impacted components, system impact, phased epics, and validated assumptions.

## Overview

This spec is the bridge between product intent and engineering execution. For every PRD requirement it records the PM's user story alongside the engineering translation, the impacted system components, and explicit technical out-of-scope clarifications. It rolls up a system-impact summary (new services, modified legacy, schema changes, integrations), sequences engineering phases into epics with effort sizing, and lists technical assumptions with validation plans.

## Schema

Root interface: `PrdTechMappingSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, PRD reference URL, PM, engineering lead, status |
| `requirementMappings[]` | PRD req → technical translation, impacted components, technical out-of-scope |
| `systemImpactSummary` | New services, modified legacy, DB schema changes, integrations |
| `engineeringPhases[]` | Milestones → technical epics (tasks, effort) + blockers |
| `technicalAssumptions[]` | Assumption + validation plan |

## Example

- [`examples/automated-design-handoff.json`](examples/automated-design-handoff.json) — PRD→tech mapping for an automated design handoff.
