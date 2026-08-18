import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, isNextApiRoute, isServerPath, SOURCE_GLOBS } from '../helpers/paths.js';
import { DB_USAGE, isPublicByDesign } from '../helpers/auth.js';
import {
  BODY_AUTHENTICATED,
  MANUAL_VALIDATION,
  READS_REQUEST_BODY,
  VALIDATION_LIBRARY,
  WRITES_DATA,
} from '../helpers/limits.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * An endpoint that takes the caller's body and writes it, with nothing in the
 * file that looks at the shape of what arrived.
 *
 * Validation also lives in database constraints and ORM schemas, which a file
 * scan cannot read — so this is medium/possible, requires an actual write from
 * an actual request body, and stays quiet if any hand-written check is present.
 */
export const writeEndpointNoValidation: Rule = {
  id: 'write-endpoint-no-validation',
  ruleClass: 'input',
  defaultSeverity: 'medium',
  maxConfidence: 'possible',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      if (!isNextApiRoute(file.path) && !isServerPath(file.path)) continue;
      // Webhooks take an unvalidated body by nature; their real finding is the
      // missing signature check, reported by the rule that understands it.
      if (isPublicByDesign(file.path)) continue;

      const content = ctx.files.read(file.path);
      if (!READS_REQUEST_BODY.test(content) || !WRITES_DATA.test(content)) continue;
      if (!DB_USAGE.test(content)) continue; // it must be data, not an outbound API call
      if (VALIDATION_LIBRARY.test(content) || MANUAL_VALIDATION.test(content)) continue;
      if (BODY_AUTHENTICATED.test(content)) continue;

      const lines = ctx.files.lines(file.path);
      const idx = lines.findIndex((l) => WRITES_DATA.test(l));

      out.push({
        confidence: 'possible',
        evidence: {
          kind: 'file',
          path: file.path,
          line: idx + 1,
          excerpt: trimExcerpt(lines[idx] as string),
        },
        vars: { file: file.path, line: idx + 1 },
      });
    }
    return out;
  },
};
