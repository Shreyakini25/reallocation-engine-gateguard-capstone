# CV Integrity Report — sample-variant-backend.md

**Generated:** 2026-07-07T01:47:50.671Z · **Mode:** sample · **Tool:** cv-integrity-check v0.1.0
**Base (attested record):** `data/examples/cv-integrity/sample-base-cv.json`
**Variant (LLM-tailored):** `data/examples/cv-integrity/sample-variant-backend.md`

**Reader:** the applicant (you). **Decision enabled:** per flag, DROP (not true — cut it) or PROMOTE (true but missing — add to the base first, regenerate). The variant must not render or ship while any flag is open.

## Summary

| Metric | Value |
|---|---:|
| Candidate entities checked | 73 |
| Anchored (in variant AND base — never flagged) | 22 |
| **Open flags (0 required to pass)** | **8** |
| Gate result | BLOCKED — resolve every flag, then re-run |

## Open flags — present in the variant, zero word-boundary matches in the base

| Entity | Count | Variant line (excerpt) | Your decision |
|---|---:|---|---|
| `Cloud SQL` | 2 | - Built Terraform CI/CD on GCP (Cloud SQL, Pub/Sub) with least-privilege IAM; ran workloads on Kubernetes w... | DROP / PROMOTE |
| `CloudWatch` | 1 | - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker... | DROP / PROMOTE |
| `EC2` | 1 | - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker... | DROP / PROMOTE |
| `etcd` | 1 | - Built Terraform CI/CD on GCP (Cloud SQL, Pub/Sub) with least-privilege IAM; ran workloads on Kubernetes w... | DROP / PROMOTE |
| `Kafka` | 2 | - Engineered a workflows platform on GCP Pub/Sub processing 500K+ events/sec (backpressure, ordering keys, ... | DROP / PROMOTE |
| `Lambda` | 1 | - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker... | DROP / PROMOTE |
| `RDS` | 1 | - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker... | DROP / PROMOTE |
| `S3` | 1 | - Cloud & DevOps: AWS (EC2, S3, Lambda, RDS, CloudWatch), GCP (Cloud SQL, IAM, Pub/Sub), Kubernetes, Docker... | DROP / PROMOTE |

## Anchored (for the record)

`AWS` · `ClickHouse` · `Docker` · `GCP` · `GitHub` · `GitHub Actions` · `Go` · `Grafana` · `IAM` · `III` · `Java` · `Kubernetes` · `MongoDB` · `MTTD` · `OpenTelemetry` · `PostgreSQL` · `Pub/Sub` · `Python` · `Redis` · `SQL` · `Terraform` · `TypeScript`

## What this check cannot verify

- Meaning drift in reworded lines ("contributed to" → "led") — allowed by design, human-judged.
- Whether a PROMOTE decision is honest — the check trusts the attested base and your answer.
- A novel tool absent from the dictionary and not acronym/CamelCase-shaped (coverage boundary).
