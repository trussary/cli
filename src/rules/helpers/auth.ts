/**
 * What "this code checks who you are" and "this code touches data" look like
 * in the frameworks this tool targets. Two rules share these lists, so a
 * library added here is understood by both at once.
 *
 * Regex, not AST: we are looking for the presence of a check, not proving the
 * check is correct. That is exactly why the rules built on it say 'likely'.
 */

/** A session, token or user identity actually being consulted. */
export const AUTH_EVIDENCE =
  /\b(getUser|getSession|getServerSession|getServerSideUser|currentUser|useUser|auth|clerkClient|requireAuth|requireUser|withAuth|withApiAuthRequired|verifyToken|verifyIdToken|isAuthenticated|ensureAuthenticated|protectRoute)\s*\(|\bjwt\s*\.\s*verify\s*\(|\bsession\s*[?.]|\breq\s*\.\s*user\b|\bpassport\b|\bnext-auth\b|@clerk\/|@auth0\/|supabase\.auth\b/;

/** Code that reads or writes application data — the thing worth protecting. */
export const DB_USAGE =
  /\bsupabase\s*(?:\w+)?\s*\.\s*from\s*\(|\bprisma\s*\.\s*\w+\s*\.\s*(?:find|create|update|delete|upsert)|\bdb\s*\.\s*(?:query|select|insert|update|delete|collection)|\bmongoose\b|\bknex\s*\(|\bpool\s*\.\s*query\s*\(|\bsql`|\bdrizzle\b/;

/** A route handler that changes something. */
export const WRITE_HANDLER =
  /export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\b|export\s+const\s+(?:POST|PUT|PATCH|DELETE)\s*=|req\s*\.\s*method\s*===?\s*['"](?:POST|PUT|PATCH|DELETE)['"]|\bapp\s*\.\s*(?:post|put|patch|delete)\s*\(/;

/**
 * Endpoints that are meant to answer strangers. Flagging these is the fastest
 * way to teach someone that the tool cries wolf.
 */
const PUBLIC_BY_DESIGN =
  /(^|\/)(auth|login|logout|signin|signup|register|callback|webhooks?|health|healthz|status|ping|cron|revalidate|og|opengraph|sitemap|robots|rss|feed|public|stripe)(\/|\.|$)/i;

export function isPublicByDesign(path: string): boolean {
  return PUBLIC_BY_DESIGN.test(path);
}

/** A file that runs in the browser: an explicit directive, or a Vite app's src. */
export function isClientComponent(path: string, content: string): boolean {
  if (/^\s*['"]use client['"]/m.test(content)) return true;
  if (/^\s*['"]use server['"]/m.test(content)) return false;
  return /^src\//.test(path) && /\.(tsx|jsx)$/.test(path);
}

/**
 * Middleware that both checks identity and covers a path — the single most
 * common reason a per-route check is absent yet the route is protected.
 */
export function middlewareGuards(
  paths: { path: string; content: string }[],
  needle: RegExp,
): boolean {
  return paths.some(
    (f) =>
      /(^|\/)middleware\.[jt]sx?$/.test(f.path) &&
      AUTH_EVIDENCE.test(f.content) &&
      needle.test(f.content),
  );
}
