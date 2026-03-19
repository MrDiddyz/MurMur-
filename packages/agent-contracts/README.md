# @murmur/agent-contracts

Shared contracts for MurMur agents and orchestration.

This package defines the common source of truth for:
- agent role names
- run envelope metadata
- agent outputs
- optional claim references
- result status values

The purpose is to keep MurMur modular and contract-first from day one.

## Why this package exists

Without shared contracts, multi-agent systems drift quickly:
- names become inconsistent
- outputs become incompatible
- orchestration becomes fragile
- validation becomes hard

This package prevents that by defining the minimum stable interface.

## Current exports

- `AgentRole`
- `RunStatus`
- `ClaimRef`
- `RunEnvelope`
- `AgentOutput`

## Next likely additions

- teacher evidence schema
- decision brief schema
- reflective report schema
- orchestration handoff schema
