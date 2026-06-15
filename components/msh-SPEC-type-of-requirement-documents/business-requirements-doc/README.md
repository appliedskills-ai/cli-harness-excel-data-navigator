# Business Requirements Document (BRD)

Frames a project from the **business** perspective — executive summary, business goals tied to OKRs, scope, stakeholders, high-level (non-technical) requirements, and the cost/benefit case.

## Overview

A BRD answers *why* and *what value*, not *how*. It is authored by a Business Analyst, owned by an executive sponsor, and deliberately stays above technical features. The `financials` block (budget cap, ROI, payback period) and the in-scope/out-of-scope split are what executives sign off on.

## Schema

Root interface: `BusinessRequirementsDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author (BA), executive sponsor, status |
| `executiveSummary` | The business case in brief |
| `businessGoals[]` | Goal + strategic alignment (OKRs) + measurable success metric |
| `projectScope` | `inScope` / `outOfScope` lists |
| `stakeholders[]` | Role, department, influence level, core expectations |
| `highLevelRequirements[]` | Business capabilities (Operational/Financial/Regulatory/Strategic), prioritized |
| `financials` | Cost cap, expected benefit, ROI %, payback months |
| `assumptionsAndConstraints` | Business assumptions, resource + schedule constraints |

## Example

- [`examples/unified-payments-gateway.json`](examples/unified-payments-gateway.json) — BRD for a unified payments gateway initiative.
