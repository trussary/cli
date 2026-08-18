import { describe, expect, it } from 'vitest';
import { ruleBundles } from '../src/i18n/catalog.js';
import { engineMessages } from '../src/i18n/messages.js';
import { rules } from '../src/rules/registry.js';
import { LOCALES } from '../src/i18n/types.js';

const FIELDS = ['title', 'why', 'how', 'check', 'fixedWhen'] as const;

/** Present or absent is a choice; present in one locale only is a gap. */
const OPTIONAL_FIELDS = ['beforeApplying', 'doNotApplyIf'] as const;

function placeholders(s: string): string[] {
  return [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1] as string).sort();
}

describe('i18n parity', () => {
  it('every registered rule has a message bundle', () => {
    expect(rules.filter((r) => !ruleBundles[r.id]).map((r) => r.id)).toEqual([]);
  });

  it('every bundle belongs to a registered rule', () => {
    const ids = new Set(rules.map((r) => r.id));
    expect(Object.keys(ruleBundles).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('every rule field is present and non-empty in every locale', () => {
    const gaps: string[] = [];
    for (const [id, bundle] of Object.entries(ruleBundles)) {
      for (const locale of LOCALES) {
        for (const field of FIELDS) {
          const value = bundle[locale][field];
          if (typeof value !== 'string' || value.trim() === '') {
            gaps.push(`${id}.${field}.${locale}`);
          }
        }
      }
    }
    expect(gaps).toEqual([]);
  });

  it('notes keys match across locales', () => {
    const gaps: string[] = [];
    for (const [id, bundle] of Object.entries(ruleBundles)) {
      const en = Object.keys(bundle.en.notes ?? {}).sort();
      const vi = Object.keys(bundle.vi.notes ?? {}).sort();
      if (en.join(',') !== vi.join(',')) gaps.push(`${id}: en[${en}] vs vi[${vi}]`);
    }
    expect(gaps).toEqual([]);
  });

  it('interpolation placeholders match across locales', () => {
    const gaps: string[] = [];
    for (const [id, bundle] of Object.entries(ruleBundles)) {
      for (const field of FIELDS) {
        const en = placeholders(bundle.en[field]);
        const vi = placeholders(bundle.vi[field]);
        if (en.join(',') !== vi.join(',')) gaps.push(`${id}.${field}: en[${en}] vs vi[${vi}]`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('optional fix-block copy is written in both locales or neither', () => {
    const gaps: string[] = [];
    for (const [id, bundle] of Object.entries(ruleBundles)) {
      for (const field of OPTIONAL_FIELDS) {
        const en = bundle.en[field];
        const vi = bundle.vi[field];
        if (Boolean(en) !== Boolean(vi)) gaps.push(`${id}.${field}`);
        if (en && vi && placeholders(en).join(',') !== placeholders(vi).join(',')) {
          gaps.push(`${id}.${field} placeholders`);
        }
      }
    }
    expect(gaps).toEqual([]);
  });

  it('engine messages exist in every locale', () => {
    expect(Object.keys(engineMessages.vi).sort()).toEqual(Object.keys(engineMessages.en).sort());
  });
});
