import { readFileSync } from 'node:fs';
import picomatch from 'picomatch';
import type { FileEntry, FileSet } from '../rules/types.js';

/**
 * Lazy, memoized view over the walked files. Content read at most once,
 * lines split at most once (\r?\n so line numbers are correct on Windows).
 */
export function createFileSet(entries: FileEntry[]): FileSet {
  const byPath = new Map<string, FileEntry>();
  for (const e of entries) byPath.set(e.path, e);

  const contentCache = new Map<string, string>();
  const lineCache = new Map<string, string[]>();
  const globCache = new Map<string, FileEntry[]>();

  function read(p: string): string {
    let cached = contentCache.get(p);
    if (cached !== undefined) return cached;
    const entry = byPath.get(p);
    let content = '';
    if (entry) {
      try {
        const buf = readFileSync(entry.absPath);
        // Skip binary-looking files (NUL byte in the first 1 KB).
        if (!buf.subarray(0, 1024).includes(0)) content = buf.toString('utf8');
      } catch {
        content = '';
      }
    }
    contentCache.set(p, content);
    return content;
  }

  return {
    list(glob?: string | string[]): FileEntry[] {
      if (!glob) return entries;
      const key = Array.isArray(glob) ? glob.join('\n') : glob;
      let cached = globCache.get(key);
      if (!cached) {
        const isMatch = picomatch(glob, { dot: true });
        cached = entries.filter((e) => isMatch(e.path));
        globCache.set(key, cached);
      }
      return cached;
    },
    read,
    lines(p: string): string[] {
      let cached = lineCache.get(p);
      if (!cached) {
        cached = read(p).split(/\r?\n/);
        lineCache.set(p, cached);
      }
      return cached;
    },
    has(p: string): boolean {
      return byPath.has(p);
    },
  };
}
