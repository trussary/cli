/**
 * The English technical terms every Vietnamese bundle must keep.
 *
 * The house standard for VI is not translation: the technical anchors stay in
 * English — `API key`, `RLS`, `endpoint`, `rotate` — with the explanation in
 * Vietnamese around them. That is what the reader will type into a search box
 * and what their dashboard will say. A translated anchor is a dead end.
 *
 * Every registered rule needs an entry here, which is the point: adding a rule
 * makes you decide which words must survive translation.
 */
export const VI_ANCHORS: Record<string, string[]> = {
  'secrets-in-client-bundle': ['key', 'rotate', 'revoke'],
  'env-committed-to-git': ['git', '.gitignore', 'rotate'],
  'source-maps-in-prod': ['source map', '.map', 'build'],
  'supabase-rls-missing': ['RLS', 'anon key', 'policy', 'service role'],
  'supabase-anon-readable': ['anon key', 'RLS', 'policy'],
  'public-storage-bucket': ['bucket', 'public', 'signed URL'],
  'upload-no-limits': ['upload', 'server'],
  'client-side-only-auth': ['session', 'server', 'redirect'],
  'api-route-no-session': ['session', 'endpoint'],
  'admin-route-unprotected': ['admin', 'middleware', 'layout'],
  'jwt-weak-secret': ['secret', 'environment variable', 'token'],
  'llm-proxy-open': ['endpoint', 'session', 'API'],
  'stripe-webhook-unverified': ['webhook', 'signature', 'constructEvent'],
  'no-rate-limit-auth': ['rate limit', 'IP', 'login'],
  'sql-string-interpolation': ['query', 'parameter', 'database'],
  'write-endpoint-no-validation': ['endpoint', 'schema', 'field'],
  'missing-security-headers': ['header', 'Content-Security-Policy', 'config'],
  'security-headers': ['header', 'Content-Security-Policy', 'response'],
  'debug-mode-exposed': ['debug', 'stack trace', 'log'],
  'wildcard-cors': ['CORS', 'origin'],
  'dep-known-advisories': ['advisory', 'npm audit', 'package'],
  'lockfile-missing': ['lockfile', 'package.json', 'install'],
  'git-exposed': ['.git', 'repository', 'rotate'],
  'env-exposed': ['.env', 'environment variable', 'rotate'],
};
