import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * A literal `*` in an Access-Control-Allow-Origin is not a heuristic — it is
 * the setting itself, in your code. That is why this rule may say 'certain'.
 *
 * Paired with credentials it is worse than it looks: browsers refuse the
 * combination, so people "fix" it by reflecting the caller's origin instead,
 * which allows every site.
 */

const WILDCARD_ACAO =
  /['"`]?Access-Control-Allow-Origin['"`]?\s*[:,]\s*['"`]\*['"`]/i;

/** cors({ origin: '*' }) / cors({ origin: true }) — the express middleware form. */
const CORS_OPTION_WILDCARD = /origin\s*:\s*(?:['"`]\*['"`]|true)/;

/** Bare cors() with no options allows every origin by default. */
const BARE_CORS_USE = /\buse\(\s*cors\(\s*\)\s*\)/;

const CREDENTIALS_ON =
  /(Access-Control-Allow-Credentials['"`]?\s*[:,]\s*['"`]?true|credentials\s*:\s*true|withCredentials\s*:\s*true)/i;

export const wildcardCors: Rule = {
  id: 'wildcard-cors',
  ruleClass: 'deploy',
  defaultSeverity: 'high',
  maxConfidence: 'certain',
  inputs: { globs: [...SOURCE_GLOBS, 'vercel.json', 'netlify.toml'] },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];
    const files = [
      ...ctx.files.list(SOURCE_GLOBS).filter((f) => isAnalysableSource(f.path)),
      ...ctx.files.list(['vercel.json', 'netlify.toml']),
    ];

    for (const file of files) {
      const content = ctx.files.read(file.path);
      if (!/Access-Control-Allow-Origin|\bcors\b/i.test(content)) continue;
      const credentials = CREDENTIALS_ON.test(content);
      const lines = ctx.files.lines(file.path);

      for (let i = 0; i < lines.length; i++) {
        const text = lines[i] as string;
        const literal = WILDCARD_ACAO.test(text) || CORS_OPTION_WILDCARD.test(text);
        const bare = BARE_CORS_USE.test(text);
        if (!literal && !bare) continue;

        out.push({
          severity: credentials ? 'critical' : 'high',
          confidence: literal ? 'certain' : 'likely',
          evidence: {
            kind: 'file',
            path: file.path,
            line: i + 1,
            excerpt: trimExcerpt(text),
          },
          vars: {
            file: file.path,
            line: i + 1,
            credentials: credentials ? 'yes' : 'no',
          },
        });
        break; // one finding per file: the setting, not each mention of it
      }
    }
    return out;
  },
};
