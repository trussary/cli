import { describe, expect, it } from 'vitest';
import { VI_ANCHORS } from '../src/i18n/anchors.js';
import { ruleBundles } from '../src/i18n/catalog.js';
import { rules } from '../src/rules/registry.js';

/**
 * The co-writing standard, enforced. Vietnamese explains; the English
 * technical terms stay put, because those are the words the reader will search
 * for and the words their dashboard uses.
 */
function viText(id: string): string {
  const b = ruleBundles[id];
  if (!b) return '';
  const notes = Object.values(b.vi.notes ?? {}).join(' ');
  return [b.vi.title, b.vi.why, b.vi.how, b.vi.check, b.vi.fixedWhen, notes].join(' ');
}

describe('VI anchor lint', () => {
  it('every registered rule declares its anchors', () => {
    const missing = rules.filter((r) => !VI_ANCHORS[r.id]).map((r) => r.id);
    expect(missing).toEqual([]);
  });

  it('every anchor survives into the Vietnamese bundle', () => {
    const gaps: string[] = [];
    for (const rule of rules) {
      const text = viText(rule.id).toLowerCase();
      for (const anchor of VI_ANCHORS[rule.id] ?? []) {
        if (!text.includes(anchor.toLowerCase())) gaps.push(`${rule.id}: "${anchor}"`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('does not declare anchors for rules that no longer exist', () => {
    const ids = new Set(rules.map((r) => r.id));
    expect(Object.keys(VI_ANCHORS).filter((id) => !ids.has(id))).toEqual([]);
  });
});
