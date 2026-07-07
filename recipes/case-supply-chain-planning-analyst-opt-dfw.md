---
status: DRAFT
todos_open: 4
last_gate: null
attestation: null
recipe_version: 0.1.0
---

# case-supply-chain-planning-analyst-opt-dfw — Supply Chain / Planning Analyst Role Triage (OPT/STEM-OPT)

## Purpose

Evaluate supply chain analyst / planning analyst roles for a candidate on F-1 OPT (STEM extension eligible), preferring Dallas-Fort Worth with remote acceptable, using verified local data, real maintained scripts, and bounded human judgment. Agents use this to assemble sponsorship, funding, liveness, and role-quality evidence into a scored Apply / Consider / Skip recommendation; humans use the report to see what was verified, inferred, missing, or blocked before spending OPT time on an application.

Use this mode when triaging a batch of supply chain/planning analyst postings before applying, and again after applications go out, to keep status current.

## Source Inventory

| Source Node | Node Type | Source URL or Path | Human Check |
|---|---|---|---|
| Sponsorship + company mapping | CSV | `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` | Confirm company rows exist for target employers before trusting a sponsorship flag. |
| SEC Form D (funding recency) | JSON | `data/sec/form-d/processed/companies-sec-2026q1-d.sample.json` (sample); full processed set under `data/sec/form-d/processed/` | Confirm the quarter is current; re-run refresh script if stale. |
| BLS/O\*NET SOC reference | CSV | `data/bls/compact/soc_occupation_compact.csv` | Confirm SOC 13-1081 (Logisticians) row exists and matches target titles. |
| Role scorer (real, tested) | Script | `scripts/score/role-scorer.mjs` (`npm run score`) | Confirm script runs against the sample fixture before trusting it on real roles. |
| ATS scan / liveness (real, tested) | Script | `scripts/ats/scan.mjs`, `scripts/ats/check-liveness.mjs` (`npm run ats:scan`, `npm run ats:liveness`) | Confirm `--dry-run` completes with no writes before running against real postings. |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| Roles file | JSON | `data/ats/<candidate-roles>.json` — one record per role, matching the schema `role-scorer.mjs` expects (`sponsorship`, `fit`, `liveness`, `timeline` fields, each with `source` tag). Exact schema confirmation tracked in Known Gaps #3. | Yes |
| Candidate profile | JSON | `data/ats/profile.json` — must declare `authorization` (e.g. "F-1 OPT, sponsorship needed") so `applyProfile()` in the scorer sets weights correctly. | Yes |
| Posting URLs | Text/URL list | Pulled from target company boards via `npm run ats:scan -- --dry-run`, then checked individually with `npm run ats:liveness -- <job-url>`. | Yes, before scoring a role Apply-eligible |
| Application status (inbox) | JSON | Currently human-entered; proposed automation is `data/ats/inbox-status.json` (see TODO below). | No (manual until TODO closed) |

## Phase Gates

1. **Source gate** — required source paths exist or are marked with a typed TODO (see Known Gaps). Test: `test -f data/bls/compact/soc_occupation_compact.csv && test -f data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv`.
2. **Liveness gate (hard stop)** — a posting is only scored or tracked Apply-eligible if `npm run ats:liveness -- <job-url>` returns live. Dead postings are logged and skipped, never scored as Apply/Consider.
3. **Data-shape gate** — the roles JSON parses and matches the scorer's expected fields before `npm run score` runs. Test: `python3 -m json.tool data/ats/<candidate-roles>.json`.
4. **Script-readiness gate** — `scripts/score/role-scorer.mjs` and `scripts/ats/check-liveness.mjs` exist and are the real, unmodified repo scripts (no ad-hoc scoring code). Test: `test -f scripts/score/role-scorer.mjs && test -f scripts/ats/check-liveness.mjs`.
5. **Timeline gate (human)** — a role is only Apply-eligible if it fits inside the OPT/STEM-OPT window. This mode does not calculate immigration deadlines; the `timeline` factor in the roles JSON is human-supplied (`source: your-input`), same convention as the Ch.11 fixture.
6. **Report gate** — agent log and human report are both written before the run is considered complete. Test: `test -f logs/case-supply-chain-planning-analyst-opt-dfw-[DATE].json && test -f reports/generated/case-supply-chain-planning-analyst-opt-dfw-[DATE].md`.

## Steps

1. **Step name:** Detect ATS and confirm liveness. **Labor:** AI, human clears gate.
   **Command (real):** `npm run ats:scan -- --dry-run` then `npm run ats:liveness -- <job-url>` per candidate posting.
   **Input:** target company URLs.
   **Output:** ATS provider per company, liveness true/false per posting, timestamped.
   **Where output goes:** `data/ats/` (per repo convention — private, review before commit).

2. **Step name:** Build the roles JSON. **Labor:** Human, with AI drafting assistance.
   **Input:** live postings only (from Step 1), sponsorship lookup from `mapped_student_employment_targets_v3.csv`, Form D recency from `data/sec/form-d/processed/`, SOC 13-1081 reference from `soc_occupation_compact.csv`.
   **Output:** `data/ats/<candidate-roles>.json`, one record per role, `role_quality` field present but weighted 0 per current repo default (inherited, not decided fresh — see Known Gaps).
   **Where output goes:** `data/ats/`.

3. **Step name:** Score the composite. **Labor:** AI (script), no judgment inserted.
   **Command (real):** `npm run score -- data/ats/<candidate-roles>.json --profile data/ats/profile.json --out-dir reports/generated/`
   **Input:** roles JSON + profile JSON.
   **Output:** `role-scores.json` (full per-term trace) + `role-scores.md` (human-readable table), written by the script itself — this is the real, tested output shape, not a placeholder.
   **Where output goes:** `reports/generated/`.

4. **Step name:** Human review and gate clearance. **Labor:** Human.
   **Input:** `role-scores.md`, plus liveness/timeline gate status from Steps 1–2.
   **Output:** gate decisions (approve/hold per role), any documented override (same convention as the Ch.11 "HM is a contact" example — override requires a written reason or it's ignored).
   **Where output goes:** recorded in the human report and `logs/RUN_LOG.md`.

5. **Step name:** Sync application status from inbox (proposed, not yet built — see Known Gaps #4). **Labor:** AI with human gate, once built.
   **Script called:** `scripts/ats/inbox-sync.mjs` — proposed. Would classify replies into ACK / ADVANCING / REJECTED / SILENT and feed `merge-tracker.mjs` / `normalize-statuses.mjs`, which already exist but currently have no real ingestion source.
   **Input (proposed):** mail export (`.mbox` or Gmail takeout).
   **Output (proposed):** `data/ats/inbox-status.json`.
   **Until built:** status is entered by hand; this mode never infers ACK/ADVANCING/REJECTED/SILENT from anything other than a human reading the actual reply.

## Output Contract

### Agent output
File: `logs/case-supply-chain-planning-analyst-opt-dfw-[DATE].json`
Fields: mirrors the real `role-scorer.mjs` trace shape — `role_id`, `company`, `title`, `composite`, `recommendation`, `machine_recommendation`, `reason`, `override`, `trace.votes` (factor/value/weight/contribution/source), `trace.gates` (factor/multiplier/source), plus run-level fields: `run_id`, `mode`, `records_seen`, `rejects`, `flags`, `gate_decisions`, `generated_at`.

### Human report
File: `reports/generated/case-supply-chain-planning-analyst-opt-dfw-[DATE].md`
Reader: the candidate, reviewing before deciding which applications to submit this week.
Decision enabled: which roles to apply to now, which to hold pending more evidence, which to drop.
Sections: run summary, roles evaluated, Apply/Consider/Skip table with full audit trail (same format as `role-scores.md`), flags (including the inherited `role_quality = 0` note), open TODOs, next actions.

## Stop Conditions

- Stop if a posting's liveness cannot be resolved (network error, not a genuine dead-posting result) — log the failure, do not guess.
- Stop if a company has no entry in the sponsorship dataset — report "no sponsorship record found," never infer sponsorship likelihood from company size or industry.
- Stop if the roles JSON does not match the scorer's expected schema — do not hand-patch fields to force a score.
- Stop if `inbox-sync.mjs` is invoked before it exists — status stays human-entered until the TODO closes.
- Stop before any live network call beyond `ats:scan --dry-run` / `ats:liveness` without explicit human approval, per repo convention.

## Provenance

| Source | Verification command | Notes |
|---|---|---|
| `data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv` | `test -f "data/80-days-to-stay/80-days-csv/mapped_student_employment_targets_v3.csv"` | Sponsorship/company mapping, upstream — do not rewrite. |
| `data/sec/form-d/processed/` | `test -d "data/sec/form-d/processed"` | Funding recency signal; refresh via `python3 scripts/sec/refresh-recent-sec-quarters.py`. |
| `data/bls/compact/soc_occupation_compact.csv` | `test -f "data/bls/compact/soc_occupation_compact.csv"` | SOC reference; working assumption SOC 13-1081. |
| `scripts/score/role-scorer.mjs` | `test -f "scripts/score/role-scorer.mjs"` | Real, tested scorer — reused unmodified, per P2 (only ingest scripts touch new data; tools read verified data). |

## Known Gaps (honest list — 1 resolved decision + 4 open TODOs)

1. **Resolved, not a TODO: `role_quality` weight = 0**, inherited unmodified from the repo default (`scripts/score/role-scorer.mjs` CONFIG). This is flagged `[VERIFY]` in the script itself — it is not pinned by the book chapter. For this mode, the decision is to **leave it at 0** rather than invent an unjustified number: the BLS/O*NET SOC signal is present in the Source Inventory but currently contributes nothing to the composite score. This is a real limitation of the mode as run today, logged as a deliberate choice, not a hidden one.
2. **[TODO: DATA SOURCE]** DFW/remote location filtering — not yet confirmed whether any existing source carries a normalized location field. Closed by: human confirms which column, or confirms it must come from `ats:scan` output instead.
3. **[TODO: DEFINE]** Exact per-role JSON schema for this domain — confirm against `data/examples/ch11-roles.json` before the first real run so field names match what `role-scorer.mjs` expects exactly.
4. **[TODO: DEV]** `scripts/ats/inbox-sync.mjs` — proposed, not built. See Step 5.
5. **[TODO: DATA SOURCE]** `data/ats/inbox-status.json` — depends on #4; closed by human confirming the file exists with real classified entries + provenance (which inbox, what date range, manual or scripted).

## RUN_LOG template

```markdown
### <date> — case-supply-chain-planning-analyst-opt-dfw
- Inputs: <N postings / companies checked, anonymized>
- Commands run: <verbatim — e.g. npm run ats:scan -- --dry-run; npm run score -- data/ats/roles.json>
- Result: <N live, N dead, N Apply / N Consider / N Skip>
- Open issues: <e.g. role_quality still 0, location TODO open, inbox-sync not built>
```
