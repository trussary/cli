import type { RuleBundle } from './types.js';
import { bundle as secretsInClientBundle } from './rules/secrets-in-client-bundle.js';
import { bundle as envCommittedToGit } from './rules/env-committed-to-git.js';
import { bundle as sourceMapsInProd } from './rules/source-maps-in-prod.js';
import { bundle as wildcardCors } from './rules/wildcard-cors.js';
import { bundle as missingSecurityHeaders } from './rules/missing-security-headers.js';
import { bundle as debugModeExposed } from './rules/debug-mode-exposed.js';
import { bundle as depKnownAdvisories } from './rules/dep-known-advisories.js';

/**
 * Every rule's message bundle, keyed by rule id.
 * Adding a rule: one import + one entry here (mirrors rules/registry.ts).
 */
export const ruleBundles: Record<string, RuleBundle> = {
  'secrets-in-client-bundle': secretsInClientBundle,
  'env-committed-to-git': envCommittedToGit,
  'source-maps-in-prod': sourceMapsInProd,
  'wildcard-cors': wildcardCors,
  'missing-security-headers': missingSecurityHeaders,
  'debug-mode-exposed': debugModeExposed,
  'dep-known-advisories': depKnownAdvisories,
};
