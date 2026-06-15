# System Requirements Specification (SyRS)

The **system-level** requirements spec — functional and non-functional requirements, interfaces, data models, constraints, and a signed contract baseline.

## Overview

A SyRS specifies the system as a whole (broader than the software-only [`software-requirements-spec`](../software-requirements-spec)). Each functional requirement is traceable (`FR-INV-001`) and carries a trigger event, expected outcome, and QA-facing acceptance criteria. Non-functional requirements quantify performance (p99 latency, throughput, concurrent users) and security. The `contractBaseline` records whether requirements are frozen and the per-stakeholder sign-off state.

## Schema

Root interface: `SystemRequirementsSpecification` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, version, authors, target audience, status |
| `functionalRequirements[]` | ID, trigger event, expected outcome, acceptance criteria |
| `nonFunctionalRequirements` | Performance, security, usability, reliability |
| `interfaces[]` | API / UI / Hardware / Event Stream, protocol, data format |
| `dataModels[]` | Entities, attributes (type, constraints), estimated volume |
| `constraints` | Technical, regulatory, business |
| `contractBaseline` | Baselined flag, baseline date, stakeholder sign-offs |

**Status:** Draft → Review → Baselined → Signed-Off → Superseded

## Example

- [`examples/inventory-reservation.json`](examples/inventory-reservation.json) — SyRS for an inventory-reservation system.
