import type { DetectedFinding, Rule } from '../types.js';
import { redactLine } from '../helpers/redact.js';

/**
 * The .env file served over HTTP. Every key in it is public from the moment
 * this returns 200 — which is why the fix is rotation, not deletion.
 */

const ENV_SHAPED = /^[A-Z][A-Z0-9_]{2,}\s*=\s*\S+/m;

export const envExposedLive: Rule = {
  id: 'env-exposed',
  ruleClass: 'secrets',
  defaultSeverity: 'critical',
  maxConfidence: 'certain',
  inputs: { live: true },

  async detect(ctx): Promise<DetectedFinding[]> {
    const http = ctx.http();
    let res;
    try {
      res = await http.get('/.env');
    } catch {
      return [];
    }
    if (res.status !== 200) return [];
    // A single-page app answers 200 with its HTML for every unknown path.
    if (/<html|<!doctype/i.test(res.body.slice(0, 200))) return [];
    if (!ENV_SHAPED.test(res.body)) return [];

    const firstLine = res.body.split(/\r?\n/).find((l) => ENV_SHAPED.test(l)) ?? '';
    const name = firstLine.split('=')[0] ?? '';
    const value = firstLine.slice(name.length + 1);

    return [
      {
        confidence: 'certain',
        evidence: {
          kind: 'http',
          url: res.url,
          method: 'GET',
          status: res.status,
          snippet: redactLine(firstLine, value.trim()),
        },
        vars: { url: res.url, name: name.trim() },
      },
    ];
  },
};
