# cv-integrity sample fixtures

Sample data for `recipes/case-cv-integrity-backend-h1b.md` (fictional persona — structure and bullet shapes adapted from the author's record with identifiers, names, and employers removed; real records live in `private/` and are never committed).

| File | Role in the sample run |
|---|---|
| `sample-base-cv.json` | The attested base record (source of truth). Contains "mean time to detection" (so the `MTTD` abbreviation anchors) and "dashboards" (the `rds` substring trap: a substring match would falsely anchor a fabricated `RDS`; word-boundary matching must not). |
| `sample-variant-backend.md` | LLM-tailored variant with planted drift: true-but-undocumented AWS service expansion (`EC2, S3, Lambda, RDS, CloudWatch`), `Cloud SQL`, a JD-pulled tool (`Kafka`), and one outright fabrication (`etcd` — a plausible one-character neighbor of ordinary prose like "etc.", caught here because it is absent from the base). Expected: **8 open flags, exit 1**. |
| `sample-variant-clean.md` | Faithful re-emphasis-only variant. Expected: **0 open flags, exit 0**. |

Run:

```bash
npm run resumes:integrity -- \
  --base data/examples/cv-integrity/sample-base-cv.json \
  --variant data/examples/cv-integrity/sample-variant-backend.md \
  --json logs/cv-integrity-<date>.json \
  --report reports/generated/cv-integrity-<date>.md \
  --mode sample
```
