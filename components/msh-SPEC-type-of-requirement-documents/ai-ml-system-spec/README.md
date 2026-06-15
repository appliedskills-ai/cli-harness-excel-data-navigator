# AI / ML System Specification

Specifies how an AI/ML feature is configured, constrained, evaluated, and operated — the model, its context/RAG sources, safety guardrails, reliability fallbacks, evaluation criteria, and cost/telemetry controls.

## Overview

This is the contract for a production LLM/ML subsystem. It pins the model + hyperparameters, declares how context enters the window (RAG, static inject, agentic search), defines input/output guardrails and what to do when they trip, and bounds spend with hard budgets and human-in-the-loop triggers.

## Schema

Root interface: `AiMlSystemSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, `systemRef` (back to HLD), status |
| `modelConfiguration` | Primary model, provider, hyperparameters, named system prompts |
| `contextAndData` | Retrieval strategy, vector DB, injected schemas, context-window limit |
| `safetyAndGuardrails` | Input/output validation + guardrail action (block/retry/fallback/flag) |
| `reliability` | Fallback model, heuristic fallback, human-review trigger + routing queue |
| `evaluation` | Offline (golden dataset, metrics) + online (implicit/explicit feedback) |
| `monitoringAndFinancials` | Cost controls (daily budget, token caps, alert thresholds), telemetry |

**Providers:** OpenAI · Anthropic · Google · Self-Hosted · AWS Bedrock

## Example

- [`examples/polyglot-code-generation.json`](examples/polyglot-code-generation.json) — AI spec for a polyglot code-generation system.
