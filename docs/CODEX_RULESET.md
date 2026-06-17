# MurMur Codex Ruleset (LAG 0)

This ruleset defines exactly how Codex must operate inside the MurMur Core repository.

## 1) Operating Principles

1. **One layer at a time**
   - Implement only one architectural layer per lag/task.
   - Do not mix strategy, product, API, infra, and UI changes in the same step unless explicitly requested.
   - Keep each change scoped, reversible, and testable.

2. **No product sprawl**
   - Prioritize the single current commercial path.
   - Do not introduce new product lines, side tools, or parallel initiatives unless explicitly approved.
   - Any new idea should be captured as a later lag, not implemented immediately.

3. **No renaming core concepts**
   - Preserve MurMur’s canonical terms.
   - Avoid replacing established terminology with synonyms that dilute architecture or intent.
   - If wording must change, document rationale and obtain explicit approval first.

## 2) Approved Stack (Default Constraints)

Codex must stay within this approved stack unless explicitly instructed otherwise:

- **Next.js App Router**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **Vercel**
- **Zod**

Rules:
- Do not add alternative frameworks/libraries that duplicate the approved stack.
- Any exception requires a clear written justification and explicit approval.

## 3) Canonical MurMur Core Loop

All implementation choices must align to this loop:

1. **Input**
2. **Council**
3. **Orchestration**
4. **Report**
5. **Follow-up**
6. **Learning Loop**

Guidance:
- Maintain this order in architecture and documentation.
- New features should map clearly to one or more loop stages.
- Do not skip stages conceptually when describing system behavior.

## 4) Commercial Focus

- **First commercial product: MurMur Trust Scan**

Rules:
- Prioritize decisions that strengthen, ship, or validate MurMur Trust Scan.
- Defer unrelated product ambitions to future lags.

## 5) Response Contract for Every Codex Delivery

Every Codex response in this repo must include:

1. **Files changed**
2. **Implementation summary**
3. **Test steps**
4. **Environment variables**
5. **Known limitations**
6. **Next recommended lag**

Preferred structure:
- Use concise headings in the order above.
- If a section is not applicable, write `None` and explain why briefly.

## 6) Change Scope Guardrails

- Do not modify unrelated files.
- Keep diffs minimal and directly tied to the requested lag.
- Preserve backward compatibility unless breaking change is explicitly requested.


## 7) Automated Compliance Checks

Codex compliance is enforced by `scripts/check-codex-compliance.mjs` and the `Codex Compliance` GitHub Actions workflow.

The check must verify:
- `docs/CODEX_RULESET.md` still contains the required principles, approved stack, core loop, commercial focus, and response contract.
- Pull request bodies or Codex delivery notes include the required response sections.
- Changed files do not introduce obvious stack drift away from Next.js App Router, TypeScript, Tailwind CSS, Supabase, Vercel, or Zod.
- Changed files do not introduce obvious terminology drift away from Council, Orchestration, and MurMur Trust Scan.

Run locally with:

```bash
node scripts/check-codex-compliance.mjs
```

For pull request ranges, run:

```bash
node scripts/check-codex-compliance.mjs --changed origin/main...HEAD --response-file path/to/pr-body.md
```

## 8) LAG 0 Definition of Done

LAG 0 is complete when:
- `docs/CODEX_RULESET.md` exists.
- The ruleset documents the principles, stack, loop, commercial focus, and response contract above.
- No unrelated files are changed.
