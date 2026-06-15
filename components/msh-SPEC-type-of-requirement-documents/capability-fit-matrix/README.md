# Capability Fit Matrix

A coverage scorecard that rates each expected capability as **PRESENT / PARTIAL / MISSING** across multiple delivery surfaces (SDK, use-case, examples), with per-surface evidence and aggregate tallies.

## Overview

A Fit Matrix answers "how well does what we built cover what was expected?" Every capability row is evaluated independently per surface, each cell carrying a status plus supporting notes. The `aggregateCounts` roll up present/partial/missing tallies per surface so gaps are quantifiable at a glance.

## Schema

Root interface: `FitMatrixDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Description, last updated, surfaces evaluated |
| `legend` | Meaning of each `FitStatus` value |
| `capabilities[]` | Per-capability expectation + category + per-surface evaluation cells |
| `capabilities[].surfaces` | `sdk` / `useCase` / `examples` cells (status + evidence notes) |
| `aggregateCounts` | Present / partial / missing tally per surface |

**Status:** `PRESENT` · `PARTIAL` · `MISSING`

## Example

- [`examples/sdk-usecase-examples.json`](examples/sdk-usecase-examples.json) — fit matrix across SDK, use-case, and examples surfaces.
