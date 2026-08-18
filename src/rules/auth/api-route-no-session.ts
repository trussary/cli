import type { DetectedFinding, Rule } from '../types.js';
import { AUTH_EVIDENCE, DB_USAGE, isPublicByDesign, middlewareGuards, WRITE_HANDLER } from '../helpers/auth.js';
import { isAnalysableSource, isNextApiRoute, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * An API route that touches data without ever asking who is calling. We can
 * see the absence of a check in the file; we cannot see a check that lives in
 * middleware we failed to match, or in a wrapper we do not recognise — so this
 * caps at 'likely' and the middleware case is ruled out first.
 */

const SERVER_ACTION = /^\s*['"]use server['"]/m;

export const apiRouteNoSession: Rule = {
  id: 'api-route-no-session',
  ruleClass: 'auth',
  defaultSeverity: 'high',
  maxConfidence: 'likely',
  inputs: { stacks: ['next'], globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const sources = ctx.files
      .list(SOURCE_GLOBS)
      .filter((f) => isAnalysableSource(f.path))
      .map((f) => ({ path: f.path, content: ctx.files.read(f.path) }));

    // A middleware that checks identity and mentions the API surface protects
    // every route under it — nothing below is worth reporting.
    if (middlewareGuards(sources, /\/api|matcher/)) return [];

    const out: DetectedFinding[] = [];

    for (const file of sources) {
      const isRoute = isNextApiRoute(file.path) || SERVER_ACTION.test(file.content);
      if (!isRoute) continue;
      if (isPublicByDesign(file.path)) continue;
      if (AUTH_EVIDENCE.test(file.content)) continue;

      const touchesData = DB_USAGE.test(file.content);
      const writes = WRITE_HANDLER.test(file.content);
      if (!touchesData && !writes) continue;

      const lines = ctx.files.lines(file.path);
      const idx = lines.findIndex((l) => DB_USAGE.test(l) || WRITE_HANDLER.test(l));

      out.push({
        confidence: 'likely',
        evidence: {
          kind: 'file',
          path: file.path,
          line: idx >= 0 ? idx + 1 : 1,
          excerpt: trimExcerpt(idx >= 0 ? (lines[idx] as string) : file.path),
        },
        vars: {
          file: file.path,
          line: idx >= 0 ? idx + 1 : 1,
          action: writes ? 'changes data' : 'reads data',
        },
      });
    }
    return out;
  },
};
