import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * A query built by gluing values into a string. The database cannot tell the
 * difference between the query you wrote and the query your visitor finished
 * writing for you.
 *
 * Regex-first in M1: we can see interpolation into a query call, but not
 * whether the value came from a request or from a constant two files away.
 * That gap is why this is 'likely' and not 'certain'.
 */

/** db.query(`... ${x} ...`) — template literal with a substitution. */
const TEMPLATE_INTERPOLATION =
  /\.\s*(?:query|execute|raw|unsafe|prepare|all|get|run)\s*\(\s*`[^`]*\$\{/;

/** db.query('... ' + x + ' ...') — concatenation. */
const CONCAT_INTERPOLATION =
  /\.\s*(?:query|execute|raw|unsafe|prepare|all|get|run)\s*\(\s*(?:'[^']*'|"[^"]*")\s*\+/;

/** A bare SQL string assembled by hand, then handed to something. */
const SQL_TEMPLATE_ASSEMBLY =
  /`\s*(?:select|insert\s+into|update|delete\s+from)\b[^`]*\$\{/i;

/**
 * Tagged templates (sql`select ... ${id}`) are the safe form — the library
 * parameterises them. Only the raw-string variants above are findings.
 */
const SAFE_TAGGED_TEMPLATE = /\b(?:sql|db|prisma)\s*`/;

export const sqlStringInterpolation: Rule = {
  id: 'sql-string-interpolation',
  ruleClass: 'input',
  defaultSeverity: 'high',
  maxConfidence: 'likely',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      const lines = ctx.files.lines(file.path);

      for (let i = 0; i < lines.length; i++) {
        const text = lines[i] as string;
        if (text.length > 2_000) continue;

        const hit =
          TEMPLATE_INTERPOLATION.test(text) ||
          CONCAT_INTERPOLATION.test(text) ||
          (SQL_TEMPLATE_ASSEMBLY.test(text) && !SAFE_TAGGED_TEMPLATE.test(text));
        if (!hit) continue;

        out.push({
          confidence: 'likely',
          evidence: {
            kind: 'file',
            path: file.path,
            line: i + 1,
            excerpt: trimExcerpt(text),
          },
          vars: { file: file.path, line: i + 1 },
        });
      }
    }
    return out;
  },
};
