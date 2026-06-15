# Feature Requirements Document (FRD)

Specifies a **single feature** in depth — the user problem, proposed solution, MoSCoW priority, dependencies, UI mockups, and the API contracts it needs.

## Overview

An FRD zooms in below a PRD to one feature. It states the user problem and proposed solution, draws explicit out-of-scope boundaries, lists prerequisite features and team/system dependencies, references UI mockups (with state variants and a11y notes), and declares each API endpoint the feature requires and whether it is new, modified, or reused.

## Schema

Root interface: `FeatureRequirementsDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, PM, engineering lead, status, target release |
| `description` | Summary, user problem, proposed solution, out-of-scope boundaries |
| `priority` | MoSCoW: Must / Should / Could / Won't Have |
| `dependencies` | Prerequisite features, external systems, team dependencies |
| `uiMockups[]` | Design links, interaction notes, state variants, a11y requirements |
| `apiContracts[]` | Endpoint pattern, purpose, data requirements, new/modify/reuse status |

## Example

- [`examples/bulk-export-zip.json`](examples/bulk-export-zip.json) — FRD for a bulk ZIP export feature.
