# Submission — AI-Washing Reverse-Filter Triage for Data/AI OPT Students

**Author:** Zhiyuan · **Branch:** `mode/zhiyuan-data-ai-opt` · **Date:** 2026-07-20

A recipe for The Reallocation Engine that reverse-filters AI-washed job postings — roles that
are really sales / solutions / management wearing an "AI/ML/Data" title — for an OPT student
under time pressure. Reworked from a 25-point design draft into a 100-point recipe with a real,
logged sample run.

## What's here (and what's canonical elsewhere)

| Item | Path |
|---|---|
| **Mode / recipe** (canonical) | [`recipes/case-ds-opt-ai-washing-triage.md`](../../../recipes/case-ds-opt-ai-washing-triage.md) |
| **Domain justification** (this folder) | [`domain-justification.md`](domain-justification.md) |
| **Worked-run writeup** (this folder) | [`worked-run.md`](worked-run.md) |
| Agent log (JSON) | [`logs/case-ds-opt-ai-washing-triage-2026-07-20.json`](../../../logs/case-ds-opt-ai-washing-triage-2026-07-20.json) |
| Human report (Markdown) | [`reports/generated/case-ds-opt-ai-washing-triage-2026-07-20.md`](../../../reports/generated/case-ds-opt-ai-washing-triage-2026-07-20.md) |
| Run-log entry | `logs/RUN_LOG.md` → `2026-07-20 -- ds-opt-ai-washing-triage` (quoted below) |

## Rubric map

| Block | Where it's answered |
|---|---|
| Mode Design (24) | the recipe: two-line filter, real paths, testable gates, dual output, verified/inferred boundary |
| Domain Justification (20) | `domain-justification.md`: AI-washing asymmetry + Solutions-trap / Series-A-penalty failure modes |
| Worked Run (16) | `worked-run.md` + recipe: real output, verified/inferred split, one deliberate break (CRLF), reflection |
| Class presentation (20) | `worked-run.md` — domain, asymmetry, real run, one real limitation (euphemistic washing) |

## Verification (machine half of P4)

```
npm run verify   → conformance + manifest-check
npm run doctor   → environment + recipe dashboard (this recipe: RUNNABLE-SAMPLE, todos_open 3)
```

## Run-log entry (from `logs/RUN_LOG.md`)

> ## 2026-07-20 -- ds-opt-ai-washing-triage: new recipe + first sample run
>
> - **Recipe:** `case-ds-opt-ai-washing-triage` (new), sample mode. Reworked from the legacy
>   25-pt design draft: `SCRIPTS/`→`scripts/`, `modes/`→`recipes/`, `modes/RUN_LOG.md`→
>   `logs/RUN_LOG.md`; added lifecycle frontmatter; proposed command → typed TODOs; dual output;
>   testable gates.
> - **Command:** `npm run ats:scan -- --dry-run` + manual `grep`/`rg` triage; `grep -i databricks` on the H-1B CSV.
> - **Result:** 787 jobs → 58 offers; majority Skip, 0 unambiguous IC Data/AI targets. H-1B join
>   verified: `Databricks`→`DATABRICKS INC`, 1640/8/99.51%/$149,422.50.
> - **Open:** `[TODO: DEV]` automation script; `[TODO: DEFINE]` run-envelope schema;
>   `[TODO: APPROVE]` live scan; human attestation for VERIFIED.

## Status & honesty note

`status: RUNNABLE-SAMPLE` — a full sample run completed and is logged, using the existing command
surface. One `[TODO: DEV]` (an automation script) stays open; the sample run did not depend on it.
This is disclosed in the recipe rather than hidden. Not committed beyond this repo; no `git push`
or PR performed.
