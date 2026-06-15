# Comprehensive Software Requirements Specification (SRS)

A full **IEEE-830-style SRS** — introduction, overall description/background, specific requirements (functional, non-functional, interfaces, data, error handling, acceptance), and appendices.

## Overview

This is the long-form, formal SRS template. It opens with purpose/scope, definitions, and references; describes product perspective, assumptions/dependencies, constraints, stakeholders, and operating environment; then specifies functional and non-functional requirements, interfaces, data models, exception handling, acceptance criteria, and requirement dependencies/priorities; and closes with appendices (glossary, diagrams, traceability matrices, revision history). For a leaner variant see [`software-requirements-spec`](../software-requirements-spec).

## Schema

Root interface: `ComprehensiveSRS` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, version, last updated |
| `introduction` | Purpose & scope, definitions/acronyms, references, document overview |
| `overallDescription` | Product perspective, assumptions/dependencies, constraints, stakeholders, environment |
| `specificRequirements` | Functional + non-functional reqs, interfaces, data, error handling, acceptance, dependencies |
| `appendices` | Glossary, diagrams/mockups, traceability matrices, revision history |

## Example

- [`examples/employee-leave-request.json`](examples/employee-leave-request.json) — comprehensive SRS for an employee leave-request system.
