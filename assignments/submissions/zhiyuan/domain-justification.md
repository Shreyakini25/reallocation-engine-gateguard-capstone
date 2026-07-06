# Domain Justification — AI-Washing Reverse-Filter Triage

**Recipe:** `recipes/case-ds-opt-ai-washing-triage.md`
**Domain:** The Reallocation Engine — evidence-first job search for international students.

## Who uses it, and when

An international Master's student in Data Science / ML / AI / Analytics, on OPT or STEM OPT,
with a hard clock: a fixed number of unemployment days and a fixed number of applications they
can realistically tailor. They open a company's careers board, see a wall of "AI", "ML", and
"Data" titles, and have to decide — in minutes — which are worth an application and which are a
trap. This recipe runs at exactly that moment: after the ATS scan surfaces the postings, before
the student spends effort on them.

## The specific information asymmetry: AI-washing

The employer controls the job title, and the title is cheap to inflate. Attaching "AI" or
"ML" to a sales, solutions, marketing, or management role costs the employer nothing and widens
their applicant pool. The cost of *decoding* the title falls entirely on the student — who is
the party least equipped to pay it, because they lack the industry context to know that, at a
software vendor, "Solutions Architect — AI/ML" is customer-facing pre-sales, not model-building.

The asymmetry is concrete and measurable. In this recipe's sample run, Databricks' board
returned 50 offers after filtering; the great majority were Solutions / Manager / Sales /
Marketing / Security / Field roles wearing an AI/ML/Data label, and **zero** were unambiguous
individual-contributor Data/AI titles. The student who trusts the titles applies to a dozen
"AI" roles that were never IC data-science roles, and burns OPT days doing it.

## How it connects the engine's layers

The recipe is only useful because it crosses three layers that are individually blind:

1. **Job-Ops layer (ATS scan, `npm run ats:scan`)** — finds the live postings and their titles.
   Alone, it cannot tell a real Data/AI role from a washed one; the title is all it has.
2. **80 Days to Stay layer (SEC/DOL H-1B, `SEC_DOL_H1b_data_mapped.csv`)** — company-level
   sponsorship history. Alone, it says whether a *company* sponsors, never whether *this role* is
   real or washed.
3. **Cognitive Pivot layer (BLS/O*NET SOC role quality)** — what the role family actually is.
   Alone, it needs a role to classify; it doesn't know which postings exist.

The reverse filter is the join: it takes the Job-Ops titles, strips the washed ones, and only
then asks the 80 Days layer for sponsorship evidence and the Cognitive Pivot layer for role
quality. Liveness and sponsorship are gates, not votes — Skip is the expected, healthy outcome.

## Domain-specific failure modes

### 1. The Solutions trap — false positive

**Error form.** A title like "Specialist Solutions Architect — AI/ML" reads technical, and the
H-1B layer *confirms* the company sponsors "Solutions Architect" titles. A naive filter marks it
Investigate. But the role is pre-sales / delivery consulting, not IC data science. The two
signals the engine trusts most (technical-sounding title + real sponsorship history) both fire —
and both are wrong for this student's goal.

**Who is hardest to catch it.** The student themselves. They see an engineering noun, an "AI/ML"
tag, and a green sponsorship record, and have no way to know that "Solutions" at a vendor means
customer-facing. This is why the recipe routes Mixed titles to **Manual Review**, not Investigate —
the false positive is invisible from the title alone and must be caught by reading the JD.

### 2. The Series A penalty — false negative

**Error form.** A genuine IC Data/AI role at an early-stage (Series A) startup has no H-1B
history — not because the company won't sponsor, but because it is too young to have filed an
LCA yet. The recipe's company-level H-1B layer returns "No H-1B evidence found," and a naive
rule reads that as Skip. A real opportunity is dropped because absence of evidence is mistaken
for evidence of absence.

**Who is hardest to catch it.** Again the student, compounded by a structural blind spot: the
80 Days layer *cannot* see a company that hasn't filed, so the miss looks like a confident,
data-backed Skip rather than a gap. This is the failure mode the recipe is most likely to commit
and the one a human reviewer must specifically watch for on young, well-funded companies.
