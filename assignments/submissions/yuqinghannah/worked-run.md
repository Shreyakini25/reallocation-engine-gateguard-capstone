# Worked Run — ux-designer-sponsor-triage

## Inputs
Real, public company-level data from `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv`
and a real ATS scan against the repo's connected sources. No private/personal
data used.

## Command 1 — `npm run verify`
```
> the-reallocation-engine@1.0.0 verify
> node scripts/conformance.mjs && node scripts/manifest-check.mjs

conformance: 131 files (75 md, 30 py, 23 js, 1 sh, 1 yaml, 1 json)
X 32 file(s) FAILED conformance:
  - scripts\ats\analyze-patterns.py — failed
  - scripts\ats\detect-ats.py — failed
  - scripts\ats\scrapers\common\config.py — failed
  ... (29 more, mostly scripts\ats\* and scripts\sec\*, plus metadata.yaml)
```
**Verified:** the 131-file and 32-failure counts, direct tool output.
**Inferred:** that this is the repo's baseline state rather than something I
broke — not independently confirmed against a second clean clone.

## Command 2 — `npm run ats:scan -- --dry-run` (real failure, then fix)
First attempt:
```
Error: portals.yml not found. Run onboarding first.
```
No onboarding script exists in `package.json` to generate it. Resolved
manually by copying the example config:
```
Copy-Item data\ats\portals.example.yml data\ats\portals.yml
```
Second attempt (real output):
```
+ Databricks | Sr. Forward Deployed Engineer - Communications, Media, Entertainment | United States
+ Databricks | Sr. Manager, Field Engineering - Digital Native Business | Colorado; Remote
+ Databricks | Sr. Solutions Architect - AI Natives Business | Remote - California; Remote - Oregon
... (full list in worked-run-ats-scan.txt)
(dry run – run without --dry-run to save results)
```
**Verified:** the scan runs, hits a real ATS-connected source, returns real,
dated postings. **Inferred:** nothing — this is the tool's raw scrape result.

## Command 3 — H-1B sponsorship title search
```
Select-String -Path data\80-days-to-stay\data\SEC_DOL_H1b_data_mapped.csv `
  -Pattern "Designer" | Measure-Object | Select-Object Count

Count
-----
   68
```
Sample matches:
```
ASANA INC ... Series C ... [..., 'Product Designer', ..., 'Senior Director of Product Design']
BRIGHTCOVE INC ... Pre-Seed ... ['Senior UX Designer']
CHECKR INC ... Series D+ ... ['Senior Product Designer', ...]
```
**Verified:** 68 is a real regex match count from the real file.
**Inferred:** that all 68 are genuine designer-role sponsorships — not
row-by-row audited (see break attempt below and Failure Mode 2 in the
Domain Justification).

## Attestation
- Recipe: ux-designer-sponsor-triage v0.2.1
- By: Yuqing Huang · 2026-07-19

### Tested
| Ran | Saw | Expected |
|---|---|---|
| `npm run verify` | 32/131 files fail conformance | some pass/fail split |
| `npm run ats:scan -- --dry-run` (1st) | `portals.yml not found` error | either success or a clear config error |
| `npm run ats:scan -- --dry-run` (2nd, after copying example config) | real Databricks postings returned | real postings returned |
| Break attempt: extracted `website` field for all 68 "Designer" matches, checked for unrelated-industry noise | ~65 distinct, all recognizable tech/software domains (figma.com, asana.com, squarespace.com, etc.), no obvious false-positive industries | expected some noise given blunt substring match; found none at the domain level |

### Did not test
- Whether the 68 matched titles are precisely "Product Designer"/"UX
  Designer" vs. adjacent titles like "Design Manager" — not audited row by row.
- Whether `ats:liveness` correctly flags a genuinely dead posting (only ran
  the scan, not the liveness gate, against a live URL).

### Broke during testing, fixed
- `ats:scan --dry-run` failed on missing `data/ats/portals.yml`; fixed by
  copying `data/ats/portals.example.yml` to `data/ats/portals.yml`.

## Reflection
**What went well:** the H-1B title-match approach works with zero new code —
`top_job_titles_sponsored` is already structured enough for a direct text
search, and the ATS scan hit a real, live data source on the first configured
attempt.
**What the mode got wrong / missed:** the title match is too blunt to
distinguish design ICs from design-adjacent management titles, and I haven't
yet joined the ATS scan output to the H-1B company list — right now that's a
manual cross-reference, which doesn't scale past a handful of companies.
**Next steps:** build the `title-match.py` script proposed in the mode file,
and prioritize the company-name join between the Job-Ops and 80 Days layers
next, since that removes the most manual effort per run.
