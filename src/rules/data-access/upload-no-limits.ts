import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * An upload path with no stated limit on size or type. Limits can also live in
 * the bucket settings, in your host's request cap, or in a proxy — none of
 * which a file scan can see. So: 'possible', and wording that says
 * "we found none in your code" rather than "you have none".
 */

const UPLOAD_CALL =
  /\.(?:storage\s*\.\s*from\s*\([^)]*\)\s*\.\s*upload|upload)\s*\(|\bmulter\s*\(|\bformidable\s*\(|\bbusboy\s*\(|\breq\.files?\b|\bformData\.get\s*\(\s*["'][^"']*file/i;

/** Any stated constraint on what may be uploaded. */
const HAS_LIMIT =
  /\b(fileSize|maxFileSize|limits\s*:|allowedMimeTypes|fileFilter|accept\s*[:=]|contentType|mimetype|\.size\s*[<>]|MAX_(?:FILE|UPLOAD)_SIZE|maxSize)\b/i;

export const uploadNoLimits: Rule = {
  id: 'upload-no-limits',
  ruleClass: 'data-access',
  defaultSeverity: 'medium',
  maxConfidence: 'possible',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      const content = ctx.files.read(file.path);
      if (!UPLOAD_CALL.test(content)) continue;
      if (HAS_LIMIT.test(content)) continue; // a limit anywhere in this file is enough to stay quiet

      const lines = ctx.files.lines(file.path);
      const idx = lines.findIndex((l) => UPLOAD_CALL.test(l));
      if (idx < 0) continue;

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
