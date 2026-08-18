import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { RATE_LIMITER } from '../helpers/limits.js';

/**
 * Deliberately quiet: infrastructure limiters at Vercel, Cloudflare or your
 * auth provider are invisible to a file scan, so this ships at
 * medium/possible, says "in your code" out loud, and never fails CI at the
 * default gate.
 */

const AUTH_ENTRY_POINT =
  /signInWithPassword|signInWithOtp|signIn\s*\(|createUserWithEmailAndPassword|resetPasswordForEmail|\bbcrypt\s*\.\s*compare|passport\s*\.\s*authenticate|\/api\/(?:auth|login|signin|signup|register|reset)/;

export const noRateLimitAuth: Rule = {
  id: 'no-rate-limit-auth',
  ruleClass: 'money-abuse',
  defaultSeverity: 'medium',
  maxConfidence: 'possible',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const sources = ctx.files.list(SOURCE_GLOBS).filter((f) => isAnalysableSource(f.path));

    let entryPoint: { path: string; line: number } | undefined;
    for (const file of sources) {
      const content = ctx.files.read(file.path);
      // A limiter anywhere in the project is enough for us to stay quiet.
      if (RATE_LIMITER.test(content)) return [];
      if (entryPoint || !AUTH_ENTRY_POINT.test(content)) continue;
      const idx = ctx.files.lines(file.path).findIndex((l) => AUTH_ENTRY_POINT.test(l));
      entryPoint = { path: file.path, line: idx >= 0 ? idx + 1 : 1 };
    }

    if (!entryPoint) return [];

    return [
      {
        confidence: 'possible',
        evidence: {
          kind: 'absence',
          note: { key: 'no-rate-limit-auth.not-in-code', vars: { file: entryPoint.path } },
        },
        vars: { file: entryPoint.path, line: entryPoint.line },
      },
    ];
  },
};
