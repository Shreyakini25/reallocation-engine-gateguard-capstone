#!/usr/bin/env python3
"""
jd-skill-extractor.py — Extracts skills from live DE/DA job descriptions at verified H-1B sponsors.

This is the core extraction engine for case-de-da-live-skill-gap.
skill-gap-master.py calls this module to get skill data, then combines it
with company H-1B/funding data and writes the Excel report.

What it does:
  1. Filters 80-days CSV to verified H-1B sponsors for DE/DA roles
  2. Fetches live job listings from Greenhouse and Lever public APIs
  3. For each DE/DA role, extracts skills from BOTH:
       - Job title  (e.g. "Senior dbt Engineer")
       - Job description body (e.g. "experience with Airflow preferred")
  4. Counts skill frequency across all companies
  5. Assigns each skill a cognitive demand tier from BLS O*NET mapping

Greenhouse:
  - List endpoint: GET /v1/boards/{slug}/jobs        -> titles only
  - Detail endpoint: GET /v1/boards/{slug}/jobs/{id} -> full description
  - We call detail endpoint for each DE/DA job to get description text

Lever:
  - Single endpoint: GET /v0/postings/{slug}?mode=json
  - Returns descriptionPlain in the same call — no second request needed

Prime directive (SNICKERDOODLE.md):
  Use verified local data first. LLM not used anywhere here.
  All skill classifications are from a static human-curated mapping.

Author: Komal Pravinkumar
"""

from __future__ import annotations

import re
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Any

import pandas as pd
import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
CSV_PATH  = REPO_ROOT / "data" / "80-days-to-stay" / "80-days-csv" / "mapped_student_employment_targets_v3.csv"

# ---------------------------------------------------------------------------
# DE/DA role detection
# ---------------------------------------------------------------------------
DE_DA_KEYWORDS = [
    "data engineer", "data analyst", "analytics engineer",
    "data platform", "data pipeline", "data architect",
    "dataops", "data ops", "analytics",
]

# ---------------------------------------------------------------------------
# Skill keyword dictionary
# Scanned against BOTH job title AND description body
# Sourced from manual review of DE/DA job postings — not LLM generated
# ---------------------------------------------------------------------------
SKILL_PATTERNS: dict[str, list[str]] = {
    "SQL":        ["sql", "mysql", "postgres", "postgresql"],
    "Python":     ["python"],
    "Spark":      ["spark", "pyspark", "apache spark"],
    "dbt":        ["dbt", "data build tool"],
    "Airflow":    ["airflow", "apache airflow"],
    "Snowflake":  ["snowflake"],
    "Kafka":      ["kafka", "apache kafka"],
    "AWS":        ["aws", "amazon web services", " s3 ", "aws glue", "athena", " emr"],
    "Azure":      ["azure", "synapse", "azure data factory", " adf "],
    "GCP":        ["gcp", "google cloud", "bigquery", "dataflow", "cloud composer"],
    "Databricks": ["databricks", "delta lake", "delta table"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Docker":     ["docker", "containeriz"],
    "Terraform":  ["terraform", "infrastructure as code"],
    "Tableau":    ["tableau"],
    "Power BI":   ["power bi", "powerbi"],
    "Looker":     ["looker", "lookml"],
    "Scala":      ["scala"],
    "Java":       [" java ", "java,", "java."],
    "Golang":     ["golang", " go,", " go."],
    "Redshift":   ["redshift"],
    "BigQuery":   ["bigquery"],
    "DBT Cloud":  ["dbt cloud"],
    "Flink":      ["flink", "apache flink"],
    "Fivetran":   ["fivetran"],
    "Stitch":     ["stitch data", "stitchdata"],
}

# ---------------------------------------------------------------------------
# Cognitive demand tier
# Based on BLS O*NET skill elements for SOC 15-1242 (Database Architects)
# HIGH  = systems design, causal reasoning, architecture judgment
# MED   = important but increasingly AI-augmented
# LOW   = execution-oriented, high automation substitution risk
# ---------------------------------------------------------------------------
COGNITIVE_TIER: dict[str, str] = {
    "SQL":        "MED",
    "Python":     "HIGH",
    "Spark":      "HIGH",
    "dbt":        "HIGH",
    "Airflow":    "HIGH",
    "Snowflake":  "MED",
    "Kafka":      "HIGH",
    "AWS":        "HIGH",
    "Azure":      "HIGH",
    "GCP":        "HIGH",
    "Databricks": "HIGH",
    "Kubernetes": "HIGH",
    "Docker":     "MED",
    "Terraform":  "HIGH",
    "Tableau":    "LOW",
    "Power BI":   "LOW",
    "Looker":     "MED",
    "Scala":      "HIGH",
    "Java":       "MED",
    "Golang":     "HIGH",
    "Redshift":   "MED",
    "BigQuery":   "MED",
    "DBT Cloud":  "HIGH",
    "Flink":      "HIGH",
    "Fivetran":   "LOW",
    "Stitch":     "LOW",
}

# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
HEADERS = {
    "User-Agent": (
        "80DaysToStay-SkillScanner/1.0 "
        "(+https://github.com/nikbearbrown/the-reallocation-engine; research)"
    )
}
REQUEST_TIMEOUT = 10
REQUEST_DELAY   = 0.5


def get_json(url: str) -> Any:
    """GET url, return parsed JSON or None."""
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Greenhouse fetcher
# Two-step: list endpoint for job IDs, detail endpoint for descriptions
# ---------------------------------------------------------------------------

def fetch_greenhouse(slug: str) -> list[dict]:
    """
    Fetch DE/DA jobs from Greenhouse with full description text.

    Step 1 — list endpoint: get all job titles and IDs
    Step 2 — detail endpoint per DE/DA job: get description body

    Returns list of dicts with keys: title, description, url, job_id
    """
    list_url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs"
    data = get_json(list_url)
    if not isinstance(data, dict):
        return []

    all_jobs = data.get("jobs", [])
    de_da_jobs = [j for j in all_jobs if is_de_da(str(j.get("title", "")))]

    results = []
    for job in de_da_jobs:
        job_id    = job.get("id", "")
        title     = str(job.get("title", ""))
        apply_url = str(job.get("absolute_url", ""))

        # Fetch full description from detail endpoint
        description = ""
        if job_id:
            detail_url  = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs/{job_id}"
            detail_data = get_json(detail_url)
            time.sleep(REQUEST_DELAY)
            if isinstance(detail_data, dict):
                description = str(detail_data.get("content", "") or "")

        results.append({
            "title":       title,
            "description": description,
            "url":         apply_url,
            "job_id":      str(job_id),
            "ats":         "greenhouse",
        })

    return results


# ---------------------------------------------------------------------------
# Lever fetcher
# Single endpoint returns descriptionPlain — no second call needed
# ---------------------------------------------------------------------------

def fetch_lever(slug: str) -> list[dict]:
    """
    Fetch DE/DA jobs from Lever with full description text.
    descriptionPlain comes in the same API response — no extra call needed.

    Returns list of dicts with keys: title, description, url, job_id
    """
    url  = f"https://api.lever.co/v0/postings/{slug}?mode=json"
    data = get_json(url)
    if not isinstance(data, list):
        return []

    results = []
    for job in data:
        title = str(job.get("text", ""))
        if not is_de_da(title):
            continue
        results.append({
            "title":       title,
            "description": str(job.get("descriptionPlain", "") or ""),
            "url":         str(job.get("hostedUrl", "")),
            "job_id":      str(job.get("id", "")),
            "ats":         "lever",
        })

    return results


# ---------------------------------------------------------------------------
# Skill extraction — scans BOTH title and description
# ---------------------------------------------------------------------------

def is_de_da(title: str) -> bool:
    """Return True if the job title is a DE/DA role."""
    t = title.lower()
    return any(kw in t for kw in DE_DA_KEYWORDS)


def extract_skills(title: str, description: str = "") -> list[str]:
    """
    Extract skill names from job title AND description body.

    Scans both fields so skills mentioned only in the description
    (e.g. 'experience with dbt preferred') are captured.

    Returns deduplicated list of matched skill names.
    """
    combined = (title + " " + description).lower()
    found = []
    for skill, patterns in SKILL_PATTERNS.items():
        if any(pat in combined for pat in patterns):
            found.append(skill)
    return found


# ---------------------------------------------------------------------------
# Company slug normalization (mirrors scrapers/common/normalize.py)
# ---------------------------------------------------------------------------

def to_slug(name: str) -> str:
    suffixes = [
        r",?\s+Ltd\s+Liability\s+Co\.?$", r",?\s+Corporation$", r",?\s+Corp\.?$",
        r",?\s+Company$", r",?\s+Co\.?$", r",?\s+Limited$", r",?\s+Ltd\.?$",
        r",?\s+LTD\.?$", r",?\s+L\.L\.C\.?$", r",?\s+LLC\.?$", r",?\s+Inc\.?$",
        r",?\s+L\.P\.?$", r",?\s+LP\.?$", r",?\s+PLC\.?$",
    ]
    s = name.strip()
    changed = True
    while changed:
        changed = False
        for sfx in suffixes:
            r2 = re.sub(sfx, "", s, flags=re.IGNORECASE)
            if r2 != s:
                s = r2
                changed = True
    return re.sub(r"[,.\s\-&\']", "", s.strip()).lower()


# ---------------------------------------------------------------------------
# CSV loader
# ---------------------------------------------------------------------------

def load_sponsors(min_approvals: int = 50) -> pd.DataFrame:
    """Filter 80-days CSV to verified DE/DA H-1B sponsors."""
    if not CSV_PATH.exists():
        print(f"ERROR: CSV not found at {CSV_PATH}")
        sys.exit(1)

    df = pd.read_csv(CSV_PATH, low_memory=False)
    df["Total Approvals"] = pd.to_numeric(df["Total Approvals"], errors="coerce").fillna(0)

    mask = (
        (df["Total Approvals"] >= min_approvals) &
        (df["top_job_titles_sponsored"].fillna("").str.contains(
            r"data\s+engineer|data\s+analyst|analytics\s+engineer",
            case=False, regex=True, na=False
        ))
    )
    return df[mask][["company_name", "Total Approvals"]].copy()


# ---------------------------------------------------------------------------
# Main extraction function — called by skill-gap-master.py
# ---------------------------------------------------------------------------

def run_extraction(
    companies: list[str],
    dry_run: bool = False,
    verbose: bool = True,
) -> dict[str, Any]:
    """
    Core extraction pipeline. Called by skill-gap-master.py.

    Returns:
      skill_counts    — skill -> total appearances (title + description)
      skill_companies — skill -> list of company names where it appeared
      job_records     — list of all DE/DA jobs found with skills extracted
      scan_log        — per-company result summary
      not_found       — companies with no Greenhouse or Lever board
    """
    skill_counts:    dict[str, int]      = defaultdict(int)
    skill_companies: dict[str, set[str]] = defaultdict(set)
    job_records:     list[dict]          = []
    scan_log:        list[dict]          = []
    not_found:       list[dict]          = []

    total = len(companies)

    for i, company in enumerate(companies, 1):
        slug = to_slug(company)
        if verbose:
            print(f"  [{i}/{total}] {company} ({slug})", end=" ... ")

        if dry_run:
            if verbose:
                print("DRY RUN")
            scan_log.append({
                "company": company, "slug": slug,
                "ats": "dry-run", "de_da_jobs": 0,
                "skills_found": [], "status": "dry-run",
            })
            continue

        # Try Greenhouse first, then Lever
        jobs = fetch_greenhouse(slug)
        ats  = "Greenhouse" if jobs else None

        if not jobs:
            time.sleep(REQUEST_DELAY)
            jobs = fetch_lever(slug)
            ats  = "Lever" if jobs else None

        time.sleep(REQUEST_DELAY)

        skills_this_company: set[str] = set()

        for job in jobs:
            skills = extract_skills(job["title"], job.get("description", ""))
            for skill in skills:
                skill_counts[skill]         += 1
                skill_companies[skill].add(company)
                skills_this_company.add(skill)

            job_records.append({
                "Company":          company,
                "Job Title":        job["title"],
                "ATS":              job["ats"].capitalize(),
                "Skills Detected":  ", ".join(skills) if skills else "None detected",
                "Cognitive Tier":   max(
                    (COGNITIVE_TIER.get(s, "MED") for s in skills),
                    key=lambda t: {"HIGH": 2, "MED": 1, "LOW": 0}.get(t, 0),
                    default="N/A"
                ) if skills else "N/A",
                "Has Description":  "Yes" if job.get("description") else "No",
                "Job URL":          job["url"],
            })

        if verbose:
            if ats:
                print(f"{ats} — {len(jobs)} DE/DA jobs — {len(skills_this_company)} skills")
            else:
                print("not found (Workday/iCIMS/Taleo likely) [TODO]")

        if not ats:
            not_found.append({
                "Company":    company,
                "Slug Tried": slug,
                "Note":       "No Greenhouse or Lever board — may use Workday/iCIMS/Taleo [TODO]",
            })

        scan_log.append({
            "company":      company,
            "slug":         slug,
            "ats":          ats or "not_found",
            "de_da_jobs":   len(jobs),
            "skills_found": sorted(skills_this_company),
            "status":       "ok" if ats else "not_found",
        })

    return {
        "skill_counts":    dict(skill_counts),
        "skill_companies": {k: sorted(v) for k, v in skill_companies.items()},
        "job_records":     job_records,
        "scan_log":        scan_log,
        "not_found":       not_found,
    }


# ---------------------------------------------------------------------------
# Standalone entry point (can run independently of skill-gap-master.py)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse
    import json
    from datetime import datetime, timezone

    OUTPUT_DIR = REPO_ROOT / "data" / "skill-demand"

    parser = argparse.ArgumentParser(
        description="Extract skills from live DE/DA JDs at verified H-1B sponsors."
    )
    parser.add_argument("--dry-run",       action="store_true")
    parser.add_argument("--min-approvals", type=int, default=50)
    parser.add_argument("--top-n",         type=int, default=10)
    args = parser.parse_args()

    print(f"\njd-skill-extractor | {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    print(f"\n[1/2] Loading sponsors from 80-days CSV ...")
    sponsors  = load_sponsors(args.min_approvals)
    companies = sponsors["company_name"].tolist()
    print(f"      {len(companies)} verified DE/DA sponsors found")

    if len(companies) < 5:
        print("STOP: Fewer than 5 sponsors — cannot produce a meaningful ranking.")
        sys.exit(1)

    print(f"\n[2/2] Scanning {'(DRY RUN)' if args.dry_run else '(LIVE)'}...")
    results = run_extraction(companies, dry_run=args.dry_run)

    # Write JSON log
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    log_path = OUTPUT_DIR / "skill_demand_log.json"
    log_path.write_text(
        json.dumps({
            "run_timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run":       args.dry_run,
            "sponsors":      len(companies),
            **results,
        }, indent=2),
        encoding="utf-8"
    )

    if results["skill_counts"] and not args.dry_run:
        print(f"\n--- Top {args.top_n} Skills ---")
        for i, (skill, count) in enumerate(
            sorted(results["skill_counts"].items(), key=lambda x: x[1], reverse=True)[:args.top_n], 1
        ):
            tier  = COGNITIVE_TIER.get(skill, "?")
            cos_n = len(results["skill_companies"].get(skill, []))
            print(f"  {i:2}. {skill:<12} {count:3} appearances  {cos_n:2} companies  [{tier}]")

    print(f"\nLog written to: {log_path}")
    print("Done.")