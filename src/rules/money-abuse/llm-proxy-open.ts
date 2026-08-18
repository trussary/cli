import type { DetectedFinding, Rule } from '../types.js';
import { AUTH_EVIDENCE } from '../helpers/auth.js';
import { isAnalysableSource, isNextApiRoute, isServerPath, SOURCE_GLOBS } from '../helpers/paths.js';
import { RATE_LIMITER } from '../helpers/limits.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * An endpoint that spends your model credits for anyone who calls it. This is
 * the single most expensive mistake in this catalog: it does not leak data, it
 * just bills you, quietly, until the card declines.
 *
 * We can see that the handler never checks a caller and never mentions a
 * limiter. We cannot see a gateway in front of it — hence 'likely'.
 */

const LLM_CALL =
  /api\.(?:openai|anthropic)\.com|['"](?:openai|@anthropic-ai\/sdk|@ai-sdk\/[\w-]+|ai)['"]|\bnew\s+(?:OpenAI|Anthropic)\s*\(|\b(?:generateText|streamText|generateObject)\s*\(|\.chat\.completions\.create\s*\(|\.messages\.create\s*\(/;

export const llmProxyOpen: Rule = {
  id: 'llm-proxy-open',
  ruleClass: 'money-abuse',
  defaultSeverity: 'critical',
  maxConfidence: 'likely',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      const isServer = isNextApiRoute(file.path) || isServerPath(file.path);
      if (!isServer) continue;

      const content = ctx.files.read(file.path);
      if (!LLM_CALL.test(content)) continue;
      if (AUTH_EVIDENCE.test(content)) continue;

      const lines = ctx.files.lines(file.path);
      const idx = lines.findIndex((l) => LLM_CALL.test(l));

      out.push({
        confidence: 'likely',
        evidence: {
          kind: 'file',
          path: file.path,
          line: idx + 1,
          excerpt: trimExcerpt(lines[idx] as string),
        },
        vars: {
          file: file.path,
          line: idx + 1,
          limiter: RATE_LIMITER.test(content) ? 'a rate limit is present' : 'no rate limit either',
        },
      });
    }
    return out;
  },
};
