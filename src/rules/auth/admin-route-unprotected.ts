import type { DetectedFinding, Rule } from '../types.js';
import { AUTH_EVIDENCE, middlewareGuards } from '../helpers/auth.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';

/**
 * Admin screens are the highest-value page in a small app and the one most
 * often protected only by "nobody knows the URL". We check the page, its
 * layouts, and the middleware before saying anything.
 */

const ADMIN_ROUTE =
  /(^|\/)(?:src\/)?(?:app|pages)\/(?:\([\w-]+\)\/)?admin(?:\/|\/.*\/)?(page|index|route|layout)\.[jt]sx?$/;

/** A layout above the page can hold the check for everything under it. */
const ADMIN_LAYOUT = /(^|\/)(?:src\/)?(?:app)\/(?:\([\w-]+\)\/)?admin(?:\/.*)?\/layout\.[jt]sx?$/;

export const adminRouteUnprotected: Rule = {
  id: 'admin-route-unprotected',
  ruleClass: 'auth',
  defaultSeverity: 'high',
  maxConfidence: 'likely',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const sources = ctx.files
      .list(SOURCE_GLOBS)
      .filter((f) => isAnalysableSource(f.path))
      .map((f) => ({ path: f.path, content: ctx.files.read(f.path) }));

    if (middlewareGuards(sources, /admin/)) return [];

    const layoutsWithAuth = sources.filter(
      (f) => ADMIN_LAYOUT.test(f.path) && AUTH_EVIDENCE.test(f.content),
    );
    if (layoutsWithAuth.length > 0) return [];

    const out: DetectedFinding[] = [];
    for (const file of sources) {
      if (!ADMIN_ROUTE.test(file.path)) continue;
      if (ADMIN_LAYOUT.test(file.path)) continue; // reported through its pages, not twice
      if (AUTH_EVIDENCE.test(file.content)) continue;

      out.push({
        confidence: 'likely',
        evidence: {
          kind: 'absence',
          note: { key: 'admin-route-unprotected.no-check', vars: { file: file.path } },
        },
        vars: { file: file.path },
      });
    }
    return out;
  },
};
