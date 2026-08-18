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
  /**
   * What the fix will disturb — sessions dropped, integrations to update,
   * a page that goes blank until a policy is written. Optional, and present
   * exactly where a fix has a cost worth knowing before starting.
   */
  beforeApplying?: string;
  /** When this advice is the wrong advice for this project. Optional. */
  doNotApplyIf?: string;
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
