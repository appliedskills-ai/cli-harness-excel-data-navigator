# Market Requirements Document (MRD)

Frames the **market opportunity** for a product — market analysis and sizing (TAM/SAM/SOM), target audience, competitive landscape, positioning, market-level requirements, and go-to-market strategy.

## Overview

An MRD is owned by product marketing and answers *should we build this, for whom, and how do we win?* — before a PRD defines *what* to build. It sizes the market, profiles buyer and user personas, maps competitors (and how we beat each), states the value proposition and differentiators, and lays out the GTM motion (pricing, sales/marketing channels, partnerships).

## Schema

Root interface: `MarketRequirementsDocument` (`interface.ts`)

| Field | Description |
| --- | --- |
| `metadata` | Title, author (PMM/VP Product), status, target launch quarter |
| `marketAnalysis` | Market problem, TAM/SAM/SOM sizing, key trends |
| `targetAudience` | Primary segments, buyer personas, user personas |
| `competitiveLandscape[]` | Competitor tier, strengths, weaknesses, our advantage |
| `productPositioning` | Value proposition, elevator pitch, differentiators |
| `marketRequirements[]` | High-level themed requirements + market driver |
| `goToMarketStrategy` | Pricing model, sales + marketing channels, partnerships |

## Example

- [`examples/design-to-code-platform.json`](examples/design-to-code-platform.json) — MRD for a design-to-code platform.
