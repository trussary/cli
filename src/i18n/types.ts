/**
 * Message bundle contracts. One module per rule exports { en, vi } — both
 * required, so a rule cannot ship EN-only: the build fails without VI.
 */

export interface RuleMessages {
  /** Plain, concrete, no jargon. */
  title: string;
  /** Consequence-framed, 1–2 sentences. */
  why: string;
  /** Actionable, stack-specific. */
  how: string;
  /** A check a non-engineer can perform. */
  check: string;
  /** A verifiable end state, not an action. */
  fixedWhen: string;
  /** Extra keys (absence-evidence notes etc.), resolved as `<rule-id>.<key>`. */
  notes?: Record<string, string>;
}

export interface RuleBundle {
  en: RuleMessages;
  vi: RuleMessages;
}

export type Locale = 'en' | 'vi';

export const LOCALES: readonly Locale[] = ['en', 'vi'];

export function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}
