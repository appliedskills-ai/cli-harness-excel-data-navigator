# Batch Data Intake Specification

Specifies how a **batch ingestion pipeline** pulls external data (CSV / JSONL / API), maps it into an agent/system state schema, validates it, and executes under concurrency and failure policies.

## Overview

This spec drives bulk data loaders. It declares the source (location URI, auth, optional poll interval), a field-by-field mapping into the target state (with transform logic), validation rules with per-row failure actions, and batch execution policies that throttle concurrency to avoid rate-limiting downstream APIs/LLMs.

## Schema

Root interface: `BatchIngestionSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Pipeline name, owner team, `targetGraphRef` |
| `dataSource` | `sourceType` (CSV/JSONL/API_PULL), location URI, auth, poll interval |
| `schemaMapping[]` | Source column → target state field + transform + required flag |
| `validationRules[]` | Condition + `onFailure` (Drop Row / Halt Batch / Dead Letter Queue) |
| `executionPolicies` | Max concurrency, stagger delay, failure threshold %, dedup strategy |

## Example

- [`examples/vulnerability-batch-intake.json`](examples/vulnerability-batch-intake.json) — batch intake of a vulnerability remediation list.
