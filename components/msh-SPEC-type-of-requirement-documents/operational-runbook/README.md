# Operational Runbook (Support Specification)

The on-call **operations runbook** for a service — service overview, dashboards, alert responses, known failure modes with recovery steps, routine maintenance, and the escalation path.

## Overview

This document is what an on-call engineer opens during an incident. It summarizes the service and its criticality tier and dependencies, links the observability dashboards, maps each alert to an immediate action, and — most importantly — documents known failure modes with symptom → probable causes → investigation (read-only) → recovery (mutating) → verification steps. It also lists routine maintenance and the tiered escalation policy.

## Schema

Root interface: `OperationalRunbook` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, service ref, owner team, status, review cadence |
| `serviceOverview` | Description, criticality tier, dependencies |
| `dashboards[]` | Observability dashboard links + descriptions |
| `alerts[]` | Alert, severity, trigger, immediate action, linked failure mode |
| `knownFailureModes[]` | Symptom, causes, investigation / recovery / verification steps |
| `maintenanceTasks[]` | Routine tasks, frequency, automation status, procedure |
| `escalationPath` | Primary contact, escalation triggers, contact roster |

## Example

- [`examples/agentic-harness-runbook.json`](examples/agentic-harness-runbook.json) — operational runbook for an agentic harness.
