---
status: RUNNABLE-LIVE
todos_open: 4
last_gate: liveness-break-test
attestation: worked-run.md#attestation
recipe_version: 0.2.0
---

# Backend/AI-Infra Job-Ops Pipeline Integrity (ATS Detection + Liveness Audit)

## Purpose

This mode answers one narrow question for a student running several backend/AI-infra
applications in parallel: **before spending more OPT-clock time on a company, can the
Job-Ops layer actually tell me whether the posting is real, and can I trust that
answer?**

It is used at the moment a student is about to (a) add a new company to their tracked
list, or (b) decide whether to keep chasing a company whose posting hasn't moved in
weeks. It does not score sponsorship likelihood or role quality — that is the 80 Days
and Cognitive Pivot layers' job. This mode only certifies whether the *evidence
pipeline itself* (ATS detection → scan → liveness) is trustworthy for a given company,
and it stops and flags rather than guesses when it isn't.

This is a companion audit layer to `recipes/case-backend-swe-opt-triage.md`, which
currently lists "ATS provider and liveness" as one of four evidence types but has no
implemented scripts (13 open TODO items declared in its frontmatter, every step
still unimplemented). This mode
supplies the one signal that recipe assumes is reliable, with real runs, real
failures, and a documented reliability boundary.

## Source Inventory

| Source / Script | Exact path or command | What it does |
|---|---|---|
| ATS platform detector | `python scripts/ats/detect-ats.py "<Company>" [--json-output out.json]` | Probes Greenhouse and Lever public APIs by slug guess. Positional company-name args, not `--company`. |
| Portal config | `data/ats/portals.yml` (copy from `data/ats/portals.example.yml`) | Declares tracked companies, provider, `careers_url` or explicit `api:`, and title/location filters. |
| Zero-token scanner | `npm run ats:scan -- --dry-run` / `npm run ats:scan` | Pulls postings via the provider plugin layer (`scripts/ats/providers/*.mjs`), writes `data/ats/pipeline.md` and `data/ats/scan-history.tsv`. |
| Liveness checker | `npm run ats:liveness -- <job-url>` | Playwright-based per-posting check; classifies `active` / `expired` / `uncertain`. Requires `npx playwright install chromium` once. |
| Provider plugins | `scripts/ats/providers/greenhouse.mjs`, `scripts/ats/providers/ashby.mjs`, `scripts/ats/providers/lever.mjs` | Each auto-detects from `careers_url` pattern or an explicit `provider:`/`api:` override in `portals.yml`. |
| Conformance / privacy checks | `npm run verify`, `npm run doctor` | Repo-wide conformance and PII-leak gates, run before every commit. |

## Proposed Additions

- **[TODO: DEV]** Add an `ashby` value to `detect-ats.py --platforms`. The scanner's
  provider layer (`scripts/ats/providers/ashby.mjs`) already supports Ashby via a
  `jobs.ashbyhq.com/<slug>` URL pattern, but the standalone detector script only
  accepts `greenhouse,lever` and rejects `ashby` outright. Detection and scanning are
  currently two different platform lists in the same repo — this belongs in
  `detect-ats.py` so a single command can answer "what ATS is this and is it
  supported," instead of requiring a human to manually confirm via web search first
  (as this mode's Worked Run had to do).
- **[TODO: DEV]** A `--platform-fallback` flag or auto-retry step for `detect-ats.py`:
  when Greenhouse/Lever both 404, attempt Ashby before returning `not_found`. Right
  now `not_found` is ambiguous between "genuinely not on any supported ATS" (true, for
  Box) and "on a supported-by-scan.mjs-but-not-by-detect-ats.py platform" (true, for
  Notion and Cartesia in this run) — see Stop Conditions below.
- **[TODO: DATA SOURCE]** A small allowlist/heuristic for known custom-ATS vendors
  (e.g. "powered by Happydance," Workday tenant URLs, iCIMS) so the liveness checker
  can label these `unsupported-platform` instead of `expired` when content extraction
  fails. This directly targets the false-negative found in the Worked Run.
- **[TODO: DEV]** A `--confirm-platform <name>` override so a human who has manually
  verified a company's real ATS (as done here for Notion and Cartesia via web search)
  can force the correct provider without waiting on the two TODOs above.

## Phase Gates

1. **Detection gate.** A company is not added to `portals.yml` as `enabled: true`
   until its ATS platform is either (a) confirmed by `detect-ats.py`, or (b) manually
   confirmed via the company's own careers page and recorded with the source URL.
   Test: every `tracked_companies` entry in `data/ats/portals.yml` has either a
   `detect-ats.py` JSON record in `data/ats/` or a note in the run log citing the
   manual-verification source.
2. **Scan-integrity gate.** `npm run ats:scan -- --dry-run` must complete with zero
   entries in its `Errors` block before a non-dry run is allowed. Test: grep the dry
   run output for `Errors (` and confirm the count is `0`.
3. **Liveness gate — hard stop, not a vote.** A posting is only actionable
   ("apply"/"keep pursuing") if `npm run ats:liveness` returns `active`. `expired`
   stops the workflow outright. `uncertain` requires a manual open-in-browser check
   before any action is logged. This gate cannot be overridden by a model judgment —
   only by a human re-check.
4. **Platform-boundary gate.** If a company's confirmed ATS is not one of the
   supported providers (`greenhouse`, `lever`, `ashby`), or if liveness returns
   `expired` for a posting the student has independently confirmed is still listed on
   the company's own site, the mode must stop and log the company as
   `unsupported-platform` rather than report a live/dead verdict.

## What This Mode Can and Cannot Verify

**Can verify, with real evidence from this run:**
- Whether a company is on Greenhouse or Lever, and the exact API endpoint (confirmed:
  Fireworks AI → Greenhouse, `boards-api.greenhouse.io/v1/boards/fireworksai/jobs`, 37
  jobs).
- Whether a specific Greenhouse posting URL is currently live or dead (confirmed:
  a real Fireworks AI posting → `active`; a fabricated job ID on the same board →
  correctly `expired`, with a redirect trail as evidence).
- Whether a company is on Ashby, once the provider is set manually in `portals.yml`
  (confirmed: Notion and Cartesia both resolved and returned real postings through
  `scan.mjs`'s Ashby provider, 208 total jobs across all three tracked companies before
  filtering).

**Cannot verify, and this mode will not guess:**
- Whether a `not_found` from `detect-ats.py` means "not on any ATS" or "on an ATS this
  script doesn't check." These look identical in the tool's output and are not
  identical in reality (see Notion/Cartesia in Worked Run).
- Whether a posting on a custom/self-hosted careers site (e.g. Box's site, which
  states "Careers website powered by Happydance") is live or dead. The liveness
  checker returned `expired` for a posting independently confirmed live at the time of
  the check — this is a false negative, not a verified answer, and this mode will not
  present it as one.
- Whether FT Partners is on any supported platform — not resolved in this run
  (recorded as an open item, not guessed).

## Output Contract

### Agent log
File: `logs/RUN_LOG.md` (appended entry) plus raw tool output retained in
`data/ats/scan-history.tsv` and `data/ats/pipeline.md`.
Fields per run: `date`, `mode`, `companies_checked`, `platform_confirmed`,
`platform_method` (`detect-ats.py` | `manual-web-verify`), `scan_result`
(jobs_found / filtered_title / filtered_location / new_offers / errors),
`liveness_result` (url, verdict, evidence), `open_issues`.

### Human report
Format: Markdown table, one row per tracked company.
Columns: `Company | ATS Platform | Detection Method | Scan Status | Sample Liveness
Verdict | Action`.
Reader: the student themself, at decision time — "do I keep tracking this company or
not." No agent-facing JSON is exposed to this reader; the report is the only surface
they see, per the one-artifact-one-reader rule.

## Stop Conditions

- Stop and do not mark a company `enabled: true` in `portals.yml` if its platform is
  unconfirmed by either script output or a cited manual source — do not default to
  "not_found = not trackable."
- Stop before treating `npm run ats:scan --dry-run` output as ready for a live run if
  the `Errors` block is non-empty.
- Stop before recommending "drop this company" on a liveness `expired` verdict if the
  underlying platform is not one of `greenhouse` / `lever` / `ashby` — flag
  `unsupported-platform` instead and require a manual browser check.
- Stop before generalizing this run's findings ("Ashby detection is broken") beyond
  what was tested — only `detect-ats.py`'s `--platforms` flag was confirmed to reject
  `ashby`; the `scan.mjs` Ashby provider itself was not found broken, only bypassed.

## RUN_LOG Template

```
### <DATE> — case-backend-infra-jobops-liveness-ranfei
- Mode: case-backend-infra-jobops-liveness-ranfei
- Companies checked: <list>
- Platform confirmed via: detect-ats.py | manual-web-verify
- Scan result: <jobs_found> found, <filtered_title> filtered by title, <filtered_location> filtered by location, <new_offers> new, <errors> errors
- Liveness checked: <url> -> <verdict> (<evidence>)
- Open issues: <list, or "none">
```
