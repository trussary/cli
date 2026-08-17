import type { Confidence, Severity } from '../rules/types.js';

export const SEVERITY_ORDER: readonly Severity[] = ['critical', 'high', 'medium', 'low'];

export const CONFIDENCE_ORDER: readonly Confidence[] = ['certain', 'likely', 'possible'];

export function severityRank(s: Severity): number {
  return SEVERITY_ORDER.indexOf(s);
}

export function confidenceRank(c: Confidence): number {
  return CONFIDENCE_ORDER.indexOf(c);
}

/** true when `s` is at least as severe as `min`. */
export function meetsMinSeverity(s: Severity, min: Severity): boolean {
  return severityRank(s) <= severityRank(min);
}

/** Clamp a claimed confidence to the rule's structural cap. */
export function clampConfidence(claimed: Confidence, max: Confidence): Confidence {
  return confidenceRank(claimed) < confidenceRank(max) ? max : claimed;
}

export function isSeverity(v: string): v is Severity {
  return (SEVERITY_ORDER as string[]).includes(v);
}

export function isConfidence(v: string): v is Confidence {
  return (CONFIDENCE_ORDER as string[]).includes(v);
}
