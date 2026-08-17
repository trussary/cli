import { fdir } from 'fdir';
import { statSync } from 'node:fs';
import path from 'node:path';
import picomatch from 'picomatch';
import type { FileEntry } from '../rules/types.js';

/**
 * Directories never worth entering for any rule. Note: dist/build/.next ARE
 * walked — shipped output is exactly where secrets/source-map findings live.
 * Rules that don't care about build output filter via their own globs.
 */
const NEVER_ENTER = new Set([
  'node_modules',
  '.git',
  '.vercel',
  '.turbo',
  '.cache',
  'coverage',
  '.svelte-kit',
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB — larger files are almost never source

export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/** One filesystem traversal for the whole scan. */
export function walk(root: string, extraIgnores: string[] = []): FileEntry[] {
  const crawler = new fdir()
    .withRelativePaths()
    .exclude((dirName) => NEVER_ENTER.has(dirName))
    .crawl(root);

  const relPaths = crawler.sync() as string[];
  const entries: FileEntry[] = [];

  for (const rel of relPaths) {
    const posixRel = toPosix(rel);
    if (extraIgnores.length > 0 && matchesAny(posixRel, extraIgnores)) continue;
    const absPath = path.join(root, rel);
    let size = 0;
    try {
      size = statSync(absPath).size;
    } catch {
      continue;
    }
    if (size > MAX_FILE_SIZE) continue;
    entries.push({ path: posixRel, absPath, size });
  }
  return entries;
}

function matchesAny(posixPath: string, globs: string[]): boolean {
  return picomatch.isMatch(posixPath, globs, { dot: true });
}
