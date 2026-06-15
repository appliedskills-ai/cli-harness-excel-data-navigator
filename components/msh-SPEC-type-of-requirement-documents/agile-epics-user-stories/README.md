# Agile Epics & User Stories

Models an Agile delivery backlog: an **Epic** that decomposes into **User Stories**, each carrying a `role / feature / benefit` statement and Gherkin-style acceptance criteria.

## Overview

This is the planning/delivery unit that sits below a PRD or FRD and above implementation tasks. Stories are sized with Fibonacci story points and prioritized, and each acceptance criterion holds one or more Given/When/Then scenarios that QA and developers test against.

## Schema

Root interface: `AgileEpic` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, owner (PM), status, `targetReleaseVersion`, labels |
| `businessValue` | The strategic reason the epic exists |
| `userStories[]` | Child stories, each with metadata, statement, and acceptance criteria |
| `userStories[].storyStatement` | `role` (As a…) / `feature` (I want…) / `benefit` (so that…) |
| `userStories[].acceptanceCriteria[]` | Titled criteria, each holding Gherkin `scenarios` |
| `userStories[].acceptanceCriteria[].scenarios[]` | `given[]` / `when[]` / `then[]` |

**Sizing:** Fibonacci `1 | 2 | 3 | 5 | 8 | 13 | 21` · **Status:** `Backlog → To Do → In Progress → In Review → Done`

## Example

- [`examples/automated-design-handoff.json`](examples/automated-design-handoff.json) — epic + stories for an automated design-to-code handoff.
