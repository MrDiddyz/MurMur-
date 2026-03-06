# 04 — Contract-Driven Module Template

Use this prompt when implementing a **new module** or **refactoring an existing module** where behavior must be defined by explicit contracts before coding.

## Purpose
Produce a small, testable module whose public behavior is specified first (inputs, outputs, invariants, error modes), then implemented to satisfy those contracts.

## Inputs (fill before running)
- **Module name:** `<module_name>`
- **Primary responsibility:** `<one sentence>`
- **Runtime/language:** `<lang/runtime>`
- **Dependency constraints:** `<allowed/disallowed deps>`
- **Performance constraints:** `<latency/memory/throughput goals>`
- **Security constraints:** `<auth, validation, secrets, PII rules>`
- **Compatibility constraints:** `<API versions, schema, migration notes>`
- **Out-of-scope items:** `<explicit non-goals>`

## Required Output Format
Return results using these exact sections:

1. `## Contract`
2. `## Implementation Plan`
3. `## Code Changes`
4. `## Verification`
5. `## Risks & Follow-ups`

## Contract (must define before implementation)
Specify the public contract in concrete terms:

- **Public interface:** function/class/API names and signatures.
- **Preconditions:** assumptions callers must satisfy.
- **Postconditions:** guaranteed outcomes when preconditions hold.
- **Invariants:** properties that must always remain true.
- **Failure modes:** typed errors, status codes, and retry semantics.
- **Idempotency/concurrency:** behavior under repeated or parallel calls.
- **Observability:** logs/metrics/traces emitted and redaction expectations.

If any contract item is ambiguous, state assumptions explicitly before coding.

## Implementation Plan
Create a minimal, ordered plan:

1. Add/adjust interfaces and types that encode the contract.
2. Implement business logic with guardrails for preconditions/invariants.
3. Add or update tests that prove each contract clause.
4. Wire integration points and update docs/changelog if needed.

Keep changes atomic and scoped; avoid opportunistic refactors.

## Code Change Rules
- Prefer composition over global/shared mutable state.
- Keep side effects at boundaries (I/O, network, filesystem).
- Validate external input at module boundaries.
- Never swallow errors; convert to contract-defined failures.
- Preserve backward compatibility unless the contract explicitly allows breaking changes.

## Verification Requirements
For each contract clause, provide at least one verification artifact:

- Unit tests for happy path and edge cases.
- Negative tests for precondition violations and error mapping.
- Integration tests for boundary behavior where applicable.
- Static checks/lint/type checks if available.

Use a concise matrix:

| Contract Clause | Verification | Result |
|---|---|---|
| `<clause>` | `<test/check name>` | `pass/fail` |

## Definition of Done
A run is complete only if all are true:

- Contract is explicit and complete.
- Implementation matches contract.
- Verification evidence is provided and reproducible.
- Risks and deferred work are documented.

## Starter Prompt (copy/paste)
"Implement `<module_name>` using a contract-driven workflow.

First, produce `## Contract` with interface, preconditions, postconditions, invariants, failure modes, idempotency/concurrency, and observability.
Then produce `## Implementation Plan` with atomic steps.
Then implement and summarize under `## Code Changes`.
Then provide `## Verification` including a contract-to-test matrix.
Finally, provide `## Risks & Follow-ups`.

Respect: `<dependency/performance/security/compatibility constraints>`.
Avoid changes outside module scope unless required by the contract."
