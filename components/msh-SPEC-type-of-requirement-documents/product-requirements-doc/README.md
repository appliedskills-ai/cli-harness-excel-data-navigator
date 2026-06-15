# Product Requirements Document (PRD)

The canonical product spec — purpose, goals and KPIs, prioritized features, user scenarios, constraints, and a delivery timeline.

## Overview

A PRD defines *what* a product or release should do and *why*, owned by a product manager. It ties goals to measurable KPIs (baseline → target), enumerates features with MoSCoW-style priority, grounds them in persona-driven user scenarios with expected outcomes, captures technical/business/design constraints, and lays out timeline milestones with deliverables. See [`prd-cross-functional-handoffs`](../prd-cross-functional-handoffs) for the variant that instruments cross-functional handoffs.

## Schema

Root interface: `ProductRequirementsDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, product manager, target audience, status |
| `purpose` | Why this product/release exists |
| `goalsAndKpis[]` | Objectives, each with KPIs (name, baseline, target) |
| `features[]` | Name, description, priority (Must/Should/Nice/Won't Have) |
| `userScenarios[]` | Persona, scenario, expected outcome |
| `constraints` | Technical, business, design constraints |
| `timeline[]` | Milestones, target dates, deliverables |

**Status:** Draft → In Review → Approved → Cancelled / Shipped

## Example

- [`examples/design-to-code-platform.json`](examples/design-to-code-platform.json) — PRD for a design-to-code platform.
