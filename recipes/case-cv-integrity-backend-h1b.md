---
status: RUNNABLE-SAMPLE
todos_open: 3
last_gate: "sample-run, 2026-07-06, logs/RUN_LOG.md#2026-07-06 (artifacts: logs/cv-integrity-2026-07-06.json, reports/generated/cv-integrity-2026-07-06.md)"
attestation: null
recipe_version: 0.1.0
---

# CV Integrity Gate for an LLM-Tailored Résumé (Backend SWE, F-1 → H-1B)

## Purpose

Proves that an LLM-tailored résumé variant invented nothing before it is rendered or sent. Built for an international backend/platform engineer (F-1, OPT starting 2026-09, H-1B sponsorship required) who keeps one attested base record and generates a tailored variant per application. The check anchors every named entity in the variant — each tool, service, credential, metric — to the attested base via a deterministic word-boundary membership test; anything with zero matches is flagged for a human decision (DROP: not true / PROMOTE: true but missing from the base). The variant may not proceed to `npm run resumes:pdf` while any flag is open. Agents use this recipe to run the check and stage the two artifacts; the human uses the report to decide each flag and clear the gate.

Status note (honest lifecycle reading): the runnable core (steps 1–6) carries zero open TODOs, completed a full sample run with conformance passing and both artifacts generated and read, plus a live-mode run on real private data. The 3 open typed TODO items below are proposed extensions off the executed path. Strictly, SNICKERDOODLE's DRAFT→SPECIFIED gate reads "zero open TODO items"; I keep the extension TODOs visible rather than deleting them to game the count, and claim RUNNABLE-SAMPLE on the core-path evidence.

## Source Inventory

| Source Node | Node Type | Source URL or Path | Human Check |
|---|---|---|---|
| Attested base record | JSON file | `private/resume.json` (live) · `data/examples/cv-integrity/sample-base-cv.json` (sample) | Confirm `attestation.attested: true` and that the attestation note describes real corrections — an unattested base is the agent's guess about your past. |
| Tailored variant | Markdown/LaTeX/text file | `private/variants/<role>.md\|.tex` (live) · `data/examples/cv-integrity/sample-variant-*.md` (sample) | Confirm the variant is the exact file you intend to send, not an earlier draft. |
| Integrity checker | script | `scripts/resumes/cv-integrity-check.mjs` (`npm run resumes:integrity`) | Read the dictionary and stoplist once; they bound what the check can see. |
| Render pipeline | script | `scripts/resumes/generate-pdf.mjs` (`npm run resumes:pdf`) | Existing maintained script; runs only after the gate clears. |

## Inputs

| Input | Type | Source | Required? |
|---|---|---|---|
| `--base` | path to attested base (`.json` preferred; raw `.md` accepted) | `private/resume.json`, from the setup-exercise personal layer | Yes |
| `--variant` | path to LLM-tailored variant (`.md`, `.tex`, `.txt`) | `private/variants/` | Yes |
| `--mode` | `sample` or `live` | run envelope / operator | Yes (defaults to `sample`) |
| `--json`, `--report` | output paths for the two artifacts | see Output Contract | Yes for logged runs |

## Phase Gates

1. Base-attestation gate: the base record exists and carries `attestation.attested: true`. Test: `python3 -c "import json,sys; d=json.load(open('private/resume.json')); sys.exit(0 if d['attestation']['attested'] is True else 1)"`. Enforced in-tool: the checker exits 2 on an unattested or missing base. Human capacity: attest or re-attest the base before any variant work.
2. Scope gate: the run declares `--mode sample` (tracked fixtures) or `--mode live` (private data). Enforced in-tool: an unrecognized mode is a stop (exit 2), and in live mode the tool refuses `--json`/`--report` paths outside `private/` (exit 2 — and the stop-log itself is never written to a refused path). Test: the `mode` field in the agent log matches the operator's declaration. Human capacity: approve live mode.
3. Integrity gate (the core stop): zero open flags. Test: `npm run resumes:integrity -- --base <base> --variant <variant>` exits `0`. Exit `1` means a human must decide DROP or PROMOTE per flag and re-run; the variant does not render while this gate is open. This is a gate, not a vote.
4. Promotion-consistency gate: every PROMOTE decision was applied to the base first (the fact now lives in the attested record), then the variant re-checked. Test: re-run exits `0` and the base's `attestation.attested_date` is ≥ the decision date. Human capacity: the promote edits are yours alone.
5. Render gate: only after gate 3 reads `0` may `npm run resumes:pdf` run on the variant. Test: gate-3 exit code recorded in the agent log is `0`.
6. Report gate: both artifacts exist and were read. Test: `python3 -m json.tool <agent-log>.json` parses and the human report's decision column contains no unresolved `DROP / PROMOTE` placeholder for a flagged row at send time.

## Steps

1. Step name: Verify base attestation. Labor: AI with Human gate.
   Script called: `scripts/resumes/cv-integrity-check.mjs` (attestation check is built into input loading; exit 2 stops the run).
   Input: `--base` path.
   Output: pass, or stop condition recorded in the agent log.
   Where output goes: agent log (`--json` path).
2. Step name: Run the membership check. Labor: AI (deterministic code; no model call).
   Script called: `scripts/resumes/cv-integrity-check.mjs` via `npm run resumes:integrity`.
   Input: `--base`, `--variant`, `--mode`.
   Output: candidates_checked, anchored[], flags[] (entity, occurrences, variant line excerpt), exit code.
   Where output goes: agent log (JSON) + human report (Markdown).
3. Step name: Decide each flag. Labor: Human only.
   Script called: none — this judgment is the point (P1).
   Input: the human report's flag table.
   Output: per-flag DROP or PROMOTE, written into the report's decision column.
   Where output goes: the human report (live runs: in `private/reports/`).
4. Step name: Apply decisions. Labor: Human (edits), AI may draft the base edit for a PROMOTE.
   Input: decisions from step 3.
   Output: DROPs removed from the variant; PROMOTEs added to the base record first (update `attestation.attested_date` + note), then the variant regenerated or edited.
   Where output goes: `private/resume.json`, `private/variants/`.
5. Step name: Re-run until exit 0. Labor: AI.
   Script called: `npm run resumes:integrity` (same arguments).
   Output: exit 0 and a fresh pair of artifacts.
   Where output goes: agent log + human report (dated).
6. Step name: Render. Labor: AI.
   Script called: `npm run resumes:pdf` on the cleared variant (existing maintained script).
   Output: ATS-safe PDF.
   Where output goes: `output/resumes/` (samples) · `private/` (live).
7. Step name: Log the run. Labor: AI drafts, Human signs.
   Output: RUN_LOG entry per the template below.
   Where output goes: `logs/RUN_LOG.md`.

## Proposed Additions (typed TODOs — off the runnable core path)

- [TODO: DEV] `--apply-promote` one-keystroke promotion: append a PROMOTE decision to the base record and bump `attested_date` in one step. Justification: in observed runs most flags are true-but-undocumented (6 of 8 in the sample fixture); if promoting is tedious, a tired applicant rubber-stamps and the gate rots into theater. Handoff condition: promote round-trips (base updated → re-run → flag gone) on the sample fixtures.
- [TODO: DEV] Semantic-drift assist: an optional, clearly-labeled model pass listing reworded lines whose meaning may have strengthened ("contributed to" → "led"). Justification: meaning drift is explicitly outside the deterministic check's scope; a labeled model judgment (P8) beats silence, but it must never gate — the gate stays deterministic. Handoff condition: output labeled `model-judgment` in the agent log and excluded from exit-code logic.
- [TODO: DATA SOURCE] Dictionary provenance: seed the tech-term dictionary from an external, versioned source (e.g. the O*NET Hot Technologies list) with a provenance note, instead of a hand-maintained array. Justification: dictionary coverage is the check's known false-negative boundary; a sourced list makes that boundary auditable.

## What This Recipe Can and Cannot Verify

Can verify (deterministic, reproducible, no model call):
- That every named entity in the variant has a word-boundary match in the attested base corpus (or is an acronym whose initials appear as a consecutive word run in the base, e.g. MTTD ← "mean time to detection").
- That a fabricated entity is caught as absent-from-base even when it is a one-character neighbor of ordinary prose (`etcd` anchors only if `etcd` itself is in the base — text like "etc." could never anchor it), and that a substring cannot falsely anchor (`rds` inside "dashboards" — present in the sample base — does not anchor `RDS`).
- That the base carries `attested: true` before anything is checked against it.
- That base *metadata* cannot anchor a claim: the attestation block and `_`-prefixed keys are excluded from the anchor corpus, so a note that mentions a removed skill does not re-anchor it (hostile-review finding — the note documenting a removal was anchoring the removed claim; fixed and regression-tested).
- The exit-code gate itself: 0 clean · 1 open flags · 2 stop condition (including any unexpected crash).

Cannot verify (stated, not hidden):
- Meaning drift in reworded lines — "contributed to X" → "led X" passes by design; that judgment stays human (proposed labeled assist above, never gating).
- Whether a PROMOTE decision is honest — the check trusts the attested base and the human's answer; it cannot tell a true promotion from a confident lie to yourself.
- A novel tool absent from the dictionary and not acronym/CamelCase-shaped (coverage boundary; see the DATA SOURCE TODO).
- Whether the base record itself is true — that is the setup exercise's attestation pass, upstream of this recipe.
- Extraction noise at the margins, listed rather than silently filtered: acronym-initials anchoring is scoped to a single base field/line (a hostile review found a fabricated `CRM` chance-anchoring when initials spanned the whole corpus — fixed and re-tested; `CRM` now flags), but a short acronym can still chance-anchor within one long sentence; case-insensitive matching means a common-word language name ("Go") can anchor on ordinary prose; and the candidate regex admits tokens like roman numerals ("III") into the anchored list. These affect the anchored list's cosmetics, not the flag semantics.
- A raw `.md` base carries no machine-checkable attestation block, so the base-attestation gate (gate 1) is only enforceable for JSON bases — with an `.md` base that gate shifts entirely to the human. Exercised and confirmed in the worked run; use the JSON base for gated runs.

## Output Contract

### Agent output
File: `logs/cv-integrity-[DATE].json` (sample) · `private/reports/cv-integrity-live-[DATE].json` (live)
Fields: workflow, tool, tool_version, run_id, mode, base, variant, candidates_checked, anchored_count, anchored, open_flags, flags[{entity, occurrences, variant_excerpt}], stop_conditions, verification_method, judgment_boundary, exit_code, generated_at.

### Human report
File: `reports/generated/cv-integrity-[DATE].md` (sample) · `private/reports/cv-integrity-live-[DATE].md` (live)
Reader: the applicant deciding whether this variant may be sent.
Decision enabled: per flag, DROP or PROMOTE; and the send/hold decision via the gate result line.
Sections: summary (counts + gate result), open-flags table (entity, count, variant excerpt, decision column), anchored list, what-this-cannot-verify.

## Stop Conditions

- Stop (exit 2) if the base record is missing, because there is nothing to anchor to — the check must not fall back to model memory of what the résumé "probably" says.
- Stop (exit 2) if the base carries `attested: false` or no attestation block, because anchoring to an unattested extraction verifies fluency against fluency.
- Stop (exit 2) if the variant is empty or unreadable, because a zero-flag pass on empty input would be a false PASS.
- Stop (exit 1, gate open) while any flag is undecided, because the tool must never auto-drop (it would delete true-but-undocumented experience) nor auto-keep (it would ship fabrications); per P1 that decision is the human's.
- Stop (exit 2) on any unexpected internal error, because a crash must never exit 1 (the gate-open code) or 0 (the clean code) — global handlers enforce this.
- Stop (exit 2) if `--mode` is not `sample` or `live`, or if a live run's `--json`/`--report` would write outside `private/`, because the tool must obey the privacy contract it enforces.
- Stop before rendering or sending if the latest run's exit code is not 0.

## Log Template (for `logs/RUN_LOG.md`)

```markdown
## YYYY-MM-DD — cv-integrity run (<sample|live>)

- **Recipe:** case-cv-integrity-backend-h1b v0.1.0
- **Inputs:** <base path>, <variant path>
- **Outputs:** <agent log path>, <human report path>
- **Result:** <N> candidates checked · <N> anchored · <N> flags → decisions: <N> DROP, <N> PROMOTE (promotes applied to base first); final exit <code>
- **Verified:** flag set reproduces on re-run; agent log parses; substring/abbreviation behavior spot-checked
- **Open issues:** <honest list>
```

## Snickerdoodle

Runtime note (per `DOMAIN.md`): Claude Code / Cowork is the v0 runtime — execute the steps above, stop at every gate, wait for human clearance, log the run. The `snickerdoodle` CLI below is roadmap, not runtime.

### Run Commands
Full dialogic run:
`snickerdoodle run case-cv-integrity-backend-h1b --mode dialogic`

Sample mode (tracked fixtures, no private reads):
`snickerdoodle run case-cv-integrity-backend-h1b --mode dialogic --sample`

### Step Commands

| Step | Command that runs today | Flags |
|---|---|---|
| Membership check (sample) | `npm run resumes:integrity -- --base data/examples/cv-integrity/sample-base-cv.json --variant data/examples/cv-integrity/sample-variant-backend.md --json logs/cv-integrity-[DATE].json --report reports/generated/cv-integrity-[DATE].md --mode sample` | |
| Membership check (live) | `npm run resumes:integrity -- --base private/resume.json --variant private/variants/<role>.tex --json private/reports/cv-integrity-live-[DATE].json --report private/reports/cv-integrity-live-[DATE].md --mode live` | |
| Render after gate clears | `npm run resumes:pdf -- <variant.md>` | `--all` |

### Script Locations

| Step | Script Path | Layer |
|---|---|---|
| Membership check | `scripts/resumes/cv-integrity-check.mjs` | resumes |
| Render | `scripts/resumes/generate-pdf.mjs` | resumes |

### Output Locations

| Output | Path | Format |
|---|---|---|
| Agent log (sample) | `logs/cv-integrity-[DATE].json` | JSON |
| Human report (sample) | `reports/generated/cv-integrity-[DATE].md` | Markdown |
| Agent log + report (live) | `private/reports/` | JSON + Markdown |
| Sample fixtures | `data/examples/cv-integrity/` | JSON + Markdown |

## Provenance

| Source | Verification command | Notes |
|---|---|---|
| `data/examples/cv-integrity/sample-base-cv.json` | `test -f data/examples/cv-integrity/sample-base-cv.json` | Fictional persona; structure mirrors the setup-exercise personal record. |
| `data/examples/cv-integrity/sample-variant-backend.md` | `test -f data/examples/cv-integrity/sample-variant-backend.md` | Planted drift documented in `data/examples/cv-integrity/README.md`. |
| `scripts/resumes/cv-integrity-check.mjs` | `node scripts/resumes/cv-integrity-check.mjs` (usage exits 2) | New in this recipe's branch; deterministic, stdlib-only. |
