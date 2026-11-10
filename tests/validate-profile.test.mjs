import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateProfile } from '../scripts/validate-profile.mjs';

const sample = JSON.parse(await readFile(new URL('../setup-profile.json', import.meta.url), 'utf8'));
const fresh = () => structuredClone(sample);

test('generic sample and a business profile use the supported contract', () => {
  assert.deepEqual(validateProfile(sample), []);
  const profile = fresh();
  profile.team = 'Northstar Operations';
  profile.goal = 'Executive reporting';
  profile.github.owner = 'northstar-team';
  assert.deepEqual(validateProfile(profile), []);
  profile.github.setupMode = 'assisted';
  assert.deepEqual(validateProfile(profile), []);
});

test('missing nested fields and unexpected credential fields are rejected', () => {
  const missing = fresh(); delete missing.channels.telegram;
  assert.ok(validateProfile(missing).some(error => error.includes('channels.telegram')));
  const extra = fresh(); extra.github.token = 'not-a-real-token';
  assert.ok(validateProfile(extra).some(error => error.includes('unsupported field')));
});

test('nonprivate preference and simulated activation are rejected', () => {
  const profile = fresh(); profile.github.visibility = 'public'; profile.status = 'activated';
  const errors = validateProfile(profile);
  assert.ok(errors.some(error => error.includes('visibility')));
  assert.ok(errors.some(error => error.includes('activate')));
});

test('GitHub names reject traversal and invalid account forms', () => {
  for (const name of ['../somewhere', '.', '..', 'bad/name', 'bad.git']) {
    const profile = fresh(); profile.github.repository = name;
    assert.ok(validateProfile(profile).some(error => error.includes('repository')));
  }
  for (const owner of ['-team', 'team-', 'team--name', 'owner/name']) {
    const profile = fresh(); profile.github.owner = owner;
    assert.ok(validateProfile(profile).some(error => error.includes('owner')));
  }
});

test('common token patterns are rejected without echoing values', () => {
  for (const value of ['ghp_' + 'x'.repeat(40), 'sk-proj-' + 'x'.repeat(40), 'github_pat_' + 'x'.repeat(40), '-----BEGIN PRIVATE KEY-----']) {
    const profile = fresh(); profile.inspiration = value;
    const errors = validateProfile(profile);
    assert.ok(errors.some(error => error.includes('resembles a credential')));
    assert.ok(errors.every(error => !error.includes(value)));
  }
});

test('invalid root values, field types and excessive input are rejected', () => {
  for (const value of [null, [], 'anything']) assert.ok(validateProfile(value).length);
  const profile = fresh(); profile.team = 'x'.repeat(81); profile.channels.telegram = 'yes';
  assert.ok(validateProfile(profile).some(error => error.includes('profile.team')));
  assert.ok(validateProfile(profile).some(error => error.includes('telegram')));
});

test('CLI checks the sample without packages or activating anything', () => {
  const script = fileURLToPath(new URL('../scripts/validate-profile.mjs', import.meta.url));
  const profile = fileURLToPath(new URL('../setup-profile.json', import.meta.url));
  const result = spawnSync(process.execPath, [script, profile], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Ready for rollout review/);
  assert.match(result.stdout, /does not activate Gravity Claw/);
});
