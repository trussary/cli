import type { FileSet, PackageJsonLike } from '../types.js';

/**
 * The versions actually installed, as best a file scan can know them:
 * the lockfile if there is one, otherwise the range in package.json with its
 * prefix stripped. Registry advisory ranges are matched against these.
 */
export function resolveDirectDependencies(
  files: FileSet,
  pkg: PackageJsonLike | undefined,
): Map<string, string> {
  const declared = pkg?.dependencies ?? {};
  const locked = readLockfileVersions(files);
  const out = new Map<string, string>();

  for (const [name, range] of Object.entries(declared)) {
    const version = locked.get(name) ?? cleanRange(range);
    if (version) out.set(name, version);
  }
  return out;
}

/** npm lockfile v2/v3: `packages` keyed by "node_modules/<name>". */
function readLockfileVersions(files: FileSet): Map<string, string> {
  const out = new Map<string, string>();
  if (!files.has('package-lock.json')) return out;
  try {
    const lock = JSON.parse(files.read('package-lock.json')) as {
      packages?: Record<string, { version?: string }>;
      dependencies?: Record<string, { version?: string }>;
    };
    for (const [key, entry] of Object.entries(lock.packages ?? {})) {
      const name = key.startsWith('node_modules/') ? key.slice('node_modules/'.length) : '';
      if (name && !name.includes('node_modules/') && entry.version) out.set(name, entry.version);
    }
    for (const [name, entry] of Object.entries(lock.dependencies ?? {})) {
      if (entry.version && !out.has(name)) out.set(name, entry.version);
    }
  } catch {
    // Unreadable lockfile: fall back to declared ranges.
  }
  return out;
}

/** "^1.2.3" → "1.2.3". Returns '' for ranges with no concrete version (workspace:, git URLs). */
function cleanRange(range: string): string {
  const m = /(\d+\.\d+\.\d+(?:-[\w.]+)?)/.exec(range);
  return m ? (m[1] as string) : '';
}

export function lockfileNames(): string[] {
  return ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock'];
}
