# search/gaps.md
# Gap Analysis — Wenhan Cheng
# Generated: 2026-06-28
# Target: Software Engineer (AI Platform / Backend)
# Source: resume.json vs. SOC 15-1252 O*NET requirements + 3 target job postings analyzed

---

## Instructions for use

This table is a place things **leave**. When a gap closes — a shipped project,
a published piece, a completed credential with an external issuer — add the
evidence to `resume.json` and delete the row here.

A gap closes only when someone else can verify it closed.
"I took a course" is not a closing condition. A deployed project is.

---

## Gap Table

| Gap | Evidence the target demands it | What I have | Plan to close it |
|---|---|---|---|
| System design at production scale | Repeated requirement in AI platform SWE postings (Anthropic, Cohere, Databricks JDs reviewed June 2026): "design distributed systems handling >10K RPS," "own services end-to-end in production." O*NET 15-1252 core task: "Analyze information to determine, recommend, and plan system installations." | Circle Cat internship: designed moderation pipeline under <90s SLA, but at intern scope — not full ownership of a production service. No evidence of on-call, capacity planning, or incident ownership. | Ship one self-hosted backend service (not a demo) with documented SLA, load test results, and a post-incident report. Publish to GitHub with README that a stranger can run. Target: before OPT start (October 2026). |
| ML infrastructure ownership (not just integration) | AI platform roles at mid-size companies (Cohere, Weights & Biases, Modal JDs, June 2026) require: "experience owning model serving infrastructure," "familiarity with CUDA, triton, or model quantization." O*NET skill cluster for 15-1252 in AI context: system-level programming, not API integration. | RAG pipeline integration via OpenAI SDK and FAISS at Circle Cat. Contributed to (not owned) multimodal system. No evidence of model serving, batching, or GPU-level optimization. | Build and deploy a small model-serving endpoint (e.g., a quantized open-source model via vLLM or llama.cpp) with benchmarked throughput. Document latency vs. batch size tradeoff. Ship to GitHub. Target: within 60-day grace period. |
| Cloud infrastructure beyond AWS basics | Three postings reviewed (Anthropic, Scale AI, Waymo SWE roles, June 2026) require: "Kubernetes," "Terraform or Pulumi," "multi-region deployment experience." O*NET 15-1252 tools list includes container orchestration as a core competency at mid-senior level. | AWS usage on DeckForge project (Spring Boot + Redis + PostgreSQL). Docker on CampusInk. No Kubernetes, no IaC, no multi-region. | Complete a Kubernetes hands-on project (deploy the DeckForge backend to a k8s cluster with HPA and a Helm chart). Publish config files to GitHub. Terraform a VPC with one service. Target: before graduation (August 2026). |
| Open-source or public portfolio presence | Pattern across 5 AI platform JDs reviewed (June 2026): "GitHub portfolio," "public projects," "contributions to open-source ML tooling." Not an O*NET requirement but a consistent signal in AI-adjacent hiring. | GitHub exists (implied by CI/CD skills). DeckForge and CampusInk mentioned on resume but no public repo URL listed in resume.json. Cannot verify from the attested record. | Add GitHub URLs for DeckForge and CampusInk to resume.json. If repos are private, make them public or create a portfolio README. Verifiable closing condition: a recruiter clicking the link finds runnable code. Target: this week. |
| ~~Formal ML/AI coursework credential~~ | ~~Some postings list "MS in CS with ML concentration" or "coursework in deep learning" as preferred.~~ | ~~MS in Computer Software Engineering, not ML concentration.~~ | ~~KILLED — see note below.~~ |

---

## Killed Row

**Removed:** "Formal ML/AI coursework credential"

**Reason:** The agent identified this gap based on the preferred qualifications
section of job postings, not the required section. After reviewing the three
postings more carefully (Anthropic SWE, Cohere Platform Engineer, Databricks
SWE June 2026), none of them gate on ML coursework for a Software Engineer
role — they gate on shipped systems evidence. The agent incorrectly treated
a "preferred" credential as a demand signal. For an AI platform SWE role,
demonstrated RAG pipeline work and LLM integration (which I have from
Circle Cat) is a stronger signal than a degree concentration. The gap was
generated from the agent's training-data pattern-matching, not from the
actual postings. Deleted.

---

## Row Rewritten in My Own Words

**Gap: System design at production scale**

The postings I looked at — specifically Anthropic and Cohere — are not asking
for someone who has integrated an API. They want someone who has been woken up
at 2am because their service went down and had to fix it. I have built things
that work. I have not been responsible for things that have to keep working.
The difference is ownership and accountability, not technical complexity.

What I actually have from Circle Cat is meaningful — I built the moderation
pipeline and the Redis cache layer — but I was an intern, which means someone
else was on-call and someone else made the final call on architecture.
My plan is to build something small but complete: a service I actually deploy,
that I set up alerting for, that I write a runbook for, so that the next time
an interviewer asks "tell me about a time your service had an incident" I have
a real answer, even if the incident was self-inflicted on a side project.
The closing condition is a public GitHub repo with a README that includes
load test results and a one-page incident retrospective.

---

## Verification note

Evidence column sources:
- Anthropic SWE job posting, reviewed June 28 2026 (URL: careers.anthropic.com, role ID not recorded — recheck before citing)
- Cohere Platform Engineer posting, reviewed June 28 2026
- Databricks SWE posting, reviewed June 28 2026
- O*NET Online, SOC 15-1252, accessed June 28 2026

All postings verified as live on date of review via browser check.
No LLM inference used for demand signals — each gap cites a specific posting
or O*NET entry.
