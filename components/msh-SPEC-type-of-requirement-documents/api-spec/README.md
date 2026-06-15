# API Specification (Protocol-Agnostic)

A protocol-agnostic API contract covering **REST, GraphQL, gRPC, and WebSocket** — server environments, security schemes, global rate limits, endpoints, and centralized shared data models.

## Overview

Where [`openapi-spec`](../openapi-spec) tracks the literal OpenAPI document shape, this spec is a higher-level, protocol-neutral description. It centralizes reusable schemas under `sharedModels` (like OpenAPI's `components/schemas`) and references them from request bodies and responses by key.

## Schema

Root interface: `ApiSpecification` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, version, `protocol` (REST/GraphQL/gRPC/WebSocket) |
| `servers[]` | Development / Staging / Production base URLs |
| `securitySchemes[]` | Auth types: API Key, OAuth2, JWT, Basic, Mutual TLS, None |
| `rateLimits` | Requests-per-window, window duration, returned headers |
| `endpoints[]` | Path, method, security required, parameters, request body, responses |
| `sharedModels` | Centralized data models referenced by `schemaRef` |

## Example

- [`examples/polyglot-component-generation.json`](examples/polyglot-component-generation.json) — API spec for a polyglot component-generation service.
