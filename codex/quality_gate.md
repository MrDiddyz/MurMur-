# Quality Gate — MurMur

## Purpose
This file defines the minimum quality standard for any accepted change in the MurMur repository.

A change is not complete unless the relevant gates below are satisfied.

---

## Hard fail conditions

Any of the following is an automatic fail:

- code or docs contradict actual repo behavior
- a change introduces shared behavior without a contract
- a breaking change is made without explicit documentation
- a claim of implementation is made without corresponding files
- secrets, tokens, or credentials are committed
- tests fail
- type checks fail
- lint checks fail, if configured
- a change modifies behavior but no validation was added or updated

---

## Required change discipline

### 1. Plan first
Before editing:
- read `AGENTS.md`
- read `README.md`
- read `codex/repo_map.md`
- read this file

Then write a short plan.

### 2. Keep patches small
Changes should be:
- scoped
- reviewable
- reversible

Avoid giant mixed patches.

### 3. Contract-first
If a change affects shared structure or inter-module communication:
- create or update the contract first
- implement second
- validate third
- document fourth

### 4. Keep truth aligned
If you change:
- behavior
- config
- interfaces
- commands
- examples

you must update the relevant docs in the same patch.

---

## Minimum acceptance checks

The relevant checks for the stack in use must pass.

### For TypeScript packages
- install dependencies successfully
- compile successfully
- typecheck successfully
- tests pass

Typical commands:
```bash
npm install
npm run build
npm run typecheck
npm test
```
