# Integration Design Specification

Specifies a **point-to-point integration** between two systems — the connected systems, connection pattern/protocol, data contract, resilience policy, error handling, and security.

## Overview

This spec governs how two (or three, with middleware) systems exchange data. It pins the connection pattern (Request/Reply, Pub/Sub, Batch Streaming, Polling…), the data contract (format + schema registry + routing key), and — critically — the resilience and error-handling posture: timeouts, retry strategy, circuit breaker, idempotency guarantees, and a dead-letter queue.

## Schema

Root interface: `IntegrationDesignSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author, business context, third-party dependencies |
| `systems` | Source / target / optional middleware (owner team, internal vs external) |
| `connectionDetails` | Pattern, protocol, sync/async, expected throughput |
| `dataContract` | Payload format, schema registry URL, routing key, sample payload |
| `resilience` | Timeouts, retry policy, circuit breaker |
| `errorHandling` | Idempotency guarantee/key, dead-letter queue, alerting |
| `security` | Authentication, encryption in transit, data masking |

## Example

- [`examples/figma-webhook-integration.json`](examples/figma-webhook-integration.json) — integration spec for a Figma webhook.
