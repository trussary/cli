import type { DetectedFinding, Rule } from '../types.js';
import { AUTH_EVIDENCE, DB_USAGE, isClientComponent } from '../helpers/auth.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * The "protection" that is really a redirect: the browser fetches the data,
 * then decides whether to show it. Anyone watching the network tab has the
 * data either way.
 *
 * Regex over a genuinely structural question — it will miss some shapes and
 * mis-read others — so it ships at 'possible' and asks the reader to run the
 * manual check. First in line for the AST upgrade in M2.
 */

const LOGIN_REDIRECT =
  /(?:router\s*\.\s*(?:push|replace)|navigate|redirect|window\s*\.\s*location\s*(?:\.\s*(?:href|assign|replace))?\s*=?)\s*\(?\s*['"`]\/(?:login|signin|sign-in|auth)/;

const MISSING_SESSION_TEST =
  /if\s*\(\s*!\s*(?:user|session|currentUser|isSignedIn|isAuthenticated|data\?\.\s*(?:user|session)|auth\?\.\s*user)\b/;

/** A server-side guard in the same file means the redirect is belt-and-braces. */
const SERVER_GUARD = /^\s*['"]use server['"]|getServerSession|createServerClient|cookies\s*\(\s*\)/m;

export const clientSideOnlyAuth: Rule = {
  id: 'client-side-only-auth',
  ruleClass: 'auth',
  defaultSeverity: 'high',
  maxConfidence: 'possible',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      const content = ctx.files.read(file.path);
      if (!LOGIN_REDIRECT.test(content) || !MISSING_SESSION_TEST.test(content)) continue;
      if (!isClientComponent(file.path, content)) continue;
      if (SERVER_GUARD.test(content)) continue;
      // Only interesting when this screen actually pulls data down.
      if (!DB_USAGE.test(content) && !/\bfetch\s*\(/.test(content)) continue;
      if (!AUTH_EVIDENCE.test(content)) continue; // it does look at a session — client-side

      const lines = ctx.files.lines(file.path);
      const idx = lines.findIndex((l) => LOGIN_REDIRECT.test(l));

      out.push({
        confidence: 'possible',
        evidence: {
          kind: 'file',
          path: file.path,
          line: idx + 1,
          excerpt: trimExcerpt(lines[idx] as string),
        },
        vars: { file: file.path, line: idx + 1 },
      });
    }
    return out;
  },
};
