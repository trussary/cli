import type { RuleBundle } from './types.js';
import { bundle as secretsInClientBundle } from './rules/secrets-in-client-bundle.js';
import { bundle as envCommittedToGit } from './rules/env-committed-to-git.js';

/**
 * Every rule's message bundle, keyed by rule id.
 * Adding a rule: one import + one entry here (mirrors rules/registry.ts).
 */
export const ruleBundles: Record<string, RuleBundle> = {
  'secrets-in-client-bundle': secretsInClientBundle,
  'env-committed-to-git': envCommittedToGit,
};
