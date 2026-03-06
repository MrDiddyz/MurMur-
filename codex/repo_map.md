# Repo Map — MurMur

## Purpose
This file explains how MurMur is structured so that humans and coding agents can navigate the repository correctly.

MurMur is a multi-agent learning constellation composed of:
- Teacher
- Experimental
- ThinkTank
- Reflective

Each role should remain modular and contract-driven.

---

## Current source-of-truth areas

### Root
- `AGENTS.md`
  - global operating rules for contributors and coding agents

- `README.md`
  - high-level explanation of the system and current structure

### `codex/`
- `repo_map.md`
  - repository navigation and intended ownership boundaries

- `quality_gate.md`
  - pass/fail requirements for changes

### `packages/agent-contracts/`
- shared type definitions and contracts for:
  - agent identities
  - run envelopes
  - outputs
  - metadata
  - validation boundaries between modules

---

## Ownership model

### Teacher
Owns:
- evidence quality
- claim rigor
- policy checks
- validation boundaries

### Experimental
Owns:
- rapid exploration
- prototype outputs
- controlled experimentation

### ThinkTank
Owns:
- scenario generation
- strategic alternatives
- planning synthesis

### Reflective
Owns:
- run analysis
- lessons learned
- recommendations for future iterations

---

## Design boundaries

### Contracts
Anything shared between modules should live in `packages/agent-contracts/`.

Do not duplicate role names, run envelope structures, or output schemas across multiple folders if they are shared.

### Implementation
Behavior-specific code should later live in dedicated folders such as:
- `agents/teacher/`
- `agents/experimental/`
- `agents/thinktank/`
- `agents/reflective/`

### Orchestration
Cross-agent execution logic should later live in:
- `services/orchestrator/`

### Artifacts
Stable reference outputs should later live in:
- `artifacts/golden/`

### Tests
System-level validation should later live in:
- `tests/smoke/`
- `tests/integration/`

---

## Working rules for edits

When adding something new, decide first:

1. is this a shared contract?
2. is this a role-specific implementation?
3. is this orchestration logic?
4. is this an artifact or fixture?
5. is this documentation?

Put the file where its responsibility belongs.
Do not place implementation logic inside documentation folders.
Do not place documentation-only decisions inside runtime packages.

---

## Naming conventions

### Agent roles
Use these exact role names:
- `teacher`
- `experimental`
- `thinktank`
- `reflective`

### Run IDs
Recommended format:
- `run_YYYYMMDD_HHMM_shortid`

Example:
- `run_20260306_0903_a1b2`

### Claim IDs
Recommended format:
- `c_001`
- `c_002`

Referenced in docs like:
- `[claim:c_001]`

---

## Near-term target structure

```text
murmur/
├─ AGENTS.md
├─ README.md
├─ codex/
├─ packages/
│  └─ agent-contracts/
├─ agents/
│  ├─ teacher/
│  ├─ experimental/
│  ├─ thinktank/
│  └─ reflective/
├─ services/
│  └─ orchestrator/
├─ artifacts/
│  └─ golden/
└─ tests/
   ├─ smoke/
   └─ integration/
```
