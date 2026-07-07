# AI Use Disclosure — Mode Build Assignment (case-cv-integrity-backend-h1b)

**Student:** Laksh Dhamija · **Date:** 2026-07-06
**Tools used:** Claude Code (agent) — code drafting, recipe/document drafting, run execution and capture.

## What the AI did
- Drafted `scripts/resumes/cv-integrity-check.mjs`, the recipe file, the sample fixtures, and these documents.
- Executed the runs and captured the terminal output pasted in the worked run.
- Performed the "independent hostile reviews" referenced in the worked run: separate, context-free AI agent sessions (blind graders given only the assignment text and the branch, no build history) that attacked the tool adversarially. Their real findings — the missing-attestation-block bypass, the cross-field `CRM` false-anchor, the metadata-corpus pollution, and the crash that exited with the gate-open code — are attested with pre/post behavior in the worked run.

## What I did (the judgment the AI cannot do)
- Chose the mode and its scope (an inward integrity gate rather than another company ranker) and set its design rules: never auto-cut, never auto-keep; the gate is deterministic; a model may assist only labeled and non-gating.
- Made the per-flag decisions on the live run: PROMOTE `ClickHouse` (I know it is true experience); left `ETL` and `GraphQL` open because only I can answer them — and the render gate stays blocked until I do.
- Attested the base record the mode anchors to, and the corrections in it.

## What the AI could not do (specific instances)
1. The live run flagged `ClickHouse`, `ETL`, `GraphQL` on my real variant. The AI could detect the missing anchors but could not know that ClickHouse is true experience my attested base had dropped, or whether I can defend ETL/GraphQL in an interview. Those calls required knowledge of my own history that no model has.
2. The deliberate break attempt exposed a real crash in the AI-drafted stop-condition code (TDZ `ReferenceError` instead of the designed graceful exit 2). The AI wrote the bug and, once the test surfaced it, the fix — but the *decision to attack that path* came from the attestation discipline, not from the model's confidence in its own code.
