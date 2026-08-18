import type { DetectedFinding, Rule } from '../types.js';
import { fetchCriticalAdvisories } from '../../live/advisories.js';
import { resolveDirectDependencies } from '../helpers/deps.js';

/**
 * Critical advisories only, direct dependencies only. Anything less severe is
 * noise for someone who did not choose these packages by hand, and a scanner
 * that cries wolf gets ignored on the day it is right.
 *
 * Needs the npm registry. `--offline` skips it; an unreachable registry is
 * silence, never a finding.
 */
export const depKnownAdvisories: Rule = {
  id: 'dep-known-advisories',
  ruleClass: 'deploy',
  defaultSeverity: 'high',
  maxConfidence: 'certain',
  inputs: { globs: ['package.json'] },

  async detect(ctx): Promise<DetectedFinding[]> {
    if (ctx.scan.offline) return [];

    const installed = resolveDirectDependencies(ctx.files, ctx.scan.packageJson);
    const advisories = await fetchCriticalAdvisories(installed);
    if (!advisories || advisories.length === 0) return [];

    const lines = ctx.files.lines('package.json');
    const out: DetectedFinding[] = [];

    for (const a of advisories) {
      const idx = lines.findIndex((l) => l.includes(`"${a.name}"`));
      out.push({
        confidence: 'certain',
        evidence: {
          kind: 'file',
          path: 'package.json',
          line: idx >= 0 ? idx + 1 : 1,
          excerpt: `${a.name}@${a.version} — ${a.title}`,
        },
        vars: {
          package: a.name,
          version: a.version,
          title: a.title,
          url: a.url,
          fixedIn: a.vulnerableVersions,
        },
      });
    }
    return out;
  },
};
