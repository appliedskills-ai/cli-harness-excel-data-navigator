# Observability Specification

Defines how a system is **measured and watched** in production — service-level objectives, telemetry (logs/metrics/traces), required dashboards, and alerting rules tied to runbooks.

## Overview

This is the SRE contract for visibility. It sets SLOs with error-budget policies, standardizes telemetry (log format + mandatory attributes + PII masking, metric definitions, trace context propagation and sampling), enumerates the dashboards each audience needs, and codifies alert rules — the actual query, trigger condition, severity, routing target, and runbook link.

## Schema

Root interface: `ObservabilitySpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author (SRE), `systemRef`, status |
| `serviceLevelObjectives[]` | SLI, target %, evaluation window, error-budget policy |
| `telemetry` | Instrumentation standard + logs / metrics / traces configuration |
| `dashboards[]` | Name, audience (Executive/Engineering/Support), key panels |
| `alertingRules[]` | Query, trigger condition, severity (SEV-1..4), routing, runbook ref |

## Example

- [`examples/polyglot-generation-engine.json`](examples/polyglot-generation-engine.json) — observability spec for a polyglot generation engine.
