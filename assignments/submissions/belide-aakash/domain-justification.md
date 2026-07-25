# Domain Justification — SWE-to-AI-Engineer H-1B Title Screen

**Mode:** `case-swe-to-ai-engineer-h1b-title-screen`
**Author:** Aakash Belide · belide.a@northeastern.edu · 2026-06-29

---

## Who uses this and when

This is for a backend or data SWE — someone with real production experience, maybe 2–4 years, who knows Python and has shipped systems but doesn't have ML research publications. They're on F-1 OPT (or getting there soon), which means they have a fixed window — somewhere between 12 and 36 months depending on STEM extension — to land a role at a company that will eventually sponsor H-1B.

The specific trigger to run this recipe: you have a list of companies you're excited about, you've been told they hire ML engineers, but you have no idea whether those ML engineers came from research programs or from engineering backgrounds like yours. You don't want to spend two weeks on a take-home for a company that's only ever hired Stanford PhD researchers into their ML team.

That's the exact situation this mode is built for. Not "find me AI jobs" — that's a search problem. This is a triage problem. You already have a list; you need to rank it.

---

## The information asymmetry this addresses

The core problem: a job posting for "Machine Learning Engineer" looks identical whether the company hires practitioners (SWEs who learned ML on the job) or researchers (people with PhD pedigree who publish papers). The job description, the title, even the interview format — they can all look the same from the outside.

What's not identical is the H-1B petition history. When a company sponsors someone's visa as a "Machine Learning Engineer," they filed formal paperwork with that job title. The DOL/USCIS records that. If you look at a company's `top_job_titles_sponsored` in the 80-days-to-stay dataset, you can see whether their ML hires historically carried practitioner titles ("Machine Learning Engineer," "AI Engineer," "MLOps Engineer") or researcher titles ("Research Scientist," "Applied Scientist," "Senior Research Scientist").

This is not visible from a job posting. You can only see it by looking at the H-1B petition data — which is exactly what the mapped CSV at `data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv` provides.

To put some numbers on it: of the 30,369 companies in the dataset, only 1,557 (5.1%) have H-1B data at all. Of those, 49 have practitioner ML titles and 40 have researcher-only titles. Not a huge number, but it's the right slice. Without this lookup, you're applying to both camps interchangeably; with it, you're not.

---

## How it connects to the engine layers

**80 Days to Stay:** This mode extends the base 80-Days workflow. The standard use is to check whether a company has any H-1B sponsorship history. This mode adds a second question: what did they actually sponsor? The `top_job_titles_sponsored` field is the signal. Combined with `latest_funding_date` and `latest_funding_stage`, you can also check whether a company is still actively funded (a company that last raised in 2015 is a different risk than one that closed a Series C in 2025).

**Job-Ops:** The ATS liveness check is a hard gate in this mode, same as everywhere else in the engine. A practitioner-friendly company with a dead posting is still a skip — no score runs. I ran `npm run ats:liveness` on the Cohere Health posting during the sample run and confirmed it was live before scoring.

**Cognitive Pivot:** The BLS data makes a longer-term case for this transition. SOC 15-1221 (Computer and Information Research Scientists, which maps to "AI Engineer") sits at a `cognitive_pivot_score` of 4.516, compared to 3.834 for SOC 15-1252 (Software Developers). That 0.68 gap matters — AI Engineer work involves system judgment, model evaluation, and debugging emergent behavior, which are harder to automate than the average SWE task. So this isn't only about landing an ML job before OPT runs out. It's about ending up in a role category that's less exposed to the same tooling that's already compressing backend development work.

---

## Failure modes

**Failure Mode 1 — Title inflation blind spot**

The shape of the error: the title screen classifies a company as practitioner-accessible because "Machine Learning Engineer" appears in their H-1B petition history. The candidate applies, gets a screen, and discovers the ML team is entirely composed of PhD researchers and the "MLE" role they're hiring for is feature engineering on a research pipeline, not the production ML systems work the candidate was expecting.

This happened clearly in our sample run. Roblox shows 856 H-1B approvals with "Principal Machine Learning Engineer - Personalization" in their `top_job_titles_sponsored` field — the title-screen classifies them practitioner because the substring "machine learning engineer" matches, and 856 approvals is the strongest single-company practitioner signal in the 30K-row dataset. But when you look at their current job board, every 2026 MLE posting is labeled "PhD Early Career." The H-1B history is real and accurate — those MLEs existed. But it's a lagging indicator. The team structure changed, and the petition history didn't follow in real time.

Who has the hardest time catching this: a candidate without access to alumni networks or internal referrals at the company. A PhD applicant would have ex-lab contacts who could tell them the team culture shifted. A practitioner SWE with no research network has no signal at all unless they read the JDs carefully and notice the "PhD preferred" language — which is often buried or absent entirely.

**Failure Mode 2 — Low-N approval rate misread**

The shape of the error: the title screen flags a company as practitioner-accessible with a 100% H-1B approval rate. The candidate weights this heavily as a strong sponsorship signal. The reality: the company has 2 total H-1B approvals on record. A 100% rate from N=2 is statistically meaningless — it says nothing about whether the company sponsors routinely or whether those two approvals were exceptional cases for specific senior hires.

Zoom Video Communications shows exactly this pattern in our sample: 2 approvals, 100% rate, "Machine Learning Engineer" in title history. The mode flags this with a `low_n_flag` (set when Total Approvals < 10) and downgrades the sponsorship vote to 0.3. But a candidate who sees "100% approval rate" without knowing to check the N would reasonably assume strong sponsorship history.

Who has the hardest time catching this: an international student who isn't familiar with immigration data quality issues. An immigration attorney would immediately recognize that sample size matters for approval rates. A first-time job seeker who learned about the 80-Days dataset through this engine doesn't have that context — they'll trust the percentage at face value.
