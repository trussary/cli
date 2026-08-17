import path from 'node:path';
import type { LiveBudget, PackageJsonLike, ScanContext } from '../rules/types.js';
import { createFileSet } from './fileset.js';
import { detectStacks } from './stack-detect.js';
import { walk } from './walk.js';

export const DEFAULT_LIVE_BUDGET: LiveBudget = {
  maxRequestsPerSecond: 2,
  maxTotalRequests: 25,
  perRequestTimeoutMs: 5_000,
  totalWallClockMs: 20_000,
};

export interface BuildContextOptions {
  root: string;
  locale: string;
  extraIgnores?: string[];
  targetUrl?: string;
  liveCheckAuthorized?: boolean;
  offline?: boolean;
}

export function buildScanContext(opts: BuildContextOptions): ScanContext {
  const root = path.resolve(opts.root);
  const entries = walk(root, opts.extraIgnores ?? []);
  const files = createFileSet(entries);

  let packageJson: PackageJsonLike | undefined;
  if (files.has('package.json')) {
    try {
      packageJson = JSON.parse(files.read('package.json')) as PackageJsonLike;
    } catch {
      packageJson = undefined;
    }
  }

  const ctx: ScanContext = {
    root,
    stacks: detectStacks(files, packageJson),
    files,
    liveCheckAuthorized: opts.liveCheckAuthorized ?? false,
    budget: DEFAULT_LIVE_BUDGET,
    locale: opts.locale,
    offline: opts.offline ?? false,
  };
  if (packageJson) ctx.packageJson = packageJson;
  if (opts.targetUrl) ctx.targetUrl = opts.targetUrl;
  return ctx;
}
