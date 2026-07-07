#!/usr/bin/env node
// ingest.mjs — gig ingest + evidence derivation (gig-finder domain, multi-source).
//
// Reads raw gig listings from a SOURCE and emits one EVIDENCE RECORD per gig —
// the input the gig-scorer combines. It mirrors scripts/ats/scan.mjs
// (discovery/normalize) + the upstream-feed idea from Ch.11: this script
// DERIVES the component signals; scripts/score/gig-scorer.mjs only COMBINES them.
//
// Every derived term is labeled with its source type so the scorer's audit
// trail is honest (P3 — provenance or it isn't evidence):
//   record         — read straight off the gig (budget, proposals, open, deadline)
//   model-judgment — a heuristic / would-be-Claude assessment (ai-can-do-it fit)
//   your-input     — depends on you (time-fit: how fast you deliver)
//
// Sources:
//   --remotive          LIVE fetch remotive.com, filtered to contract/freelance
//                       (open API, no key) — the easy default for real gig data
//   --reddit            LIVE fetch r/forhire "[Hiring]" posts (no auth) — NOTE:
//                       Reddit currently 403s server-IP requests; kept for when
//                       it's reachable (or behind your own network/OAuth)
//   --sample            the bundled fixture data/upwork/gigs.sample.json
//   --in <raw.json>     a raw gig file you provide
//
// Usage:
//   node scripts/upwork/ingest.mjs --remotive [--limit 100] [--job-types contract,freelance]
//   node scripts/upwork/ingest.mjs --sample
//   node scripts/upwork/ingest.mjs --in <raw.json> --out <evidence.json>
//
// Zero Claude API tokens — pure HTTP + JSON. The live Upwork API pull (OAuth) is
// still a TODO seam; the sources above need no key.

import fs from 'node:fs';
import path from 'node:path';

const SRC = { record: 'record', model: 'model-judgment', input: 'your-input' };
const UA = 'reallocation-engine-gig-finder/0.1 (personal, non-commercial; +https://github.com/nikbearbrown/the-reallocation-engine)';

const num = (x) => (typeof x === 'number' && isFinite(x) ? x : null);
const round = (x) => Number(x.toFixed(3));
const htmlToText = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

// ── ai-can-do-it fit [model-judgment] ───────────────────────────────────────
// v0 heuristic by category + title keywords. The real version asks Claude to
// read the description and judge "can I finish this well with AI?" — that call
// is a labeled model-judgment, so it slots in here without changing the schema.
const CATEGORY_FIT = {
  web: 0.9, slides: 0.85, database: 0.9, 'data-ml': 0.8,
  mobile: 0.7, design: 0.6, writing: 0.55, other: 0.4,
};
const FIT_KEYWORDS = [
  [/landing|demo|frontend|react|next\.?js|tailwind|html|css/i, 0.9],
  [/reveal\.?js|slides?|presentation|deck|ppt/i, 0.85],
  [/schema|postgres|sql|database|erd|ddl/i, 0.9],
  [/scrap(e|ing)|automat|script|etl|data ?pipeline/i, 0.82],
];
function aiFit(gig) {
  let p = CATEGORY_FIT[gig.category] ?? CATEGORY_FIT.other;
  const hay = `${gig.title} ${gig.description || ''}`;
  for (const [re, boost] of FIT_KEYWORDS) if (re.test(hay)) p = Math.max(p, boost);
  return { p: round(p), source: SRC.model, note: `${gig.category} task (v0 heuristic; real version asks Claude)` };
}

// ── pay quality [record] ─────────────────────────────────────────────────────
function payQuality(gig) {
  const b = gig.budget || {};
  if (b.type === 'hourly') {
    const r = num(b.rate_usd) ?? 0;
    const p = r >= 40 ? 0.9 : r >= 25 ? 0.6 : 0.3;
    return { p, source: SRC.record, note: `hourly $${r}/h` };
  }
  if (b.type === 'unknown' || num(b.amount_usd) == null) {
    // budget not stated (common on job boards/Reddit) — stay neutral, don't auto-tank
    return { p: 0.4, source: SRC.record, note: 'budget not stated' };
  }
  const a = num(b.amount_usd);
  const p = a >= 400 ? 0.9 : a >= 250 ? 0.6 : a >= 150 ? 0.5 : a >= 80 ? 0.35 : 0.2;
  return { p, source: SRC.record, note: `fixed $${a}` };
}

// ── client trust [record] ────────────────────────────────────────────────────
function clientTrust(gig) {
  const c = gig.client || {};
  // unknown history (job board / Reddit — no platform verification) → neutral, not 0
  if (c.payment_verified == null) {
    return { p: 0.45, source: SRC.record, note: `unknown (${c.source || 'no platform history'})` };
  }
  const spent = num(c.total_spent_usd) ?? 0;
  const rev = num(c.reviews) ?? 0;
  let p, why;
  if (!c.payment_verified) { p = 0.25; why = 'payment NOT verified'; }
  else if (spent >= 10000 && rev >= 4.5) { p = 0.9; why = `verified, $${spent} spent, ${rev}★`; }
  else if (spent >= 1000) { p = 0.7; why = `verified, $${spent} spent`; }
  else { p = 0.55; why = 'verified, thin history'; }
  return { p, source: SRC.record, note: why };
}

// ── liveness GATE [record] — still open AND not flooded ──────────────────────
function liveness(gig) {
  if (gig.open === false) return { factor: 0.02, source: SRC.record, note: 'posting closed/filled' };
  const n = num(gig.proposals);
  if (n == null) return { factor: 1.0, source: SRC.record, note: 'open (response count unknown)' };
  const factor = n > 50 ? 0.4 : n > 20 ? 0.7 : 1.0;
  const tag = n > 50 ? 'flooded' : n > 20 ? 'busy' : 'open';
  return { factor, source: SRC.record, note: `${tag} (${n} responses)` };
}

// ── time-fit GATE [your-input] — can you deliver in the window ───────────────
// v0: deadline_days only. TODO: weigh against per-category effort + your speed.
function timeFit(gig) {
  const d = num(gig.deadline_days);
  if (d == null) return { factor: 1.0, source: SRC.input, note: 'no deadline stated' };
  const factor = d <= 0 ? 0.04 : d < 3 ? 0.5 : 1.0;
  const tag = d <= 0 ? 'impossible' : d < 3 ? 'tight' : 'comfortable';
  return { factor, source: SRC.input, note: `${tag} (${d}d)` };
}

function toEvidence(gig) {
  return {
    gig_id: gig.gig_id ?? null,
    title: gig.title ?? null,
    url: gig.url ?? null,
    source_platform: gig.source_platform ?? null,
    ai_fit: aiFit(gig),
    pay: payQuality(gig),
    client_trust: clientTrust(gig),
    liveness: liveness(gig),
    time_fit: timeFit(gig),
  };
}

// ── shared text parsers (used by all live sources) ───────────────────────────
const CATEGORY_RULES = [
  [/landing|website|web ?app|web ?dev|frontend|react|next\.?js|vue|svelte|html|css|tailwind|wordpress|webflow|shopify|web ?page/i, 'web'],
  [/slide|presentation|powerpoint|\bppt\b|pitch ?deck|reveal/i, 'slides'],
  [/database|schema|postgres|mysql|\bsql\b|\berd\b|data ?model/i, 'database'],
  [/scrap(e|ing)|automat|\bbot\b|api integration|\betl\b|data ?(entry|analysis|pipeline|science)|excel|spreadsheet|machine ?learning|\bml\b|\bai\b|chatbot|\bllm\b|gpt/i, 'data-ml'],
  [/mobile|android|\bios\b|flutter|react native|app ?dev/i, 'mobile'],
  [/logo|graphic|\bdesign\b|figma|ui\/?ux|illustrat|banner|thumbnail/i, 'design'],
  [/writ(e|ing|er)|blog|article|\bcopy\b|content|\bseo\b|edit(ing)?|proofread|transcri|ghostwrit/i, 'writing'],
];
function inferCategory(text) {
  for (const [re, c] of CATEGORY_RULES) if (re.test(text)) return c;
  return 'other';
}
function parseBudget(text) {
  const hourly = text.match(/\$\s?(\d{1,4})\s?(?:\/|per\s?)\s?(?:hr|hour)/i);
  if (hourly) return { type: 'hourly', rate_usd: Number(hourly[1]) };
  const m = text.match(/\$\s?(\d{1,3}(?:,\d{3})+|\d{2,7})(?:\s?[-–—to]+\s?\$?\s?(\d{1,3}(?:,\d{3})+|\d{2,7}))?/);
  if (m) {
    const lo = Number(m[1].replace(/,/g, ''));
    const hi = m[2] ? Number(m[2].replace(/,/g, '')) : null;
    return { type: 'fixed', amount_usd: hi ? Math.round((lo + hi) / 2) : lo };
  }
  return { type: 'unknown' };
}
function parseDeadline(text) {
  if (/\b(asap|urgent(ly)?|today|right now|immediately|by tonight|next few hours|within \d+ ?h(ou)?rs?)\b/i.test(text)) return 0;
  const d = text.match(/within (\d+) days?|in (\d+) days?|(\d+)[ -]day/i);
  if (d) return Number(d[1] || d[2] || d[3]);
  return null;
}

// ── Remotive live source (open API, no key) ──────────────────────────────────
// remotive.com/api/remote-jobs. We filter to gig-like job_types by default.
function remotiveToRawGig(job) {
  const desc = htmlToText(job.description);
  const text = `${job.title} ${(job.tags || []).join(' ')} ${job.category} ${desc}`;
  return {
    gig_id: `remotive-${job.id}`,
    title: job.title,
    url: job.url,
    posted_at: (job.publication_date || '').slice(0, 10),
    source_platform: `remotive (${job.job_type})`,
    category: inferCategory(text),
    budget: parseBudget(job.salary || ''),
    client: { payment_verified: null, source: `remotive: ${job.company_name}` },
    proposals: null, // job boards don't expose applicant counts
    deadline_days: parseDeadline(desc),
    open: true,
    description: desc.slice(0, 500),
  };
}
async function fetchRemotive({ limit = 100, jobTypes = ['contract', 'freelance', 'part_time'] } = {}) {
  const url = `https://remotive.com/api/remote-jobs?limit=${limit}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Remotive fetch failed: ${res.status} ${res.statusText} (${url})`);
  const json = await res.json();
  const jobs = (json?.jobs || []).filter((j) => jobTypes.includes(j.job_type));
  return jobs.map(remotiveToRawGig);
}

// ── Reddit r/forhire live source (no auth) — kept; currently 403s server IPs ──
function redditToRawGig(post) {
  const text = `${post.title} ${post.selftext || ''}`;
  const flair = (post.link_flair_text || '').toLowerCase();
  const open = !/closed|filled/.test(flair) && !/\b(filled|closed)\b/i.test(post.title);
  return {
    gig_id: `reddit-${post.id}`,
    title: post.title.replace(/^\s*\[hiring\]\s*/i, '').trim(),
    url: `https://www.reddit.com${post.permalink}`,
    posted_at: new Date((post.created_utc || 0) * 1000).toISOString().slice(0, 10),
    source_platform: 'reddit:r/forhire',
    category: inferCategory(text),
    budget: parseBudget(text),
    client: { payment_verified: null, source: `reddit u/${post.author}` },
    proposals: num(post.num_comments) ?? 0,
    deadline_days: parseDeadline(text),
    open,
    description: (post.selftext || '').replace(/\s+/g, ' ').slice(0, 500),
  };
}
async function fetchRedditHiring({ subreddit = 'forhire', limit = 50 } = {}) {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Reddit fetch failed: ${res.status} ${res.statusText} (${url}). ` +
    `Reddit blocks unauthenticated server-IP requests; try --remotive instead.`);
  const json = await res.json();
  const posts = (json?.data?.children || []).map((c) => c.data).filter(Boolean);
  const hiring = posts.filter((p) => /hiring/i.test(p.link_flair_text || '') || /^\s*\[hiring\]/i.test(p.title || ''));
  return hiring.map(redditToRawGig);
}

// ── main ─────────────────────────────────────────────────────────────────────
function argVal(args, flag, def) { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : def; }

async function main() {
  const args = process.argv.slice(2);
  const source = args.includes('--remotive') ? 'remotive'
    : args.includes('--reddit') ? 'reddit'
      : args.includes('--sample') ? 'sample'
        : argVal(args, '--source', 'file');
  const limit = Number(argVal(args, '--limit', '100'));

  let rawGigs;
  let inLabel;
  let outDefault;

  if (source === 'remotive') {
    const jobTypes = argVal(args, '--job-types', 'contract,freelance,part_time').split(',').map((s) => s.trim());
    inLabel = `remotive (live; job_types: ${jobTypes.join('/')})`;
    console.log(`Fetching Remotive jobs (limit ${limit}; keeping ${jobTypes.join(', ')})…`);
    rawGigs = await fetchRemotive({ limit, jobTypes });
    outDefault = 'data/upwork/gigs.remotive.evidence.json';
    const rawOut = argVal(args, '--raw-out', 'data/upwork/gigs.remotive.json');
    fs.mkdirSync(path.dirname(rawOut), { recursive: true });
    fs.writeFileSync(rawOut, JSON.stringify(rawGigs, null, 2));
    console.log(`  ${rawGigs.length} gig(s) → ${rawOut}`);
  } else if (source === 'reddit') {
    const subreddit = argVal(args, '--subreddit', 'forhire');
    inLabel = `reddit:r/${subreddit} (live)`;
    console.log(`Fetching r/${subreddit} "[Hiring]" posts (limit ${limit})…`);
    rawGigs = await fetchRedditHiring({ subreddit, limit });
    outDefault = 'data/upwork/gigs.reddit.evidence.json';
    const rawOut = argVal(args, '--raw-out', 'data/upwork/gigs.reddit.json');
    fs.mkdirSync(path.dirname(rawOut), { recursive: true });
    fs.writeFileSync(rawOut, JSON.stringify(rawGigs, null, 2));
    console.log(`  ${rawGigs.length} hiring post(s) → ${rawOut}`);
  } else {
    const inPath = argVal(args, '--in', source === 'sample' ? 'data/upwork/gigs.sample.json' : 'data/upwork/gigs.json');
    inLabel = inPath;
    outDefault = source === 'sample' ? 'data/upwork/gigs.sample.evidence.json' : 'data/upwork/gigs.evidence.json';
    if (!fs.existsSync(inPath)) {
      console.error(`Error: ${inPath} not found. Use --remotive (live), --sample, or pull raw gigs first.`);
      process.exit(1);
    }
    const gigs = JSON.parse(fs.readFileSync(inPath, 'utf8'));
    rawGigs = Array.isArray(gigs) ? gigs : gigs.gigs || [];
  }

  const outPath = argVal(args, '--out', outDefault);
  const evidence = rawGigs.map(toEvidence);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(evidence, null, 2));

  console.log(`✓ ingested ${rawGigs.length} gig(s) from ${inLabel} → ${evidence.length} evidence record(s)`);
  console.log(`  ${path.relative(process.cwd(), outPath)}`);
  console.log(`  next: npm run gig:score -- ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => { console.error('Fatal:', err.message); process.exit(1); });
