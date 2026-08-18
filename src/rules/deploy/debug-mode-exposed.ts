import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * Two shapes of the same mistake: development behaviour left switched on, and
 * error handlers that post the server's internal state back to the caller.
 * A stack trace names your files, your libraries and often your database.
 */

/** `res.json({ error: err.stack })`, `send(err.stack)`, `message: error.message` in a response. */
const TRACE_IN_RESPONSE =
  /\b(res|reply|response)\s*(?:\.\s*status\([^)]*\))?\s*\.\s*(?:json|send)\s*\(\s*[^)]*\b(?:err|error|e)\s*\.\s*(stack|message)\b/;

/** NextResponse.json({ error: err.stack }) — the app-router form. */
const TRACE_IN_NEXT_RESPONSE =
  /NextResponse\s*\.\s*json\s*\(\s*[^)]*\b(?:err|error|e)\s*\.\s*(stack|message)\b/;

/** Hard-coded development switches that survive into a deployed build. */
const DEBUG_FLAG_ON =
  /\b(debug\s*:\s*true|DEBUG\s*=\s*(?:true|1|'\*'|"\*")|NODE_ENV\s*[:=]\s*['"]development['"]|app\.set\(\s*['"]env['"]\s*,\s*['"]development['"]\s*\)|NEXT_PUBLIC_DEBUG\s*[:=]\s*['"]?true)/;

/** Vite/Next/Express dev-only error pages wired unconditionally. */
const DEV_ERROR_MIDDLEWARE = /\brequire\(['"]errorhandler['"]\)|\bfrom\s+['"]errorhandler['"]/;

export const debugModeExposed: Rule = {
  id: 'debug-mode-exposed',
  ruleClass: 'deploy',
  defaultSeverity: 'medium',
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

        const trace = TRACE_IN_RESPONSE.test(text) || TRACE_IN_NEXT_RESPONSE.test(text);
        const flag = !trace && (DEBUG_FLAG_ON.test(text) || DEV_ERROR_MIDDLEWARE.test(text));
        if (!trace && !flag) continue;

        out.push({
          confidence: 'likely',
          evidence: {
            kind: 'file',
            path: file.path,
            line: i + 1,
            excerpt: trimExcerpt(text),
          },
          vars: {
            file: file.path,
            line: i + 1,
            kind: trace ? 'error-details' : 'debug-switch',
          },
        });
        break; // one per file — the pattern, not every instance of it
      }
    }
    return out;
  },
};
