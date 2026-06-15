# OpenAPI Specification (OAS 3.x)

An API contract modeled on the **industry-standard OpenAPI Specification** — `info`, `servers`, `paths` → operations, and reusable `components` (schemas + security schemes).

## Overview

Unlike the protocol-agnostic [`api-spec`](../api-spec), this folder mirrors the canonical OpenAPI 3.x document shape directly, so it round-trips with standard OpenAPI tooling (codegen, validators, Swagger UI). `operationId` is preserved because it drives SDK generation, and schemas are referenced via `$ref` into `components/schemas`.

## Schema

Root interface: `OpenApiSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `openapi` | OAS version string, e.g. `"3.0.3"` |
| `info` | Title, version, description, contact, license |
| `servers[]` | Base URLs + descriptions |
| `tags[]` | Operation grouping tags |
| `paths` | Endpoint URL → `PathItem` → per-method `Operation` (params, requestBody, responses) |
| `components` | Reusable `schemas` and `securitySchemes` (apiKey / http / oauth2 / openIdConnect / mutualTLS) |
| `security[]` | Global security requirements |

## Example

- [`examples/component-atlas-export.json`](examples/component-atlas-export.json) — OpenAPI doc for a component-atlas export API.
