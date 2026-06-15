# Project Scope Statement

The formal **scope baseline** for a project — justification, in/out-of-scope definition, deliverables, boundaries and constraints, assumptions, acceptance criteria, and stakeholder approvals.

## Overview

A Scope Statement draws the line around a project and gets it signed. It justifies the project, explicitly lists what is in and out of scope, enumerates deliverables with target dates, sets hard boundaries (budget cap, deadlines, resource and technical constraints), records assumptions, ties acceptance criteria to deliverables with an approver role, and captures the approval record (pending / signed / rejected) per stakeholder.

## Schema

Root interface: `ScopeStatement` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Project name, PM, sponsor, status, version |
| `projectJustification` | Why the project is being undertaken |
| `scopeDefinition` | `inScope` / `outOfScope` lists |
| `deliverables[]` | Named deliverables + target dates |
| `boundariesAndConstraints` | Budget cap, hard deadlines, resource + technical boundaries |
| `assumptions` | Facts assumed true |
| `acceptanceCriteria[]` | Per-deliverable criteria + approver role |
| `approvals[]` | Sign-off record per stakeholder role |

## Example

- [`examples/hr-mobile-app.json`](examples/hr-mobile-app.json) — scope statement for an HR mobile app.
