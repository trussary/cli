import { execFileSync } from 'node:child_process';
import type { DetectedFinding, Rule } from '../types.js';
import { isPlaceholderSecret, SECRET_PATTERNS } from '../helpers/secret-patterns.js';

const ENV_FILE = /(^|\/)\.env(\.local|\.production|\.development)?$/;

/** .env.example / .env.sample are meant to be committed — only flag real values inside. */
const EXAMPLE_ENV = /(^|\/)\.env\.(example|sample|template)$/;

/** A committed template holding a real key, not a description of one. */
function looksLikeRealValue(line: string): boolean {
  if (/^\s*#/.test(line)) return false;
  for (const pattern of SECRET_PATTERNS) {
    const m = pattern.regex.exec(line);
    if (m && !isPlaceholderSecret(m[0])) return true;
  }
  return false;
}

function gitTrackedFiles(root: string): Set<string> | undefined {
  try {
    const out = execFileSync('git', ['ls-files'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 10_000,
      windowsHide: true,
      // git complains to stderr when this is not a repository; that is an
      // answer, not an error the user should have to read.
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return new Set(out.split('\n').filter(Boolean));
  } catch {
    return undefined; // git absent or not a repo — rule degrades below
  }
}

export const envCommittedToGit: Rule = {
  id: 'env-committed-to-git',
  ruleClass: 'secrets',
  defaultSeverity: 'critical',
  maxConfidence: 'certain',
  inputs: {},

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];
    const tracked = gitTrackedFiles(ctx.scan.root);

    for (const file of ctx.files.list()) {
      const base = file.path;

      // Real .env files: flag when git tracks them.
      if (ENV_FILE.test(base) && !EXAMPLE_ENV.test(base)) {
        if (tracked?.has(base)) {
          out.push({
            severity: 'critical',
            confidence: 'certain',
            evidence: {
              kind: 'file',
              path: base,
              line: 1,
              excerpt: `git ls-files lists ${base} — it is part of your repository history`,
            },
            vars: { file: base },
          });
        } else if (tracked === undefined) {
          // git unavailable: we can see the file exists but not whether it's committed.
          out.push({
            severity: 'high',
            confidence: 'possible',
            evidence: {
              kind: 'absence',
              note: { key: 'env-committed-to-git.git-unavailable', vars: { file: base } },
            },
            vars: { file: base },
          });
        }
        continue;
      }

      // Example env files with what looks like a real secret pasted in.
      if (EXAMPLE_ENV.test(base)) {
        const lines = ctx.files.lines(base);
        for (let i = 0; i < lines.length; i++) {
          if (looksLikeRealValue(lines[i] as string)) {
            out.push({
              severity: 'critical',
              confidence: 'likely',
              evidence: {
                kind: 'file',
                path: base,
                line: i + 1,
                excerpt: `${base} is a template meant to be committed, but this line holds what looks like a real key`,
              },
              vars: { file: base },
            });
            break;
          }
        }
      }
    }
    return out;
  },
};
