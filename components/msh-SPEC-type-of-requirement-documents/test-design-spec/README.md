# Test Design Specification

The **test strategy** for a system — acceptance criteria, the testing pyramid (unit/integration/E2E), non-functional testing, test-data management, and test environments.

## Overview

This is the QA/SDET contract. It states the overall strategy, ties acceptance criteria to features and a test level, configures each testing level (frameworks, coverage targets, focus areas — E2E adds critical user journeys and cross-platform targets), specifies non-functional testing (performance load targets, security tools and pen-testing), defines test-data generation/refresh strategy, and lists the test environments and their mocked services.

## Schema

Root interface: `TestDesignSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author (QA lead/SDET), engineering lead, status |
| `acceptanceCriteria[]` | Feature ref, description, test level |
| `testingLevels` | Unit / integration / E2E configs (frameworks, coverage, focus) |
| `nonFunctionalTesting` | Performance (tools, load targets) + security (tools, pen-test, compliance) |
| `testDataManagement` | Generation strategy, refresh cadence, data dependencies |
| `testEnvironments[]` | Tier, infrastructure ref, mocked external services |

**Test levels:** Unit · Integration · System · E2E · UAT

## Example

- [`examples/design-to-code-platform.json`](examples/design-to-code-platform.json) — test design spec for a design-to-code platform.
