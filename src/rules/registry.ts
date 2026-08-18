import type { Rule } from './types.js';
import { secretsInClientBundle } from './secrets/secrets-in-client-bundle.js';
import { envCommittedToGit } from './secrets/env-committed-to-git.js';
import { sourceMapsInProd } from './deploy/source-maps-in-prod.js';
import { wildcardCors } from './deploy/wildcard-cors.js';
import { missingSecurityHeaders } from './deploy/missing-security-headers.js';
import { debugModeExposed } from './deploy/debug-mode-exposed.js';
import { depKnownAdvisories } from './deploy/dep-known-advisories.js';
import { supabaseRlsMissing } from './data-access/supabase-rls-missing.js';
import { publicStorageBucket } from './data-access/public-storage-bucket.js';
import { uploadNoLimits } from './data-access/upload-no-limits.js';
import { clientSideOnlyAuth } from './auth/client-side-only-auth.js';
import { apiRouteNoSession } from './auth/api-route-no-session.js';
import { adminRouteUnprotected } from './auth/admin-route-unprotected.js';

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
  // data-access
  supabaseRlsMissing,
  publicStorageBucket,
  uploadNoLimits,
  // auth
  clientSideOnlyAuth,
  apiRouteNoSession,
  adminRouteUnprotected,
];

export const knownRuleIds: ReadonlySet<string> = new Set(rules.map((r) => r.id));
