# Infrastructure & Deployment Specification

Defines how a system is hosted and shipped across environment tiers — compute/scaling, networking, CI/CD, secrets, observability, and the deployment/rollback strategy.

## Overview

This is the platform/SRE contract for running a service. Environments are keyed by tier (Development / Staging / Production / Disaster Recovery), each with its own account, region, hosting model, and scaling policy. It nails down networking (VPC, subnets, ingress/egress, DNS/TLS), the CI/CD toolchain and required checks, secrets handling, observability providers, and the promotion + rollback flow.

## Schema

Root interface: `InfrastructureDeploymentSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, platform-team owner, status |
| `environments` | Per-tier account, region, hosting model, compute, scaling policy |
| `networking` | VPC ref, subnets, ingress/egress rules, DNS + TLS |
| `ciCd` | Source repo, build runner, artifact registry, deploy tool, required checks |
| `secretsManagement` | Provider, injection method, rotation policy |
| `observability` | Metrics / logs / tracing providers + critical alert rules |
| `deploymentAndRollback` | Strategy (Rolling/Blue-Green/Canary/Recreate), promotion flow, rollback triggers |

## Example

- [`examples/polyglot-generation-eks.json`](examples/polyglot-generation-eks.json) — EKS deployment spec for a polyglot generation engine.
