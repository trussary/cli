import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Confidence, Severity } from '../rules/types.js';
import { isConfidence, isSeverity } from './severity.js';

export interface RuleOverride {
  severity?: Severity;
  minConfidence?: Confidence;
}

export interface TrussaryConfig {
  ignore: string[];
  rules: Record<string, RuleOverride | false>;
  minSeverity?: Severity;
  /** Populated with unknown/invalid entries for warning output. */
  warnings: string[];
  /** Path the config was loaded from, if any. */
  source?: string;
}

export const EMPTY_CONFIG: TrussaryConfig = { ignore: [], rules: {}, warnings: [] };

const RC_NAMES = ['.trussaryrc', '.trussaryrc.json'];

/** Walk up from `start` to the filesystem root; first rc file wins. */
export function loadConfig(start: string, knownRuleIds: ReadonlySet<string>): TrussaryConfig {
  let dir = path.resolve(start);
  for (;;) {
    for (const name of RC_NAMES) {
      const candidate = path.join(dir, name);
      if (existsSync(candidate)) return parseConfig(candidate, knownRuleIds);
    }
    const parent = path.dirname(dir);
    if (parent === dir) return { ...EMPTY_CONFIG, warnings: [] };
    dir = parent;
  }
}

export function parseConfig(file: string, knownRuleIds: ReadonlySet<string>): TrussaryConfig {
  const cfg: TrussaryConfig = { ignore: [], rules: {}, warnings: [], source: file };
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    cfg.warnings.push(`could not parse ${file}: ${(err as Error).message}`);
    return cfg;
  }
  if (typeof raw !== 'object' || raw === null) {
    cfg.warnings.push(`${file} must contain a JSON object`);
    return cfg;
  }
  const obj = raw as Record<string, unknown>;

  if (Array.isArray(obj['ignore'])) {
    cfg.ignore = obj['ignore'].filter((g): g is string => typeof g === 'string');
  }

  if (typeof obj['minSeverity'] === 'string') {
    if (isSeverity(obj['minSeverity'])) cfg.minSeverity = obj['minSeverity'];
    else cfg.warnings.push(`unknown minSeverity "${obj['minSeverity']}"`);
  }

  const rules = obj['rules'];
  if (typeof rules === 'object' && rules !== null) {
    for (const [id, val] of Object.entries(rules as Record<string, unknown>)) {
      if (!knownRuleIds.has(id)) {
        cfg.warnings.push(`unknown rule id "${id}" in ${path.basename(file)} — typo?`);
        continue;
      }
      if (val === false) {
        cfg.rules[id] = false;
        continue;
      }
      if (typeof val === 'object' && val !== null) {
        const o = val as Record<string, unknown>;
        const override: RuleOverride = {};
        if (typeof o['severity'] === 'string') {
          if (isSeverity(o['severity'])) override.severity = o['severity'];
          else cfg.warnings.push(`unknown severity "${o['severity']}" for rule "${id}"`);
        }
        if (typeof o['minConfidence'] === 'string') {
          if (isConfidence(o['minConfidence'])) override.minConfidence = o['minConfidence'];
          else cfg.warnings.push(`unknown minConfidence "${o['minConfidence']}" for rule "${id}"`);
        }
        cfg.rules[id] = override;
      }
    }
  }
  return cfg;
}
