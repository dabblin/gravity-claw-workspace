import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const secretPattern = /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{30,}|\d{8,12}:[A-Za-z0-9_-]{30,})\b|-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateProfile(profile) {
  const errors = [];
  function object(value, keys, path) {
    if (!isObject(value)) { errors.push(`${path} must be an object.`); return false; }
    if (Object.keys(value).some(key => !keys.includes(key))) errors.push(`${path} contains an unsupported field. Keep credentials and extra data outside the profile.`);
    for (const key of keys) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key} is required.`);
    return true;
  }
  function text(value, path, max, allowEmpty = false) {
    if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) errors.push(`${path} must be ${allowEmpty ? 'a' : 'a nonempty'} string of at most ${max} characters.`);
  }
  if (!object(profile, ['format', 'version', 'status', 'team', 'goal', 'personality', 'inspiration', 'aiProvider', 'channels', 'github'], 'profile')) return errors;
  if (profile.format !== 'gravity-claw-setup-profile') errors.push('profile.format is not supported. Export a fresh setup profile.');
  if (profile.version !== 1) errors.push('profile.version must be 1.');
  if (profile.status !== 'preferences-only-not-activated') errors.push('profile.status must identify preferences only; this check does not activate a workspace.');
  text(profile.team, 'profile.team', 80);
  text(profile.goal, 'profile.goal', 120);
  text(profile.personality, 'profile.personality', 80);
  text(profile.inspiration, 'profile.inspiration', 160, true);
  text(profile.aiProvider, 'profile.aiProvider', 80);
  if (object(profile.channels, ['telegram', 'email'], 'profile.channels')) {
    if (typeof profile.channels.telegram !== 'boolean') errors.push('profile.channels.telegram must be true or false.');
    if (!['Gmail', 'Microsoft Outlook', 'Decide later'].includes(profile.channels.email)) errors.push('profile.channels.email must be Gmail, Microsoft Outlook or Decide later.');
  }
  if (object(profile.github, ['setupMode', 'owner', 'repository', 'visibility'], 'profile.github')) {
    const { setupMode, owner, repository, visibility } = profile.github;
    if (!['assisted', 'self-managed'].includes(setupMode)) errors.push('profile.github.setupMode must be assisted or self-managed.');
    if (typeof owner !== 'string' || (owner !== '' && (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner) || owner.includes('--')))) errors.push('profile.github.owner must be blank or a valid GitHub account/organization name.');
    if (typeof repository !== 'string' || !/^[A-Za-z0-9_.-]{1,100}$/.test(repository) || ['.', '..'].includes(repository) || repository.endsWith('.git')) errors.push('profile.github.repository must be a GitHub repository name of at most 100 ASCII characters.');
    if (visibility !== 'private') errors.push('profile.github.visibility must be private. Verify the actual repository setting on GitHub separately.');
  }
  const seen = new WeakSet();
  function scan(value, path) {
    if (typeof value === 'string' && secretPattern.test(value)) errors.push(`${path} resembles a credential. Remove it and rotate it with its provider if it was shared. Values are not printed.`);
    if (value && typeof value === 'object' && !seen.has(value)) {
      seen.add(value);
      for (const [key, item] of Object.entries(value)) scan(item, `${path}.${key}`);
    }
  }
  scan(profile, 'profile');
  return errors;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) throw new Error('Usage: node scripts/validate-profile.mjs [setup-profile.json]');
  const filename = args[0] || 'setup-profile.json';
  const info = await stat(filename);
  if (!info.isFile() || info.size > 65536) throw new Error('The profile must be a JSON file of at most 64 KiB.');
  let profile;
  try { profile = JSON.parse(await readFile(filename, 'utf8')); }
  catch { throw new Error('The profile could not be read as JSON. Export a fresh setup-profile.json.'); }
  const errors = validateProfile(profile);
  if (errors.length) {
    for (const message of errors) process.stderr.write(`- ${message}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write('Setup profile structure checked. Ready for rollout review.\nThis does not verify GitHub access, repository privacy or service connections, and does not activate Gravity Claw.\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
