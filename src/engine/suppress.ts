import type { Evidence, FileSet, Finding } from '../rules/types.js';
import type { TrussaryConfig } from './config.js';

/**
 * Inline suppression:
 *   // trussary-ignore <rule-id> [reason]        — on the line above the finding
 *   // trussary-ignore-line <rule-id> [reason]   — on the finding's own line
 *
 * Suppressed findings are kept (marked), never deleted — silencing stays auditable.
 */

const IGNORE_RE = /(?:\/\/|#|\/\*|<!--)\s*trussary-ignore(-line)?\s+([a-z0-9-]+)(?:\s+(.*?))?\s*(?:\*\/|-->)?\s*$/;

interface InlineSuppression {
  ruleId: string;
  reason?: string;
}

function parseLine(text: string): { sameLine: boolean; s: InlineSuppression } | undefined {
  const m = IGNORE_RE.exec(text);
  if (!m) return undefined;
  const entry: InlineSuppression = { ruleId: m[2] as string };
  if (m[3]) entry.reason = m[3];
  return { sameLine: m[1] === '-line', s: entry };
}

function inlineSuppressed(
  files: FileSet,
  evidence: Evidence,
  ruleId: string,
): InlineSuppression | undefined {
  if (evidence.kind !== 'file') return undefined;
  const lines = files.lines(evidence.path);
  // Same line
  const own = lines[evidence.line - 1];
  if (own !== undefined) {
    const p = parseLine(own);
    if (p && p.sameLine && p.s.ruleId === ruleId) return p.s;
  }
  // Line above
  const above = lines[evidence.line - 2];
  if (above !== undefined) {
    const p = parseLine(above);
    if (p && !p.sameLine && p.s.ruleId === ruleId) return p.s;
  }
  return undefined;
}

/** Mutates findings in place, marking suppressed ones. */
export function applySuppression(
  findings: Finding[],
  files: FileSet,
  config: TrussaryConfig,
): void {
  for (const f of findings) {
    const rc = config.rules[f.id];
    if (rc === false) {
      f.suppressed = { by: 'rc' };
      continue;
    }
    const inline = inlineSuppressed(files, f.evidence, f.id);
    if (inline) {
      f.suppressed = inline.reason ? { by: 'inline', reason: inline.reason } : { by: 'inline' };
    }
  }
}
