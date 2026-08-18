import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * The signing secret is the whole of the security in a JWT: anyone who knows
 * it can mint a token that says they are anyone. Scaffolded code reaches for
 * a placeholder, and the placeholders are always the same handful of words.
 *
 * A literal in your code is directly observable, so this may say 'certain'.
 */

/** The placeholders that generated code keeps choosing. */
const WEAK_VALUES =
  /^(secret|secretkey|secret_key|supersecret|supersecretkey|supersecretjwt|jwtsecret|jwt_secret|mysecret|changeme|change_me|password|pass|test|dev|development|your-secret-key|your_secret_key|topsecret|shhhh+|123456|abc123|qwerty|token|key)$/i;

/** jwt.sign(payload, 'literal') / new SignJWT(...).sign('literal') */
const SIGN_WITH_LITERAL =
  /\b(?:jwt|jsonwebtoken)\s*\.\s*(?:sign|verify)\s*\([^,]*,\s*["']([^"']{1,64})["']/;

/** JWT_SECRET = 'literal' — including the process.env fallback form. */
const SECRET_ASSIGNMENT =
  /\b(?:JWT_SECRET|SESSION_SECRET|AUTH_SECRET|TOKEN_SECRET|NEXTAUTH_SECRET|COOKIE_SECRET|jwtSecret|sessionSecret)\b[^\n]*?(?:=|\|\|)\s*["']([^"']{1,64})["']/;

export const jwtWeakSecret: Rule = {
  id: 'jwt-weak-secret',
  ruleClass: 'auth',
  defaultSeverity: 'critical',
  maxConfidence: 'certain',
  inputs: { globs: [...SOURCE_GLOBS, '.env', '.env.*'] },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];
    const files = [
      ...ctx.files.list(SOURCE_GLOBS).filter((f) => isAnalysableSource(f.path)),
      ...ctx.files.list(['.env', '.env.*']),
    ];

    for (const file of files) {
      const content = ctx.files.read(file.path);
      if (!/secret|jwt/i.test(content)) continue;
      const lines = ctx.files.lines(file.path);

      for (let i = 0; i < lines.length; i++) {
        const text = lines[i] as string;
        const value =
          SIGN_WITH_LITERAL.exec(text)?.[1] ??
          SECRET_ASSIGNMENT.exec(text)?.[1] ??
          envAssignment(file.path, text);
        if (value === undefined) continue;

        const weak = WEAK_VALUES.test(value.trim()) || value.trim().length < 16;
        if (!weak) continue;

        out.push({
          confidence: 'certain',
          evidence: {
            kind: 'file',
            path: file.path,
            line: i + 1,
            excerpt: trimExcerpt(text),
          },
          vars: { file: file.path, line: i + 1, length: value.trim().length },
        });
        break; // one per file
      }
    }
    return out;
  },
};

/** JWT_SECRET=supersecret in a .env file (no quotes, no assignment operator spacing). */
function envAssignment(path: string, text: string): string | undefined {
  if (!/(^|\/)\.env/.test(path)) return undefined;
  const m = /^\s*(?:JWT|SESSION|AUTH|TOKEN|NEXTAUTH|COOKIE)_SECRET\s*=\s*["']?([^"'\s#]+)/.exec(text);
  return m?.[1];
}
