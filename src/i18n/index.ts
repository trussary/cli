import type { Msg } from '../rules/types.js';
import { ruleBundles } from './catalog.js';
import { engineMessages } from './messages.js';
import type { Locale, RuleMessages } from './types.js';

const RULE_FIELDS = new Set(['title', 'why', 'how', 'check', 'fixedWhen']);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

function lookupRule(ruleId: string, field: string, locale: Locale): string | undefined {
  const bundle = ruleBundles[ruleId];
  if (!bundle) return undefined;
  const messages: RuleMessages = bundle[locale] ?? bundle.en;
  if (RULE_FIELDS.has(field)) {
    return messages[field as keyof Omit<RuleMessages, 'notes'>];
  }
  return messages.notes?.[field] ?? bundle.en.notes?.[field];
}

function lookupEngine(key: string, locale: Locale): string | undefined {
  return engineMessages[locale][key] ?? engineMessages.en[key];
}

/**
 * Resolve a message key in the given locale. Keys are either
 * `engine.<name>` or `<rule-id>.<field>`. Fallback: locale → en → raw key.
 */
export function t(key: string, vars: Record<string, string | number> | undefined, locale: Locale): string {
  let resolved: string | undefined;
  if (key.startsWith('engine.')) {
    resolved = lookupEngine(key, locale);
  } else {
    const dot = key.lastIndexOf('.');
    if (dot > 0) {
      resolved = lookupRule(key.slice(0, dot), key.slice(dot + 1), locale);
    }
  }
  return interpolate(resolved ?? key, vars);
}

export function tm(msg: Msg, locale: Locale): string {
  return t(msg.key, msg.vars, locale);
}

export { isLocale, LOCALES } from './types.js';
export type { Locale } from './types.js';
export { ruleBundles } from './catalog.js';
