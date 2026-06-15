# High-Level Design (HLD)

The system-wide architectural view — context, major systems and their domains, data flows, integrations, infrastructure shape, and non-functional requirements.

## Overview

An HLD describes the system at the macro level, before any module-internal detail. It bounds the system (actors, what's inside vs. outside), names the major systems by bounded context, traces data flows as sequences of system IDs (flagging the critical path), declares cross-system integrations and their protocols, and sets the infrastructure topology and NFR targets. It is the parent that an [`low-level-design`](../low-level-design) refines.

## Schema

Root interface: `HighLevelDesign` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, architect, stakeholders, status |
| `systemContext` | Description, primary actors, system boundary |
| `majorSystems[]` | Named systems, their domain (bounded context), core responsibilities |
| `dataFlows[]` | Flow path as ordered system IDs + critical-path flag |
| `integrations[]` | Source→target system, protocol, payload type, sync/async |
| `infrastructureShape` | Topology, cloud provider, compute/storage/observability tiers |
| `nonFunctionalRequirements` | Scalability, availability, latency, security |

## Example

- [`examples/design-to-code-platform.json`](examples/design-to-code-platform.json) — HLD for a design-to-code platform.
