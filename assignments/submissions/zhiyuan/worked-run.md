# Worked Run — AI-Washing Reverse-Filter Triage (2026-07-20, sample mode)

Canonical source: `recipes/case-ds-opt-ai-washing-triage.md` (Worked Run + Attestation sections).
This is the submission / presentation writeup. All numbers are copied from the real run — no
invented figures.

## The filter (the whole idea, in two lines)

```bash
grep -iE "data|ai|machine learning|ml|scientist|engineer" <titles> \
  | grep -ivE "manager|director|sales|solutions|security|marketing|account|resident|field"
```

Keep the technical signal, subtract the AI-washing signal. Everything else in the recipe is the
repo's format contract (frontmatter, gates, dual output, attestation) around this core.

## Real run: error → diagnosis → fix → success

**1. Before config — real error:**
```
$ npm run ats:scan -- --dry-run
Error: portals.yml not found. Run onboarding first.
```
Diagnosis: `scripts/ats/scan.mjs:41` resolves `data/ats/portals.yml`; it didn't exist.
Fix: `cp data/ats/portals.example.yml data/ats/portals.yml` (Databricks enabled, public URL, gitignored).

**2. After config — sample run completes:**
```
Portal Scan — 2026-07-20
Companies scanned:     1
Total jobs found:      787
Filtered by title:     330 removed
Filtered by location:  396 removed
Duplicates:            3 skipped
New offers added:      58
```

**3. The finding (AI-washing, live):** of the 58 offers, the majority were washed —
"Product Marketing Director, Lakewatch", "Strategic Genie and AI Sales Specialist",
"Sr. Solutions Architect - AI Natives", "Sales Dev AI Program Manager". **Zero** unambiguous IC
`Data Scientist` / `ML Engineer` / `Data Engineer` titles. Skip is success; a high skip rate is the healthy result.

**4. H-1B evidence join (real CSV row):**
```
Databricks → DATABRICKS INC : 1640 approvals / 8 denials / 99.51% rate / $149,422.50 median
sponsored titles include: Software Engineer, (Specialist) Solutions Architect, Senior Solutions Engineer
```
Nuance: Databricks *does* sponsor Solutions-titled roles — so Mixed titles go to Manual Review, not Skip.

## Verified vs. inferred

**Verified (script/dataset produced it):** 787 → 330 → 396 → 58 scan funnel; Databricks H-1B row
(1640/8/99.51%/$149,422.50); agent log is valid JSON (`conformance.mjs` ✓); the error + fix transcript.

**Inferred (model judgment over title strings, no JD read):** every Target/Mixed/Skip label; the
"Manual Review" call on the two Mixed rows; SOC codes (title-inferred, no SOC join run); the
qualitative "overwhelmingly go-to-market" reading of 50 titles.

## Reflection

- **Worked:** the reverse filter surfaced the AI-washing pattern on the first dry run, with only
  the existing scanner + two `grep` lines. No new script was required for a sample run.
- **Blind spot:** literal substring matching catches *obvious* washing, not *euphemistic* washing.
  "Professional Services Data Engineer" or "Customer Engineering" slip past the negative list and
  would wrongly reach Target — the recipe's known false-negative surface.
- **Next:** build `scripts/ats/ai-washing-triage.mjs` (the open `[TODO: DEV]`) so classification +
  fuzzy H-1B join are reproducible and testable, and widen `portals.yml` past one company.

## Attestation (agent, sample mode — human sign-off pending)

**Tested:** the four commands above, all with observed = expected.
**Deliberate break:** ran `npm run doctor` — it reported CRLF recipes as "missing frontmatter."
Root cause: `scripts/doctor.mjs:80` splits on `\n` and matches `(.*)$`, but JS `.` doesn't match
the trailing `\r` on CRLF lines, so every frontmatter key but the last is dropped. **Fix applied:**
this recipe is written with LF endings, so doctor reads `status: RUNNABLE-SAMPLE`, `todos_open: 3`
correctly. (Root-cause parser fix left to the repo owners.)
**Did not test:** live scan (held at approval gate), the unbuilt automation script, SOC/BLS join,
companies other than Databricks; minor environment notes (python3 Store shim; bls `openpyxl` dep;
analyze-patterns ran clean) not pursued.
