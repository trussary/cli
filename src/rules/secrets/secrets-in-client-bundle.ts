import type { DetectedFinding, Rule } from '../types.js';
import { shannon } from '../helpers/entropy.js';
import { redactLine, trimExcerpt } from '../helpers/redact.js';
import {
  isPlaceholderSecret,
  KNOWN_PUBLIC_ENV_NAMES,
  KNOWN_PUBLIC_PREFIXES,
  SECRET_PATTERNS,
  SUPABASE_ANON_JWT,
} from '../helpers/secret-patterns.js';

/** Files that ship to the browser: client source + built output. */
const CLIENT_GLOBS = [
  'src/**/*.{ts,tsx,js,jsx,mjs,cjs,vue,svelte}',
  'app/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'pages/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'components/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'lib/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'dist/**/*.js',
  'build/**/*.js',
  '.next/static/**/*.js',
];

/**
 * Paths that run on the server even though they live under the client globs.
 * A secret here is still worth a look, but it is NOT "in your public files" —
 * skip to avoid the false positive that kills trust on the first run.
 */
const SERVER_ONLY_HINT =
  /(^|\/)(api|server|functions|edge-functions|supabase\/functions)(\/|$)|\.server\.[jt]sx?$|(^|\/)(middleware|instrumentation)\.[jt]s$/;

const PUBLIC_PREFIX_SECRET_NAME =
  /(?:VITE_|NEXT_PUBLIC_)([A-Z0-9_]*(?:SECRET|SERVICE_ROLE|SERVICE_KEY|PRIVATE|API_KEY|ACCESS_TOKEN)[A-Z0-9_]*)/;

const SUSPICIOUS_ASSIGNMENT =
  /(?:secret|token|password|api[_-]?key|private[_-]?key)['"]?\s*[:=]\s*['"]([A-Za-z0-9+/=_-]{24,})['"]/i;

function isKnownPublic(text: string, match: string): boolean {
  if (KNOWN_PUBLIC_PREFIXES.some((re) => re.test(match))) return true;
  if (SUPABASE_ANON_JWT.test(match)) return true;
  for (const name of KNOWN_PUBLIC_ENV_NAMES) {
    if (text.includes(name)) return true;
  }
  return false;
}

export const secretsInClientBundle: Rule = {
  id: 'secrets-in-client-bundle',
  ruleClass: 'secrets',
  defaultSeverity: 'critical',
  maxConfidence: 'certain',
  inputs: { globs: CLIENT_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];
    for (const file of ctx.files.list(CLIENT_GLOBS)) {
      const serverSide = SERVER_ONLY_HINT.test(file.path);
      if (serverSide) continue;
      const lines = ctx.files.lines(file.path);
      for (let i = 0; i < lines.length; i++) {
        const text = lines[i] as string;
        if (text.length > 5_000) continue; // minified single-line noise guard for heuristics below

        // Branch 1 — known provider secret literal: certain.
        let matched = false;
        for (const pat of SECRET_PATTERNS) {
          const m = pat.regex.exec(text);
          if (m && !isKnownPublic(text, m[0]) && !isPlaceholderSecret(m[0])) {
            out.push({
              severity: 'critical',
              confidence: 'certain',
              evidence: {
                kind: 'file',
                path: file.path,
                line: i + 1,
                column: m.index,
                excerpt: redactLine(text, m[0]),
              },
              vars: { provider: pat.provider, file: file.path, line: i + 1 },
            });
            matched = true;
            break;
          }
        }
        if (matched) continue;

        // Branch 2 — framework-public env var with a secret-looking NAME: likely.
        const pub = PUBLIC_PREFIX_SECRET_NAME.exec(text);
        if (pub && !KNOWN_PUBLIC_ENV_NAMES.has(pub[0])) {
          out.push({
            severity: 'critical',
            confidence: 'likely',
            evidence: {
              kind: 'file',
              path: file.path,
              line: i + 1,
              column: pub.index,
              excerpt: trimExcerpt(text),
            },
            vars: {
              provider: (pub[1] as string).replace(/_KEY$/, ''),
              file: file.path,
              line: i + 1,
            },
          });
          continue;
        }

        // Branch 3 — high-entropy value on a suspicious identifier: possible.
        const asn = SUSPICIOUS_ASSIGNMENT.exec(text);
        if (asn) {
          const value = asn[1] as string;
          if (
            shannon(value) > 4.0 &&
            !isKnownPublic(text, value) &&
            !/^data:/.test(value) &&
            !text.includes('process.env') &&
            !text.includes('import.meta.env')
          ) {
            out.push({
              severity: 'high',
              confidence: 'possible',
              evidence: {
                kind: 'file',
                path: file.path,
                line: i + 1,
                column: asn.index,
                excerpt: redactLine(text, value),
              },
              vars: { provider: 'unknown', file: file.path, line: i + 1 },
            });
          }
        }
      }
    }
    return out;
  },
};
