#!/usr/bin/env node
/**
 * cv-integrity-check.mjs — anchor every named entity in an LLM-tailored CV
 * variant to the attested base record, and refuse to pass anything that
 * does not trace back.
 *
 * Recipe: recipes/case-cv-integrity-backend-h1b.md
 *
 * The membership test is code, not a model call (P2/P3): a word-boundary,
 * case-insensitive match of each candidate entity against the base corpus.
 * The only judgment left to the human is, per flag, DROP (not true) or
 * PROMOTE (true but missing from the base — add it to the base first).
 *
 * Usage:
 *   node scripts/resumes/cv-integrity-check.mjs \
 *     --base <base.json|base.md> --variant <variant.md|.tex|.txt> \
 *     [--json <agent-log.json>] [--report <human-report.md>] [--mode sample|live]
 *
 * Exit codes (the gate):
 *   0  zero open flags — variant fully anchored, may proceed to render
 *   1  open flags — a human must decide drop/promote; render is blocked
 *   2  stop condition — missing/unparseable input; refuse to score (P4)
 *
 * Per P5 this script emits TWO artifacts: a JSON log for agents and a
 * Markdown report for the human applicant. One artifact cannot serve both.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const TOOL_VERSION = '0.1.0';

// ---------------------------------------------------------------- args
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
};
const basePath = getArg('--base');
const variantPath = getArg('--variant');
const jsonOut = getArg('--json');
const reportOut = getArg('--report');
const mode = getArg('--mode') || 'sample';

const stopConditions = [];
let candidatesChecked = 0; // set after extraction; safe for early hardStop paths

// Live runs read private data, so their artifacts must write back into private/.
// Checked before ANY write — including the stop-condition log itself, which must
// not be written to a path the run is refusing.
const insidePrivate = (p) => path.resolve(p).startsWith(path.resolve('private') + path.sep);
const safeToWrite = (p) => mode !== 'live' || insidePrivate(p);

// A crash must never wear the gate's exit codes: 1 means "flags open, human
// deciding" and 0 means "clean". Any unexpected error is a stop condition.
const unexpected = (err) => {
  console.error(`STOP: unexpected error — ${err && err.message ? err.message : err}`);
  console.error('Refusing to score rather than guess (stop condition, exit 2).');
  process.exit(2);
};
process.on('uncaughtException', unexpected);
process.on('unhandledRejection', unexpected);
const hardStop = (reason) => {
  stopConditions.push(reason);
  const log = buildAgentLog({ anchored: [], flags: [], exitCode: 2 });
  if (jsonOut && safeToWrite(jsonOut)) writeArtifact(jsonOut, JSON.stringify(log, null, 2));
  console.error(`STOP: ${reason}`);
  console.error('Refusing to score rather than guess (stop condition, exit 2).');
  process.exit(2);
};

if (!basePath || !variantPath) {
  console.error('usage: --base <base.json|md> --variant <variant.md|.tex|.txt> [--json out.json] [--report out.md] [--mode sample|live]');
  process.exit(2);
}
if (!['sample', 'live'].includes(mode)) {
  hardStop(`--mode must be "sample" or "live" (got "${mode}") — an unrecognized mode must not run as if it were approved`);
}
// The recipe's scope gate, enforced in-tool rather than left to memory.
if (mode === 'live') {
  for (const [flag, p] of [['--json', jsonOut], ['--report', reportOut]]) {
    if (p && !insidePrivate(p)) hardStop(`live mode requires ${flag} to write inside private/ — got ${p}`);
  }
}

// ---------------------------------------------------------------- dictionary
// Maintained tech-term dictionary (multi-word entries supported). Coverage is
// the known false-negative boundary: a novel tool absent from this list and
// not acronym/CamelCase-shaped can pass unflagged. Treat as maintained, not done.
const DICT = [
  'AWS', 'GCP', 'Azure', 'EC2', 'S3', 'Lambda', 'RDS', 'CloudWatch', 'DynamoDB', 'SNS', 'SQS',
  'Cloud SQL', 'BigQuery', 'Spanner', 'Pub/Sub', 'IAM', 'PAM',
  'Kubernetes', 'Docker', 'Terraform', 'Argo Workflows', 'Kargo', 'Helm', 'Istio', 'Envoy', 'Consul', 'Vault',
  'Kafka', 'RabbitMQ', 'gRPC', 'GraphQL', 'etcd', 'Redis', 'Memcached', 'NGINX', 'Protobuf',
  'ClickHouse', 'PostgreSQL', 'MongoDB', 'Cassandra', 'Elasticsearch', 'Snowflake', 'Spark', 'Flink', 'Airflow',
  'Prometheus', 'Grafana', 'OpenTelemetry', 'Datadog', 'Splunk', 'PagerDuty', 'incident.io',
  'Python', 'Java', 'Go', 'TypeScript', 'JavaScript', 'Rust', 'Scala', 'Kotlin', 'Bash', 'SQL',
  'React', 'Next.js', 'Node.js', 'Express', 'Jenkins', 'GitHub Actions', 'GitOps', 'Chaos Mesh',
];

// Stoplisted non-claims: generic words, skill-category section headers, and
// document furniture. A section header is not a résumé claim.
const STOP = new Set([
  'THE', 'AND', 'FOR', 'WITH', 'CI', 'CD', 'API', 'HTTP', 'HTTPS', 'TCP', 'DNS', 'SLO', 'SLA', 'RBAC',
  'CV', 'PDF', 'USA', 'GPA', 'BS', 'MS', 'PHD', 'DEVOPS', 'CLOUD', 'FRONTEND', 'BACKEND', 'FULLSTACK',
  'DATA', 'SRE', 'MLOPS', 'REST', 'JSON', 'YAML', 'URL', 'ATS', 'JD',
  // role-family / document abbreviations — job words, not technology claims
  'SWE', 'SDE', 'LLM', 'FAANG', 'OPT', 'STEM',
]);

// ---------------------------------------------------------------- matching
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Word-boundary, case-insensitive — NEVER substring: "rds" inside
// "dashboards" must not anchor a fabricated "RDS".
const wbCount = (term, text) => {
  const re = new RegExp(`(?<![A-Za-z0-9])${esc(term)}(?![A-Za-z0-9])`, 'gi');
  return (text.match(re) || []).length;
};

// An acronym is anchored if its letters are the initials of a consecutive run
// of words WITHIN A SINGLE base field/line (MTTD <- "mean time to detection").
// Scoping to one segment matters: a single initials string built over the whole
// corpus lets words from unrelated fields juxtapose, so a fabricated 3-letter
// acronym (e.g. CRM) can chance-anchor across field boundaries — found by a
// hostile review; fixed here.
const initialsString = (text) =>
  (text.match(/[A-Za-z][A-Za-z'./-]*/g) || []).map((w) => w[0].toUpperCase()).join('');
const isAcronymInBase = (term, initialsSegments) =>
  /^[A-Z]{3,}$/.test(term) && initialsSegments.some((seg) => seg.includes(term.toUpperCase()));

// Candidate entities beyond the dictionary: the variant's own acronym /
// CamelCase / versioned tokens, minus stoplist and short ambiguous tokens.
const deriveCandidates = (text) => {
  const found = new Set();
  for (const m of text.matchAll(/\b([A-Z][a-z]+[A-Z][A-Za-z]+|[A-Z]{2,}[0-9]*|[a-z]+[0-9])\b/g)) {
    const t = m[1];
    if (STOP.has(t.toUpperCase())) continue;
    if (/^[A-Za-z]{1,2}$/.test(t)) continue; // 2-letter tokens (VW, GE): too ambiguous
    found.add(t);
  }
  return [...found];
};

// ---------------------------------------------------------------- load inputs
if (!existsSync(basePath)) hardStop(`base record not found at ${basePath} — the attested base is the source of truth; without it there is nothing to anchor to`);
if (!existsSync(variantPath)) hardStop(`variant not found at ${variantPath}`);

let baseCorpus;
let baseSegments = []; // individual fields/lines — initials never cross a segment boundary
const rawBase = readFileSync(basePath, 'utf-8');
if (basePath.endsWith('.json')) {
  let parsed;
  try {
    parsed = JSON.parse(rawBase);
  } catch (e) {
    hardStop(`base ${basePath} is not valid JSON (${e.message}) — refusing to anchor against a corrupt record`);
  }
  if (parsed && parsed.attestation && parsed.attestation.attested !== true) {
    hardStop(`base ${basePath} carries attestation.attested=${parsed.attestation.attested} — an unattested base is the agent's guess about your past, not a source of truth`);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !parsed.attestation || parsed.attestation.attested !== true) {
    hardStop(`base ${basePath} has no attestation block — an unattested base is the agent's guess about your past, not a source of truth`);
  }
  // Corpus = every string value of RESUME CONTENT in the attested record
  // (titles, highlights, skills, institutions), so phrase-level evidence like
  // "mean time to detection" is available for abbreviation anchoring.
  // Metadata is EXCLUDED: the attestation block and any `_`-prefixed key are
  // notes ABOUT the record, not the record — an attestation note that mentions
  // a removed claim ("Kafka removed as unverifiable") must not re-anchor it.
  // (Found by a hostile review; regression-tested.)
  const strings = [];
  const walk = (node, key) => {
    if (key === 'attestation' || (typeof key === 'string' && key.startsWith('_'))) return;
    if (typeof node === 'string') strings.push(node);
    else if (Array.isArray(node)) node.forEach((n) => walk(n));
    else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walk(v, k));
  };
  walk(parsed);
  baseCorpus = strings.join('\n');
  baseSegments = strings;
} else {
  baseCorpus = rawBase;
  baseSegments = rawBase.split(/\n+/);
}
const variantText = readFileSync(variantPath, 'utf-8');
if (!variantText.trim()) hardStop(`variant ${variantPath} is empty — nothing to check`);

const baseInitialsSegments = baseSegments.map(initialsString);

// ---------------------------------------------------------------- the check
const candidates = [...new Set([...DICT, ...deriveCandidates(variantText)])];
candidatesChecked = candidates.length;
const anchored = [];
const flags = [];
const variantLines = variantText.split('\n');
const excerptFor = (term) => {
  const re = new RegExp(`(?<![A-Za-z0-9])${esc(term)}(?![A-Za-z0-9])`, 'i');
  const line = variantLines.find((l) => re.test(l));
  const trimmed = (line || '').trim();
  return trimmed.length > 110 ? trimmed.slice(0, 107) + '...' : trimmed;
};

for (const term of candidates) {
  const inVariant = wbCount(term, variantText);
  if (inVariant === 0) continue;
  const inBase = wbCount(term, baseCorpus);
  if (inBase > 0 || isAcronymInBase(term, baseInitialsSegments)) {
    anchored.push(term);
  } else {
    flags.push({ entity: term, occurrences: inVariant, variant_excerpt: excerptFor(term) });
  }
}
anchored.sort((a, b) => a.localeCompare(b));
flags.sort((a, b) => a.entity.localeCompare(b.entity));
const exitCode = flags.length > 0 ? 1 : 0;

// ---------------------------------------------------------------- artifacts (P5)
function nowIso() {
  return new Date().toISOString();
}
function writeArtifact(p, content) {
  mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
  writeFileSync(p, content);
}
function buildAgentLog(extra) {
  return {
    workflow: 'case-cv-integrity-backend-h1b',
    tool: 'scripts/resumes/cv-integrity-check.mjs',
    tool_version: TOOL_VERSION,
    run_id: `cv-integrity-${new Date().toLocaleDateString('en-CA')}`, // local date, not UTC — keeps run_id aligned with artifact filenames
    mode,
    base: basePath,
    variant: variantPath,
    candidates_checked: candidatesChecked,
    anchored_count: extra.anchored.length,
    anchored: extra.anchored,
    open_flags: extra.flags.length,
    flags: extra.flags,
    stop_conditions: stopConditions,
    verification_method: 'word-boundary case-insensitive membership vs attested base corpus; acronym-initials expansion scoped to a single base field/line; stoplist for headers/short tokens',
    judgment_boundary: 'flag detection is code (record); drop-vs-promote decisions are human; no model call occurs in this tool',
    exit_code: extra.exitCode,
    generated_at: nowIso(),
  };
}

const agentLog = buildAgentLog({ anchored, flags, exitCode });
if (jsonOut) writeArtifact(jsonOut, JSON.stringify(agentLog, null, 2) + '\n');

if (reportOut) {
  const rows = flags
    .map((f) => `| \`${f.entity}\` | ${f.occurrences} | ${f.variant_excerpt.replace(/\|/g, '\\|')} | DROP / PROMOTE |`)
    .join('\n');
  const report = `# CV Integrity Report — ${path.basename(variantPath)}

**Generated:** ${nowIso()} · **Mode:** ${mode} · **Tool:** cv-integrity-check v${TOOL_VERSION}
**Base (attested record):** \`${basePath}\`
**Variant (LLM-tailored):** \`${variantPath}\`

**Reader:** the applicant (you). **Decision enabled:** per flag, DROP (not true — cut it) or PROMOTE (true but missing — add to the base first, regenerate). The variant must not render or ship while any flag is open.

## Summary

| Metric | Value |
|---|---:|
| Candidate entities checked | ${candidates.length} |
| Anchored (in variant AND base — never flagged) | ${anchored.length} |
| **Open flags (0 required to pass)** | **${flags.length}** |
| Gate result | ${exitCode === 0 ? 'PASS — cleared to render' : 'BLOCKED — resolve every flag, then re-run'} |

## Open flags — present in the variant, zero word-boundary matches in the base

${flags.length === 0 ? '_None. Every named entity in the variant traces to the attested base._' : `| Entity | Count | Variant line (excerpt) | Your decision |
|---|---:|---|---|
${rows}`}

## Anchored (for the record)

${anchored.map((a) => `\`${a}\``).join(' · ') || '_none_'}

## What this check cannot verify

- Meaning drift in reworded lines ("contributed to" → "led") — allowed by design, human-judged.
- Whether a PROMOTE decision is honest — the check trusts the attested base and your answer.
- A novel tool absent from the dictionary and not acronym/CamelCase-shaped (coverage boundary).
`;
  writeArtifact(reportOut, report);
}

// ---------------------------------------------------------------- console
console.log(`cv-integrity-check v${TOOL_VERSION} · mode=${mode}`);
console.log(`base:    ${basePath}`);
console.log(`variant: ${variantPath}`);
console.log(`checked ${candidates.length} candidate entities · anchored ${anchored.length}`);
if (flags.length === 0) {
  console.log('OPEN FLAGS: 0 — every named entity in the variant is anchored to the attested base.');
} else {
  console.log(`OPEN FLAGS: ${flags.length} — zero word-boundary matches in the base. Decide each: DROP | PROMOTE.`);
  for (const f of flags) console.log(`  [ FLAG ] ${f.entity}  ->  ${f.variant_excerpt}`);
}
if (jsonOut) console.log(`agent log:    ${jsonOut}`);
if (reportOut) console.log(`human report: ${reportOut}`);
process.exit(exitCode);
