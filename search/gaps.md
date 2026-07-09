# Gaps — Current Record vs. Target Role

Target role (from `profile.yml`): AI/agentic product manager at an
early-stage (seed / Series A) startup building AI agent or automation-driven
products.

| Gap | Evidence the target demands it | What I have | Plan to close it |
|---|---|---|---|
| No formal eval/observability ownership on a production AI surface | KORE1's 2026 AI PM hiring guide states AI PM postings expect candidates to have "owned eval set design" and "been on call for a model surface" — this is listed as a core technical-fluency bar, not a nice-to-have. ([KORE1, 2026 Guide](https://www.kore1.com/how-to-hire-ai-product-manager-2026/)) | At Avo and McKinsey I led roadmap/discovery for AI-enabled features, including the McKinsey analytics agent (resume.json), but I never owned a standing eval framework or held on-call responsibility for a deployed model. | Ship a public eval harness for one of my existing agent projects (Nourish Agent) — define a golden test set, automate scoring, and publish the eval results and methodology as a write-up. Closes when the eval repo + write-up are public and linkable, not when I've "read about evals." |
| No demonstrated fluency with a named model-gateway/inference platform stack | KORE1's guide lists "comfort with at least two of OpenAI, Anthropic, Bedrock, Vertex, and an inference platform like Together AI or Modal" as a named technical-fluency expectation for AI PM hires. ([KORE1, 2026 Guide](https://www.kore1.com/how-to-hire-ai-product-manager-2026/)) | My resume shows no named model-gateway or multi-provider inference experience at all — current projects (Nourish Agent, SwiftHire) don't name a specific model stack. | Pick one live project and document the actual model stack in use, naming providers explicitly; if there's no real multi-provider routing yet, build a small one (e.g. route Nourish Agent's calls across two providers) and publish it with a README before claiming this skill. |
| ~~No enterprise-scale (Fortune 500 / regulated industry) AI deployment experience~~ | (No real evidence found — see killed row note below) | — | — |
| No PM experience independently setting pricing or packaging for an AI product | O*NET 11-2021.00 (the SOC code product managers are classified under) lists "develop pricing strategies to maximize profits or market share while satisfying customers" as a primary responsibility area. ([O*NET OnLine, 11-2021.00](https://www.onetonline.org/link/summary/11-2021.00)) | At Avo I "grew the customer base by 33%...shaping pricing and product strategy around what actually moved deals forward" (resume.json) — but this was as a contributor shaping pricing within an existing structure, not as the owner of a product's pricing model end to end. | Take ownership of pricing/packaging for one of my live side projects (e.g. define and publish a real pricing tier structure for SwiftHire or Nourish Agent, including the reasoning) so there's a verifiable artifact showing independent pricing-strategy ownership, not just participation. |

## Killed row

**Killed:** "No enterprise-scale (Fortune 500 / regulated industry) AI deployment experience."

**Why:** The agent generated this gap by inferring that AI PM postings implicitly want enterprise deployment chops, but I went and checked actual early-stage (seed/Series A) AI PM postings (per the KORE1 guide) and none of them list enterprise/regulated-industry deployment as a requirement — that's a pattern from enterprise SaaS PM postings, which is a different target than what I stated in `profile.yml`. I do have a real enterprise data point (McKinsey, a regulated-adjacent consulting environment), so this gap doesn't even apply to my actual record. The agent matched on "AI product manager" generically instead of on my stated target (early-stage, not enterprise).

## Rewritten row (in my own words)

**Original (agent draft):** "No formal eval/observability ownership on a production AI surface — AI PM postings expect eval-set ownership."

**My version:** I've shipped agent systems (Nourish Agent, SwiftHire) and built one internal AI agent at McKinsey, but in every case the model-quality work was a feature inside a larger build, not a thing I owned and can point to on its own. If a hiring manager asked "walk me through an eval framework you designed," I don't have a clean answer — I have fragments across two or three different projects. The fix isn't learning what evals are, it's producing one standalone artifact where the eval design itself is the deliverable, with a public writeup showing the tradeoffs I made and why. Until that exists, this is a real gap, not a paperwork gap.
