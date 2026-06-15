# Data & Interface Requirements Document

Captures the **data and interface** layer of a system — data models and dictionary, data flows between systems, system interfaces, and data governance/security.

## Overview

This document is owned by data architects and integration leads. It defines the conceptual data architecture, the entities and their relationships, a precise data dictionary (types, formats, sensitivity, validation), the flows that move data between source and target systems (with transformation logic), the system interfaces (protocol + schema), and the governance rules (retention, compliance, encryption).

## Schema

Root interface: `DataAndInterfaceRequirements` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, lead data architect, integration lead, status |
| `conceptualArchitecture` | High-level description of how data moves |
| `dataModels[]` | Domains, entities (PK, volume), relationships |
| `dataDictionary[]` | Element name, type, format, sensitivity, nullability, validation rules |
| `dataFlows[]` | Source→target, frequency, transformation logic |
| `systemInterfaces[]` | Protocol, data format, schema ref, throughput, error handling |
| `governanceAndSecurity` | Retention policy, compliance requirements, encryption standards |

**Sensitivity:** Public · Internal · Confidential · Restricted (PII/PHI)

## Example

- [`examples/customer-identity-sync.json`](examples/customer-identity-sync.json) — data & interface requirements for a customer-identity sync.
