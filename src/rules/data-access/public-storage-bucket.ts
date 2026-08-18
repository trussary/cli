import type { DetectedFinding, Rule } from '../types.js';
import { migrationFiles } from '../helpers/supabase.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * A public bucket means every file in it is a URL anyone can open — no login,
 * no expiry, and the name is usually guessable. Fine for logos; not fine for
 * the passport photo someone uploaded to verify their account.
 *
 * Buckets can also be flipped public in the dashboard, so this caps at likely.
 */

/** insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) */
const BUCKET_INSERT = /insert\s+into\s+storage\.buckets/i;
const BUCKET_UPDATE_PUBLIC = /update\s+storage\.buckets\s+set\s+public\s*=\s*true/i;

/** supabase.storage.createBucket('name', { public: true }) */
const CREATE_BUCKET_PUBLIC = /createBucket\s*\(\s*["'](\w[\w-]*)["']\s*,\s*\{[^}]*public\s*:\s*true/;

const BUCKET_NAME = /["'](\w[\w-]*)["']/;

export const publicStorageBucket: Rule = {
  id: 'public-storage-bucket',
  ruleClass: 'data-access',
  defaultSeverity: 'high',
  maxConfidence: 'likely',
  inputs: { stacks: ['supabase'] },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    // SQL migrations: a bucket row inserted or updated with public = true.
    for (const file of migrationFiles(ctx.files)) {
      const lines = ctx.files.lines(file.path);
      for (let i = 0; i < lines.length; i++) {
        const text = lines[i] as string;
        const isInsert = BUCKET_INSERT.test(text);
        if (!isInsert && !BUCKET_UPDATE_PUBLIC.test(text)) continue;

        // The value list often sits on the lines just below the insert.
        const window = [text, lines[i + 1] ?? '', lines[i + 2] ?? ''].join(' ');
        if (isInsert && !/\btrue\b/i.test(window)) continue;

        const name = BUCKET_NAME.exec(window)?.[1] ?? 'a storage bucket';
        out.push({
          confidence: 'likely',
          evidence: { kind: 'file', path: file.path, line: i + 1, excerpt: trimExcerpt(text) },
          vars: { bucket: name, file: file.path, line: i + 1 },
        });
      }
    }

    // App code creating a bucket with public: true.
    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      if (!ctx.files.read(file.path).includes('createBucket')) continue;
      const lines = ctx.files.lines(file.path);
      for (let i = 0; i < lines.length; i++) {
        const m = CREATE_BUCKET_PUBLIC.exec(lines[i] as string);
        if (!m) continue;
        out.push({
          confidence: 'likely',
          evidence: {
            kind: 'file',
            path: file.path,
            line: i + 1,
            excerpt: trimExcerpt(lines[i] as string),
          },
          vars: { bucket: m[1] as string, file: file.path, line: i + 1 },
        });
      }
    }

    return out;
  },
};
