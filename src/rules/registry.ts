import type { Rule } from './types.js';
import { secretsInClientBundle } from './secrets/secrets-in-client-bundle.js';
import { envCommittedToGit } from './secrets/env-committed-to-git.js';

/**
 * The rule catalog. Adding a rule: one import + one line here,
 * plus its message bundle in i18n/catalog.ts. No engine changes.
 */
export const rules: Rule[] = [
  secretsInClientBundle,
  envCommittedToGit,
];

export const knownRuleIds: ReadonlySet<string> = new Set(rules.map((r) => r.id));
