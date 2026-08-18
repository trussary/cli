import type { RuleBundle } from './types.js';
import { bundle as secretsInClientBundle } from './rules/secrets-in-client-bundle.js';
import { bundle as envCommittedToGit } from './rules/env-committed-to-git.js';
import { bundle as sourceMapsInProd } from './rules/source-maps-in-prod.js';
import { bundle as wildcardCors } from './rules/wildcard-cors.js';
import { bundle as missingSecurityHeaders } from './rules/missing-security-headers.js';
import { bundle as debugModeExposed } from './rules/debug-mode-exposed.js';
import { bundle as depKnownAdvisories } from './rules/dep-known-advisories.js';
import { bundle as supabaseRlsMissing } from './rules/supabase-rls-missing.js';
import { bundle as publicStorageBucket } from './rules/public-storage-bucket.js';
import { bundle as uploadNoLimits } from './rules/upload-no-limits.js';
import { bundle as clientSideOnlyAuth } from './rules/client-side-only-auth.js';
import { bundle as apiRouteNoSession } from './rules/api-route-no-session.js';
import { bundle as adminRouteUnprotected } from './rules/admin-route-unprotected.js';

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
  'supabase-rls-missing': supabaseRlsMissing,
  'public-storage-bucket': publicStorageBucket,
  'upload-no-limits': uploadNoLimits,
  'client-side-only-auth': clientSideOnlyAuth,
  'api-route-no-session': apiRouteNoSession,
  'admin-route-unprotected': adminRouteUnprotected,
};
