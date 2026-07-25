#!/usr/bin/env node
// allocate.mjs - the Application-Effort Reallocation Engine.
//
// Domain anchor: INFO 7375 "Build a Useful Tool That Doubts Itself." Reallocates
// a scarce resource - a candidate's finite OPT/application effort (a fixed
// number of "slots" they can realistically pursue) - away from companies with
// weak or PhD-gated evidence and toward companies with a practitioner-accessible
// H-1B sponsorship record, a live posting, and a healthy composite score.
//
// THIS SCRIPT DOES NOT REIMPLEMENT SCORING. Per SNICKERDOODLE P2/P6 ("verified
// scripts before ad-hoc code"), it reuses this repo's existing, already-audited
// scorer verbatim: scripts/score/role-scorer.mjs (the Ch.11 Bayesian Role
// Scorer). This script's job is upstream (turn CSV rows into evidence-with-
// uncertainty) and downstream (turn a ranked composite list into a concrete
// reallocation of a finite slot budget) of that scorer.
//
// Objective (state it plainly, and what it leaves out):
//   Optimizes: expected practitioner-accessible, live, sponsorship-likely
//   interviews PER APPLICATION SLOT SPENT.
//   Leaves out: actual candidate fit beyond a model-judgment guess, the
//   TEAM'S CURRENT composition (title history lags 2-3 years), referral
//   access, compensation, culture - and, per the Component 5 causal audit,
//   it optimizes an OBSERVATIONAL correlation, not a proven interventional
//   effect of applying there.
//
// Usage:
//   node scripts/reallocate/allocate.mjs <candidates.json> [--slots N] [--out-dir dir]
//
// candidates.json shape: { "slot_budget": 5, "companies": [ { "name": "...",
//   "target_soc": "15-1221", "posting_url": "...", "liveness": "live|dead|unchecked" } ] }

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const H1B_CSV = path.join(REPO_ROOT, 'data/80-days-to-stay/data/SEC_DOL_H1b_data_mapped.csv');
const BLS_CSV = path.join(REPO_ROOT, 'data/bls/compact/soc_occupation_compact.csv');
const ROLE_SCORER = path.join(REPO_ROOT, 'scripts/score/role-scorer.mjs');

// ───────────────────────────────────────────────────────────────────────────
// GIGO GATE (Component 2). A company is scoreable only if it clears this.
// Each clause is independently checkable by a human against the raw CSV row.
// ───────────────────────────────────────────────────────────────────────────
const GIGO_GATE = {
  min_total_approvals: 5, // below this, Approval_Rate is statistical noise (an N=2 company reading 100% is not a signal)
  require_title_field: true, // top_job_titles_sponsored must be present
};

// title-pattern classification (practitioner vs. researcher; see Ch.11/mode doc)
const PRACTITIONER_PATTERNS = ['machine learning engineer', 'ml engineer', 'ai engineer', 'mlops', 'applied ml', 'ai platform', 'software engineer (machine learning)'];
const RESEARCHER_PATTERNS = ['research scientist', 'applied scientist', 'research engineer', 'senior research scientist', 'principal scientist', 'staff research'];

const DEFAULT_SOC = '15-1252'; // Software Developers / AI Specialist alt-title - the SWE-to-AI landing zone

// ── tiny CSV parser (no deps; handles quoted fields with embedded commas) ──
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows[0];
  return rows.slice(1).filter((r) => r.length === header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

function loadH1B() {
  const text = fs.readFileSync(H1B_CSV, 'utf8');
  return parseCSV(text);
}

function loadBLS() {
  const text = fs.readFileSync(BLS_CSV, 'utf8');
  return parseCSV(text);
}

function findCompanyRow(h1bRows, name) {
  const target = name.trim().toUpperCase();
  return h1bRows.find((r) => (r.company_name || '').trim().toUpperCase() === target) || null;
}

function classifyTitles(titleField) {
  const t = (titleField || '').toLowerCase();
  const p = PRACTITIONER_PATTERNS.filter((pat) => t.includes(pat));
  const r = RESEARCHER_PATTERNS.filter((pat) => t.includes(pat));
  if (p.length && r.length) return { classification: 'hybrid', practitioner_titles: p, researcher_titles: r };
  if (p.length) return { classification: 'practitioner', practitioner_titles: p, researcher_titles: r };
  if (r.length) return { classification: 'researcher-only', practitioner_titles: p, researcher_titles: r };
  return { classification: 'no-data', practitioner_titles: p, researcher_titles: r };
}

// ───────────────────────────────────────────────────────────────────────────
// UNCERTAINTY (Component 1/8): Beta-Binomial shrinkage on the approval rate.
// A raw Approval_Rate at N=2 is a point estimate with huge variance. We shrink
// toward the dataset-wide rate with a weak prior (equivalent sample size k=10)
// and report BOTH the shrunk posterior mean AND a 90% credible interval width
// - this IS the uncertainty attached to the sponsorship vote, not a add-on.
// Prior source: computed once from the full CSV (see FACTCHECK note in report).
// ───────────────────────────────────────────────────────────────────────────
const GLOBAL_PRIOR_RATE = 0.9812; // computed 2026-07-20: 126514 approvals / 128932 (approvals+denials) across all 1557 H1B-bearing rows
const PRIOR_K = 10; // equivalent sample size of the prior - deliberately weak so N>=30 companies are barely shrunk

// Confidence tiers are ABSOLUTE sample-size bands, deliberately independent of
// GIGO_GATE.min_total_approvals. Found during adversarial testing (Component 6):
// an earlier version computed the tier AS A MULTIPLE of the gate's own
// threshold, so lowering that config value silently relabeled a low-N company
// (e.g. N=2) as "medium confidence" too - the confidence label changed meaning
// without the underlying sample size changing at all. Fixed by fixing the
// bands to real N thresholds, not a function of gate config.
const CONFIDENCE_BANDS = { low_max: 4, medium_max: 14 }; // n<=4 low, 5-14 medium, >=15 high

// FIT_CONC - the equivalent sample size of the model-judgment `fit` prior. The
// fit vote is a CRUDE guess derived from title classification alone (no résumé-
// to-JD matcher), so its uncertainty is large and DELIBERATELY modelled, not
// hidden. Beta(fit·K, (1-fit)·K) with K=9 gives sd≈0.14 at fit=0.75 - i.e. "we
// think fit is ~0.75 but would not be surprised by 0.6 or 0.9." This is the
// dominant uncertainty in the composite; propagating it (Component 1/8) is why
// the composite band below is wide even though the sponsorship rate is precise.
const FIT_CONC = 9;
const MC_SAMPLES = 20000;
const MC_SEED = 0x9e3779b9; // fixed → the whole run is reproducible (no wall-clock/rand entropy)

function betaBinomialShrink(approvals, denials) {
  const n = approvals + denials;
  const alpha0 = GLOBAL_PRIOR_RATE * PRIOR_K;
  const beta0 = (1 - GLOBAL_PRIOR_RATE) * PRIOR_K;
  const alphaPost = alpha0 + approvals;
  const betaPost = beta0 + denials;
  const mean = alphaPost / (alphaPost + betaPost);
  // variance of a Beta(a,b): a*b / ((a+b)^2 * (a+b+1)) - used as an uncertainty proxy, not a full interval
  const variance = (alphaPost * betaPost) / (((alphaPost + betaPost) ** 2) * (alphaPost + betaPost + 1));
  const sd = Math.sqrt(variance);
  const ci90_half = 1.645 * sd; // normal approx around the Beta posterior - labeled as an approximation
  return {
    n,
    alphaPost, betaPost,
    raw_rate: n > 0 ? approvals / n : null,
    shrunk_mean: Number(mean.toFixed(4)),
    ci90_low: Number(Math.max(0, mean - ci90_half).toFixed(4)),
    ci90_high: Number(Math.min(1, mean + ci90_half).toFixed(4)),
    confidence_tier: n > CONFIDENCE_BANDS.medium_max ? 'high' : n > CONFIDENCE_BANDS.low_max ? 'medium' : 'low',
  };
}

// ── seeded PRNG + Gamma/Beta samplers (dependency-free, so `npm run verify`
//    stays green and the run is byte-reproducible). ──
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(rng) { let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function gammaSample(a, rng) {
  if (a < 1) return gammaSample(a + 1, rng) * Math.pow(rng(), 1 / a);
  const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    const x = randn(rng); let v = 1 + c * x; if (v <= 0) continue; v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function betaSample(a, b, rng) { const x = gammaSample(a, rng), y = gammaSample(b, rng); return x / (x + y); }

// Monte-Carlo the FULL composite by drawing sponsorship (Beta posterior) AND
// fit (model-judgment Beta) together, then pushing both through the exact Ch.11
// arithmetic incl. the gate multipliers. Returns the composite mean, a 90%
// credible interval, and the probability the recommendation would land in each
// band - i.e. "how sure are we this is really an Apply?" (Component 1/8).
function monteCarloComposite(shrink, fitVote, liveness, timeline, rng, weights) {
  const fitA = fitVote * FIT_CONC, fitB = (1 - fitVote) * FIT_CONC;
  const comps = new Float64Array(MC_SAMPLES);
  let apply = 0, consider = 0, skip = 0;
  const closed = liveness <= 0.05;
  for (let i = 0; i < MC_SAMPLES; i++) {
    const sp = betaSample(shrink.alphaPost, shrink.betaPost, rng);
    const ft = betaSample(fitA, fitB, rng);
    const comp = (sp * weights.sponsorship + ft * weights.fit) * liveness * timeline;
    comps[i] = comp;
    if (closed || comp < 0.20) skip++; else if (comp >= 0.30) apply++; else consider++;
  }
  comps.sort();
  const q = (p) => comps[Math.floor(p * (MC_SAMPLES - 1))];
  const mean = comps.reduce((s, x) => s + x, 0) / MC_SAMPLES;
  return {
    method: `Monte-Carlo (${MC_SAMPLES} draws, seeded): sponsorship~Beta posterior, fit~Beta(K=${FIT_CONC}) model-judgment`,
    composite_mean: Number(mean.toFixed(4)),
    composite_ci90: [Number(q(0.05).toFixed(4)), Number(q(0.95).toFixed(4))],
    p_apply: Number((apply / MC_SAMPLES).toFixed(3)),
    p_consider: Number((consider / MC_SAMPLES).toFixed(3)),
    p_skip: Number((skip / MC_SAMPLES).toFixed(3)),
  };
}

function bestBLSMatch(blsRows, socCode) {
  return blsRows.find((r) => r.onet_soc_code?.startsWith(socCode) || r.bls_soc_code === socCode) || null;
}

function main() {
  const args = process.argv.slice(2);
  const src = args.find((a) => !a.startsWith('--'));
  if (!src || !fs.existsSync(src)) {
    console.error('Usage: allocate.mjs <candidates.json> [--slots N] [--out-dir dir]');
    process.exit(2);
  }
  const si = args.indexOf('--slots');
  const oi = args.indexOf('--out-dir');
  const outDir = oi >= 0 ? args[oi + 1] : path.dirname(src);

  const input = JSON.parse(fs.readFileSync(src, 'utf8'));
  const slotBudget = si >= 0 ? Number(args[si + 1]) : (input.slot_budget ?? 5);

  const h1bRows = loadH1B();
  const blsRows = loadBLS();
  const rng = mulberry32(MC_SEED); // seeded once → reproducible Monte-Carlo across the whole run
  const WEIGHTS = { sponsorship: 0.35, fit: 0.30 }; // mirrors role-scorer.mjs Ch.11 CONFIG

  const gateResults = [];
  const gatedRoles = []; // roles.json entries for the ones that clear the GIGO gate

  for (const c of input.companies) {
    const row = findCompanyRow(h1bRows, c.name);
    const rejection = { company: c.name };

    if (!row) {
      rejection.gate_status = 'rejected';
      rejection.reason = 'no H1B record found for this company name (no-data - cannot infer sponsorship likelihood)';
      gateResults.push(rejection);
      continue;
    }

    const approvals = Number(row['Total Approvals'] || 0);
    const denials = Number(row['Total Denials'] || 0);
    const titleField = row.top_job_titles_sponsored;

    if (approvals < GIGO_GATE.min_total_approvals) {
      rejection.gate_status = 'rejected';
      rejection.reason = `Total Approvals (${approvals}) below the GIGO gate floor of ${GIGO_GATE.min_total_approvals} - approval rate would be statistical noise`;
      rejection.raw_data = { approvals, denials, approval_rate: row.Approval_Rate };
      gateResults.push(rejection);
      continue;
    }
    if (GIGO_GATE.require_title_field && (!titleField || !titleField.trim())) {
      rejection.gate_status = 'rejected';
      rejection.reason = 'top_job_titles_sponsored is empty/null - cannot classify practitioner vs. researcher';
      gateResults.push(rejection);
      continue;
    }

    // cleared the gate
    const titleClass = classifyTitles(titleField);
    const shrink = betaBinomialShrink(approvals, denials);
    const socCode = c.target_soc || DEFAULT_SOC;
    const bls = bestBLSMatch(blsRows, socCode);
    const pivotScore = bls ? Number(bls.cognitive_pivot_score) : null;

    // fit vote - a MODEL JUDGMENT (labeled), derived from title classification alone,
    // since we have no resume-to-JD matcher in scope. This is deliberately crude.
    const fitByClass = { practitioner: 0.75, hybrid: 0.55, 'researcher-only': 0.2, 'no-data': 0.1 };
    const fitVote = fitByClass[titleClass.classification];

    // liveness - a HARD GATE (Ch.11/Ch.8). Unchecked = NOT cleared; do not
    // default to open. A company only reaches "live" if the human/liveness
    // script explicitly said so.
    const livenessFactor = c.liveness === 'live' ? 1.0 : c.liveness === 'dead' ? 0.0 : 0.5; // 0.5 = "unchecked, not yet cleared" - soft-gates to Consider at best, never silently Apply
    const timelineFactor = input.timeline_factor ?? 1.0;

    // propagate uncertainty through the WHOLE composite (not just sponsorship)
    const mc = monteCarloComposite(shrink, fitVote, livenessFactor, timelineFactor, rng, WEIGHTS);

    gateResults.push({ company: c.name, gate_status: 'cleared', classification: titleClass.classification });

    gatedRoles.push({
      role_id: `realloc-${c.name.replace(/\s+/g, '-').toLowerCase()}`,
      company: c.name,
      title: c.posting_title || `${titleClass.classification === 'researcher-only' ? 'Research Scientist' : 'Machine Learning Engineer'} (inferred target)`,
      _classification: titleClass.classification,
      _shrinkage: shrink,
      _mc: mc,
      _pivot_score: pivotScore,
      _soc_code: socCode,
      _liveness_input: c.liveness || 'unchecked',
      sponsorship: { p: shrink.shrunk_mean, tier: shrink.confidence_tier === 'low' ? 'unknown' : titleClass.classification === 'practitioner' ? 'proven' : titleClass.classification === 'hybrid' ? 'likely' : 'unlikely', source: 'record' },
      fit: { p: fitVote, source: 'model-judgment' },
      role_quality: { p: pivotScore ? Number((pivotScore / 5).toFixed(3)) : 0, source: 'record' },
      liveness: { factor: livenessFactor, source: c.liveness ? 'your-input' : 'input' },
      timeline: { factor: input.timeline_factor ?? 1.0, source: 'your-input' },
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  const rolesPath = path.join(outDir, 'roles.json');
  fs.writeFileSync(rolesPath, JSON.stringify(gatedRoles, null, 2));

  // ── reuse the existing, already-audited scorer (SNICKERDOODLE P2/P6) ──
  let scored = { roles: [] };
  if (gatedRoles.length) {
    execFileSync('node', [ROLE_SCORER, rolesPath, '--out-dir', outDir], { stdio: 'pipe' });
    scored = JSON.parse(fs.readFileSync(path.join(outDir, 'role-scores.json'), 'utf8'));
  }

  // ── THE REALLOCATION STEP: turn a ranked composite list into a concrete
  //    move of a finite slot budget. This is the resource-moving action the
  //    hard-stop gate in Component 7 must intercept before it's treated as
  //    "decided." ──
  const ranked = [...scored.roles].sort((a, b) => b.composite - a.composite);
  const eligible = ranked.filter((r) => r.machine_recommendation !== 'Skip');
  let remaining = slotBudget;
  const allocation = [];
  for (const r of eligible) {
    if (remaining <= 0) break;
    const full = gatedRoles.find((g) => g.role_id === r.role_id);
    const slotsGiven = 1; // one slot per company by default; a company never gets >1 slot in this model
    const mc = full?._mc;
    const tier = full?._shrinkage.confidence_tier;
    // ── THE HARD-STOP GATE: three states (Component 7). No slot is ever spent
    //    by the tool; every row lands in exactly one of BLOCK / FLAG / APPROVE. ──
    const ciStraddlesApply = mc && mc.composite_ci90[0] < 0.30 && mc.composite_ci90[1] >= 0.30;
    // title-contradiction: the classification (from stale H-1B history) says
    // practitioner, but the ACTUAL supplied posting title carries a PhD/research
    // signal → the record and the live role disagree (the Roblox case). This is
    // the flag that must NOT auto-approve - a human has to read the JD.
    const postingTitle = (full?.title || '').toLowerCase();
    const titleContradiction =
      /phd|research scientist|applied scientist|research engineer|principal scientist/.test(postingTitle) &&
      (full?._classification === 'practitioner' || full?._classification === 'hybrid');
    let gate_state, hard_stop;
    if (full?._liveness_input !== 'live') {
      gate_state = 'BLOCK';
      hard_stop = 'BLOCK - liveness not confirmed live; a human must verify the posting is real before this slot can be spent. Resolver: the candidate.';
    } else if (titleContradiction || tier === 'low' || ciStraddlesApply) {
      gate_state = 'FLAG';
      const why = titleContradiction ? 'the live posting title carries a PhD/research signal that contradicts the practitioner classification (stale-history risk)'
        : tier === 'low' ? 'thin H-1B record' : 'composite CI straddles the Apply threshold';
      hard_stop = `FLAG - live and high-scoring, but ${why}; a human MUST read the JD and judge before spending the slot (do not auto-approve). Resolver: the candidate.`;
    } else {
      gate_state = 'APPROVE';
      hard_stop = 'APPROVE-REQUIRED - cleared and confident, but still needs the candidate\'s explicit go before applying. This tool ranks; it never applies on its own. Resolver: the candidate.';
    }
    allocation.push({
      company: r.company,
      composite: r.composite,
      recommendation: r.recommendation,
      slots_allocated: slotsGiven,
      confidence_tier: tier,
      sponsorship_ci90: [full?._shrinkage.ci90_low, full?._shrinkage.ci90_high],
      composite_ci90: mc?.composite_ci90,
      p_recommendation_holds: mc ? (r.machine_recommendation === 'Apply' ? mc.p_apply : r.machine_recommendation === 'Consider' ? mc.p_consider : mc.p_skip) : null,
      liveness_input: full?._liveness_input,
      gate_state,
      HARD_STOP: hard_stop,
    });
    remaining -= slotsGiven;
  }
  const notAllocated = ranked.filter((r) => !allocation.find((a) => a.company === r.company)).map((r) => ({ company: r.company, composite: r.composite, reason: r.machine_recommendation === 'Skip' ? r.reason : 'slot budget exhausted before reaching this company' }));

  const reallocationPlan = {
    _engine: 'application-effort-reallocation (adapted Ch.11 scorer)',
    generated: new Date().toISOString().slice(0, 10),
    slot_budget: slotBudget,
    objective: 'maximize expected practitioner-accessible, live, sponsorship-likely interviews per application slot spent',
    uncertainty_method: `composite reported with a 90% credible interval and P(recommendation holds), from ${MC_SAMPLES} seeded Monte-Carlo draws propagating BOTH the sponsorship Beta posterior AND the model-judgment fit prior (Beta K=${FIT_CONC})`,
    hard_stop_states: 'every allocated row is BLOCK (liveness unconfirmed) | FLAG (live but low-confidence / CI straddles Apply threshold) | APPROVE-REQUIRED (confident, still needs human go). The tool never spends a slot itself.',
    objective_leaves_out: [
      'actual candidate fit beyond a model-judgment title-class heuristic',
      "the team's CURRENT composition (H-1B title history lags 2-3 years behind reality)",
      'referral access, compensation, and culture fit',
      'whether applying there CAUSES a better outcome vs. merely correlates with one (see Component 5)',
    ],
    gigo_gate: GIGO_GATE,
    candidates_evaluated: input.companies.length,
    candidates_rejected_at_gigo_gate: gateResults.filter((g) => g.gate_status === 'rejected').length,
    candidates_scored: gatedRoles.length,
    slots_allocated: allocation.reduce((s, a) => s + a.slots_allocated, 0),
    allocation,
    not_allocated: notAllocated,
    gate_log: gateResults,
  };

  const planPath = path.join(outDir, 'reallocation-plan.json');
  fs.writeFileSync(planPath, JSON.stringify(reallocationPlan, null, 2));

  console.log(`✓ evaluated ${input.companies.length} companies → ${gateResults.filter((g) => g.gate_status === 'rejected').length} rejected at GIGO gate, ${gatedRoles.length} scored`);
  console.log(`  slot budget ${slotBudget} → ${reallocationPlan.slots_allocated} allocated`);
  for (const a of allocation) console.log(`   [${a.gate_state}] ${a.company} - composite ${a.composite} (CI90 ${a.composite_ci90?.join('-')}, P(${a.recommendation}) ${a.p_recommendation_holds}) - ${a.gate_state === 'BLOCK' ? 'liveness unconfirmed' : a.gate_state === 'FLAG' ? 'human must judge before applying' : 'confident, needs human go'}`);
  console.log(`  wrote: ${path.relative(REPO_ROOT, rolesPath)}, ${path.relative(REPO_ROOT, planPath)}`);
}

main();
