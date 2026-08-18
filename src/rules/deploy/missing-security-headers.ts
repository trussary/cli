import type { DetectedFinding, Rule } from '../types.js';
import { SOURCE_GLOBS } from '../helpers/paths.js';

/**
 * Static-only view: we read your config and code. Headers set at the CDN or
 * host dashboard are invisible to a file scan, so this rule caps at 'likely'
 * and its wording says exactly where we looked. The live rule
 * `security-headers` is what upgrades the same question to 'certain'.
 */

const HEADER_NAMES =
  /(Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Referrer-Policy|Permissions-Policy)/i;

/** Frameworks and middleware that set a sensible set for you. */
const HEADER_LIBRARIES = /\b(helmet|nosniff|next-safe|@next-safe\/middleware)\b/;

const CONFIG_GLOBS = [
  'next.config.{js,mjs,cjs,ts}',
  'vercel.json',
  'netlify.toml',
  'public/_headers',
  '_headers',
  'nginx.conf',
  'Caddyfile',
  'middleware.{js,ts}',
  'src/middleware.{js,ts}',
];

export const missingSecurityHeaders: Rule = {
  id: 'missing-security-headers',
  ruleClass: 'deploy',
  defaultSeverity: 'medium',
  maxConfidence: 'likely',
  inputs: { stacks: ['next', 'vite-react', 'vercel', 'express'] },

  detect(ctx): DetectedFinding[] {
    const candidates = [
      ...ctx.files.list(CONFIG_GLOBS),
      ...ctx.files.list(SOURCE_GLOBS).filter((f) => /middleware|server|app\.[jt]s$|index\.[jt]s$/.test(f.path)),
    ];

    for (const file of candidates) {
      const content = ctx.files.read(file.path);
      if (HEADER_NAMES.test(content) || HEADER_LIBRARIES.test(content)) return [];
    }

    return [
      {
        confidence: 'likely',
        evidence: {
          kind: 'absence',
          note: { key: 'missing-security-headers.looked-in', vars: { count: candidates.length } },
        },
        vars: { count: candidates.length },
      },
    ];
  },
};
