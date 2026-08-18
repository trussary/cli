import type { DetectedFinding, Rule } from '../types.js';

/**
 * The same question as missing-security-headers, asked of the deployed site
 * instead of the config. Because the answer comes from the response itself,
 * this one may say 'certain' — and it is right even when the headers are set
 * somewhere a file scan could never see.
 */

const EXPECTED = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
];

export const securityHeadersLive: Rule = {
  id: 'security-headers',
  ruleClass: 'deploy',
  defaultSeverity: 'medium',
  maxConfidence: 'certain',
  inputs: { live: true },

  async detect(ctx): Promise<DetectedFinding[]> {
    const http = ctx.http();
    let res;
    try {
      res = await http.get('/');
    } catch {
      return [];
    }
    if (res.status >= 500) return []; // a broken site tells us nothing about headers

    const missing = EXPECTED.filter((header) => {
      if (res.headers[header]) return false;
      // A report-only CSP counts as present: it is deliberate, just weaker.
      if (header === 'content-security-policy') {
        return !res.headers['content-security-policy-report-only'];
      }
      return true;
    });
    if (missing.length === 0) return [];

    return [
      {
        confidence: 'certain',
        evidence: {
          kind: 'http',
          url: res.url,
          method: 'GET',
          status: res.status,
          header: `missing: ${missing.join(', ')}`,
        },
        vars: { url: res.url, missing: missing.join(', '), count: missing.length },
      },
    ];
  },
};
