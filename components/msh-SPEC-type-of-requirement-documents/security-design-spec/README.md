# Security Design Specification

Specifies a system's **security architecture** — identity and access, data protection, secrets management, a threat model, audit/monitoring, and compliance mapping.

## Overview

This is the security architect's contract. It defines authentication mechanisms and the authorization model (RBAC/ABAC/PBAC) with its enforcement point, classifies and protects data (encryption at rest/in transit, PII handling), governs secrets, builds a threat model using a named methodology (STRIDE/DREAD/PASTA) with identified threats, abuse cases, and residual risk, and maps system controls to compliance frameworks.

## Schema

Root interface: `SecurityDesignSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author (security architect), reviewers, status |
| `identityAndAccess` | Authn mechanisms, authz model + enforcement point, MFA |
| `dataProtection` | Data classification, encryption at rest/in transit, PII handling |
| `secretsManagement` | Storage, rotation policy, access control |
| `threatModel` | Methodology, trust boundaries, identified threats, abuse cases |
| `auditAndMonitoring` | Logged events, log storage, retention, alerting triggers |
| `compliance` | Applicable frameworks + mapped controls |

## Example

- [`examples/agentic-execution-harness.json`](examples/agentic-execution-harness.json) — security design for an agentic execution harness.
