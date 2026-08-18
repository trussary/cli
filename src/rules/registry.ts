import type { Rule } from './types.js';
import { secretsInClientBundle } from './secrets/secrets-in-client-bundle.js';
import { envCommittedToGit } from './secrets/env-committed-to-git.js';
import { sourceMapsInProd } from './deploy/source-maps-in-prod.js';
import { wildcardCors } from './deploy/wildcard-cors.js';
import { missingSecurityHeaders } from './deploy/missing-security-headers.js';
import { debugModeExposed } from './deploy/debug-mode-exposed.js';
import { depKnownAdvisories } from './deploy/dep-known-advisories.js';

/**
 * The rule catalog. Adding a rule: one import + one line here,
 * plus its message bundle in i18n/catalog.ts. No engine changes.
 */
export const rules: Rule[] = [
  // secrets
  secretsInClientBundle,
  envCommittedToGit,
  sourceMapsInProd,
  // deploy
  wildcardCors,
  missingSecurityHeaders,
  debugModeExposed,
  depKnownAdvisories,
];

export const knownRuleIds: ReadonlySet<string> = new Set(rules.map((r) => r.id));
