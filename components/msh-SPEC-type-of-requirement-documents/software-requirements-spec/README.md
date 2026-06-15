# Software Requirements Specification (SRS)

The software-level requirements spec — introduction, overall description, specific functional/non-functional requirements, external interfaces, assumptions/constraints, and appendices.

## Overview

An SRS pins down what a software product must do, with traceable requirement IDs (e.g. `FR-SYS-001`) for traceability matrices. Each functional requirement carries inputs, processing logic, outputs, and error handling; non-functional requirements span performance, reliability, availability, security, maintainability, portability. External interfaces are categorized (User/Hardware/Software/Communication). See [`comprehensive-software-requirements-spec`](../comprehensive-software-requirements-spec) for the fuller IEEE-830 form and [`system-requirements-spec`](../system-requirements-spec) for the system-level counterpart.

## Schema

Root interface: `SoftwareRequirementsSpecification` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, version, authors, approvers, status, project code |
| `introduction` | Purpose, scope, definitions/acronyms, references |
| `overallDescription` | Product perspective, functions, user characteristics, environment |
| `specificRequirements` | Functional (ID, inputs, logic, outputs, errors) + non-functional |
| `externalInterfaces[]` | Category, protocol, data format |
| `assumptionsAndConstraints` | Assumptions, business/technical constraints, regulatory compliance |
| `appendices[]` | Diagrams, glossaries, DOORS modules |

**Status:** Draft → In Review → Baselined → Approved → Deprecated

## Example

- [`examples/icu-vitals-telemetry.json`](examples/icu-vitals-telemetry.json) — SRS for an ICU vitals-telemetry system.
