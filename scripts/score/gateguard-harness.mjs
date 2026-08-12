#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();

function argValue(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const fixturePath = path.resolve(
  argValue(
    '--fixtures',
    'scripts/score/fixtures/gateguard-roles.json'
  )
);

const scorerPath = path.resolve(
  argValue(
    '--scorer',
    'scripts/score/role-scorer.mjs'
  )
);

const label = argValue('--label', 'baseline');

const reportDir = path.resolve(
  argValue(
    '--report-dir',
    'reports/generated'
  )
);

function die(message) {
  console.error(`ERROR: ${message}`);
  process.exit(2);
}

if (!fs.existsSync(fixturePath)) {
  die(`fixture file not found: ${fixturePath}`);
}

if (!fs.existsSync(scorerPath)) {
  die(`scorer file not found: ${scorerPath}`);
}

let fixtures;
try {
  fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
} catch (err) {
  die(`fixture JSON could not be parsed: ${err.message}`);
}

if (!Array.isArray(fixtures) || fixtures.length === 0) {
  die('fixture file must contain a non-empty JSON array');
}

const scorerSha256 = crypto
  .createHash('sha256')
  .update(fs.readFileSync(scorerPath))
  .digest('hex');

const git = spawnSync(
  'git',
  ['rev-parse', 'HEAD'],
  { cwd: ROOT, encoding: 'utf8' }
);

const gitCommit =
  git.status === 0 ? git.stdout.trim() : 'unavailable';

const tempDir = fs.mkdtempSync(
  path.join(os.tmpdir(), 'gateguard-')
);

const scorerRun = spawnSync(
  process.execPath,
  [
    scorerPath,
    fixturePath,
    '--out-dir',
    tempDir,
    '--md',
    path.join(tempDir, 'role-scores.md')
  ],
  {
    cwd: ROOT,
    encoding: 'utf8'
  }
);

if (scorerRun.status !== 0) {
  console.error('GateGuard could not execute the scorer.');
  console.error('--- scorer stdout ---');
  console.error(scorerRun.stdout || '(empty)');
  console.error('--- scorer stderr ---');
  console.error(scorerRun.stderr || '(empty)');
  process.exit(2);
}

const scorerJsonPath = path.join(
  tempDir,
  'role-scores.json'
);

if (!fs.existsSync(scorerJsonPath)) {
  die('scorer completed but role-scores.json was not produced');
}

const scorerOutput = JSON.parse(
  fs.readFileSync(scorerJsonPath, 'utf8')
);

const scoredById = new Map(
  scorerOutput.roles.map((role) => [
    role.role_id,
    role
  ])
);

function checkFixture(fixture) {
  const expected = fixture._gateguard;
  const actual = scoredById.get(fixture.role_id);

  const assertions = [];

  if (!actual) {
    return {
      role_id: fixture.role_id,
      purpose: expected?.purpose ?? '',
      status: 'ERROR',
      assertions: [{
        name: 'scorer produced role',
        pass: false,
        expected: fixture.role_id,
        actual: 'missing'
      }]
    };
  }

  if (expected.expect_composite === 'zero') {
    assertions.push({
      name: 'closed gate forces exact zero composite',
      pass: actual.composite === 0,
      expected: 0,
      actual: actual.composite
    });
  }

  if (expected.expect_composite === 'positive') {
    assertions.push({
      name: 'composite remains positive',
      pass: actual.composite > 0,
      expected: '> 0',
      actual: actual.composite
    });
  }

  if (expected.expect_recommendation) {
    assertions.push({
      name: 'machine recommendation',
      pass:
        actual.machine_recommendation ===
        expected.expect_recommendation,
      expected: expected.expect_recommendation,
      actual: actual.machine_recommendation
    });
  }

  if (expected.expect_gated_by) {
    assertions.push({
      name: 'closed-gate reason identifies gate',
      pass:
        typeof actual.reason === 'string' &&
        actual.reason.startsWith(
          `gated: ${expected.expect_gated_by}`
        ),
      expected: `gated: ${expected.expect_gated_by}`,
      actual: actual.reason
    });
  } else {
    assertions.push({
      name: 'case is not classified as a closed gate',
      pass:
        typeof actual.reason === 'string' &&
        !actual.reason.startsWith('gated:'),
      expected: 'reason not starting with "gated:"',
      actual: actual.reason
    });
  }

  const pass = assertions.every((a) => a.pass);

  return {
    role_id: fixture.role_id,
    purpose: expected?.purpose ?? '',
    status: pass ? 'PASS' : 'FAIL',
    actual_composite: actual.composite,
    machine_recommendation:
      actual.machine_recommendation,
    reason: actual.reason,
    trace: actual.trace,
    assertions
  };
}

const results = fixtures.map(checkFixture);

const passed = results.filter(
  (r) => r.status === 'PASS'
).length;

const failed = results.filter(
  (r) => r.status === 'FAIL'
).length;

const errors = results.filter(
  (r) => r.status === 'ERROR'
).length;

const generatedAt = new Date().toISOString();

const audit = {
  tool: 'GateGuard',
  version: '0.1.0',
  run_label: label,
  generated_at: generatedAt,
  git_commit: gitCommit,
  scorer: path.relative(ROOT, scorerPath),
  scorer_sha256: scorerSha256,
  fixtures: path.relative(ROOT, fixturePath),
  fixture_count: fixtures.length,
  summary: {
    passed,
    failed,
    errors,
    total: results.length
  },
  scorer_stdout: scorerRun.stdout.trim(),
  results
};

fs.mkdirSync(reportDir, { recursive: true });

const jsonReport = path.join(
  reportDir,
  `gateguard-${label}.json`
);

const mdReport = path.join(
  reportDir,
  `gateguard-${label}.md`
);

fs.writeFileSync(
  jsonReport,
  JSON.stringify(audit, null, 2) + '\n'
);

const md = [];

md.push(`# GateGuard ${label} audit`);
md.push('');
md.push(`Generated: ${generatedAt}`);
md.push(`Git commit: \`${gitCommit}\``);
md.push(`Scorer: \`${path.relative(ROOT, scorerPath)}\``);
md.push(`Scorer SHA-256: \`${scorerSha256}\``);
md.push(`Fixtures: \`${path.relative(ROOT, fixturePath)}\``);
md.push('');
md.push('## Summary');
md.push('');
md.push(`- Total cases: ${results.length}`);
md.push(`- PASS: ${passed}`);
md.push(`- FAIL: ${failed}`);
md.push(`- ERROR: ${errors}`);
md.push('');
md.push('## Results');
md.push('');
md.push('| Case | Status | Composite | Recommendation | Purpose |');
md.push('|---|---|---:|---|---|');

for (const result of results) {
  md.push(
    `| ${result.role_id} | **${result.status}** | ` +
    `${result.actual_composite ?? '—'} | ` +
    `${result.machine_recommendation ?? '—'} | ` +
    `${result.purpose} |`
  );
}

md.push('');
md.push('## Assertion detail');
md.push('');

for (const result of results) {
  md.push(`### ${result.role_id} — ${result.status}`);
  md.push('');
  md.push(result.purpose);
  md.push('');

  for (const assertion of result.assertions) {
    md.push(
      `- ${assertion.pass ? 'PASS' : 'FAIL'} — ` +
      `${assertion.name}; expected: ` +
      `\`${String(assertion.expected)}\`; actual: ` +
      `\`${String(assertion.actual)}\``
    );
  }

  if (result.reason) {
    md.push(`- Scorer reason: ${result.reason}`);
  }

  md.push('');
}

md.push('## Evidence boundary');
md.push('');
md.push(
  '- Fixture values are controlled fictional inputs created for this test.'
);
md.push(
  '- Composite values, recommendations, reasons, and traces come from the scorer output.'
);
md.push(
  '- PASS/FAIL is produced by deterministic assertions in this harness.'
);
md.push(
  '- This audit does not claim that fictional fixture values describe any real candidate, employer, or posting.'
);
md.push('');

fs.writeFileSync(
  mdReport,
  md.join('\n') + '\n'
);

console.log('');
console.log('GateGuard hard-stop verification');
console.log('================================');

for (const result of results) {
  console.log(
    `${result.status.padEnd(5)}  ` +
    `${result.role_id}  ` +
    `composite=${String(result.actual_composite).padEnd(7)}  ` +
    `${result.purpose}`
  );
}

console.log('');
console.log(
  `Summary: ${passed} PASS · ${failed} FAIL · ` +
  `${errors} ERROR · ${results.length} TOTAL`
);

console.log(
  `JSON audit: ${path.relative(ROOT, jsonReport)}`
);

console.log(
  `Human report: ${path.relative(ROOT, mdReport)}`
);

fs.rmSync(tempDir, {
  recursive: true,
  force: true
});

process.exit(
  failed > 0 || errors > 0 ? 1 : 0
);
