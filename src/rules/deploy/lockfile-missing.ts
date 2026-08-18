import type { DetectedFinding, Rule } from '../types.js';
import { lockfileNames } from '../helpers/deps.js';

/**
 * No committed lockfile means every install resolves versions afresh — so the
 * code that runs in production is not the code you tested, and a package name
 * an AI invented can be registered by someone else and installed on your next
 * deploy. The absence of the file is directly observable, hence 'certain'.
 */
export const lockfileMissing: Rule = {
  id: 'lockfile-missing',
  ruleClass: 'deploy',
  defaultSeverity: 'medium',
  maxConfidence: 'certain',
  inputs: { globs: ['package.json'] },

  detect(ctx): DetectedFinding[] {
    if (!ctx.files.has('package.json')) return [];
    if (lockfileNames().some((name) => ctx.files.has(name))) return [];

    return [
      {
        confidence: 'certain',
        evidence: {
          kind: 'absence',
          note: { key: 'lockfile-missing.none-found', vars: { names: lockfileNames().join(', ') } },
        },
        vars: { names: lockfileNames().join(', ') },
      },
    ];
  },
};
