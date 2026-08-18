import type { DetectedFinding, Rule } from '../types.js';

/**
 * The .git directory served as static files. Whoever finds it can reconstruct
 * your entire repository — every file, every past version, and every secret
 * that was ever committed and later removed.
 *
 * One GET, one unambiguous answer: this is 'certain' or it is nothing.
 */

const GIT_HEAD = /^ref:\s*refs\/heads\/\S+|^[0-9a-f]{40}$/m;

export const gitExposedLive: Rule = {
  id: 'git-exposed',
  ruleClass: 'secrets',
  defaultSeverity: 'critical',
  maxConfidence: 'certain',
  inputs: { live: true },

  async detect(ctx): Promise<DetectedFinding[]> {
    const http = ctx.http();
    let res;
    try {
      res = await http.get('/.git/HEAD');
    } catch {
      return []; // unreachable is not a finding
    }
    if (res.status !== 200 || !GIT_HEAD.test(res.body.trim())) return [];

    return [
      {
        confidence: 'certain',
        evidence: {
          kind: 'http',
          url: res.url,
          method: 'GET',
          status: res.status,
          snippet: res.body.trim().slice(0, 60),
        },
        vars: { url: res.url },
      },
    ];
  },
};
