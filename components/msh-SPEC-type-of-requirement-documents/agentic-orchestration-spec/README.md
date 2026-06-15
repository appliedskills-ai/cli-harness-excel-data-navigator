# Agentic Orchestration (DAG) Specification

Specifies an **agentic LangGraph-style orchestration** — the DAG topology (nodes + routing edges), the agent state schema, human-in-the-loop boundaries, durability/monitoring infrastructure, and execution contracts.

## Overview

This spec describes an autonomous agent graph (modeled on the vulnrem remediation agent). It declares the graph nodes and their implementation refs, the routing edges between them (including cyclic loops like `tested → planner`), and which nodes are pure decisions. It defines the agent state schema (vulnerability context, append-only ledgers, transient state), the human-in-the-loop interrupt boundaries with resume-payload shapes, the checkpointer/storage/monitoring daemon, and the execution contract — the exit-code matrix and architectural invariants.

## Schema

Root interface: `AgenticOrchestrationSpec` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, system ref, author |
| `graphTopology` | Nodes (impl refs), routing edges (logic, cyclic flag), pure decisions |
| `stateSchema` | Vulnerability context, append-only ledgers, transient state |
| `humanInTheLoop[]` | Interrupt kind, trigger condition, resume payload, notification method |
| `durabilityAndMonitoring` | Checkpointer, storage layout, monitoring daemon |
| `executionContracts` | Exit-code matrix, architectural invariants |

**Agent status:** Discovered · InTriage · Patching · Tested · Committed · Promoted · NotAffected · Affected

## Example

- [`examples/vulnrem-orchestration-dag.json`](examples/vulnrem-orchestration-dag.json) — orchestration DAG for the vulnrem remediation agent.
