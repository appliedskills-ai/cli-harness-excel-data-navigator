# Low-Level Design (LLD)

The implementation-level design that refines one HLD component — modules and code units, API contracts, database models, and detailed sequence logic.

## Overview

An LLD is the developer's blueprint. It links back to a specific [`high-level-design`](../high-level-design) component (`parentComponentRef`) and descends into concrete detail: modules with their directory paths, code units (class / function / React component / middleware / agent skill) with parameters, return types, validation, and exceptions; precise API contracts with error-code maps; database table/field definitions with indexes; and numbered sequence steps with per-step failure handling.

## Schema

Root interface: `LowLevelDesign` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, reviewers, status |
| `parentComponentRef` | Back-link to the HLD component this refines |
| `modules[]` | Directory path + code units (params, return type, validation, exceptions) |
| `apiContracts[]` | Endpoint, method, request/response schemas, error-code map |
| `dataModels[]` | Table/collection, fields with constraints, indexes |
| `sequenceLogic[]` | Numbered steps, actor, action, on-failure handling |

## Example

- [`examples/figma-graph-ingestion.json`](examples/figma-graph-ingestion.json) — LLD for Figma graph ingestion.
