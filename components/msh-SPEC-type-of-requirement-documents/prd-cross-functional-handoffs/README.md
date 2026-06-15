# PRD with Cross-Functional Handoffs

A Product Requirements Document variant that makes the **Product → UX → Engineering handoffs explicit** — each feature tracks UX alignment and Engineering alignment as first-class, sign-off-gated transitions.

## Overview

Where a plain [`product-requirements-doc`](../product-requirements-doc) states *what* to build, this variant instruments the alignment lifecycle between disciplines. Each feature carries a `uxTransition` (mockups, interaction notes, a11y, PM sign-off) and an `engineeringTransition` (technical constraints, LOE, feasibility confirmed), each with an `AlignmentStatus`. The document's `currentPhase` walks Discovery → Design Handoff → Engineering Review → Development → Launch.

## Schema

Root interface: `ProductRequirementsDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, PM ("What"), lead designer ("Flow"), lead engineer ("How"), current phase |
| `productVision` | The overarching product vision |
| `targetAudience[]` | User personas (pain points, primary goal) |
| `successMetrics[]` | Metric, baseline, target, measurement tool |
| `features[]` | User stories + `uxTransition` + `engineeringTransition` |
| `features[].uxTransition` | Mockups, interaction notes, a11y, PM sign-off |
| `features[].engineeringTransition` | Constraints, LOE, feasibility confirmed |
| `roadmap[]` | Phases with target dates + included feature IDs |

## Example

- [`examples/ai-semantic-search.json`](examples/ai-semantic-search.json) — handoff-tracked PRD for an AI semantic-search feature.
