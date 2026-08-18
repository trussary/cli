import type { FileSet } from '../rules/types.js';

/**
 * The app's own Supabase project, as its own source states it. This is the one
 * origin besides the asserted site that the live checker is allowed to touch,
 * so it is read from files rather than guessed or configured.
 */

export interface SupabaseProject {
  url: string;
  origin: string;
  anonKey?: string;
}

const PROJECT_URL = /https:\/\/([a-z0-9]{16,32})\.supabase\.co/;

/** Anon-role JWT: a public key by design, which is why probing with it is fair. */
const ANON_KEY = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*YW5vbi[A-Za-z0-9_-]*\.[A-Za-z0-9_-]{10,}/;

const SEARCH_GLOBS = [
  '**/*.{ts,tsx,js,jsx,mjs,cjs}',
  '.env',
  '.env.*',
  'supabase/config.toml',
];

export function discoverSupabaseProject(files: FileSet): SupabaseProject | undefined {
  let url: string | undefined;
  let anonKey: string | undefined;

  for (const file of files.list(SEARCH_GLOBS)) {
    const content = files.read(file.path);
    if (!url) url = PROJECT_URL.exec(content)?.[0];
    if (!anonKey) anonKey = ANON_KEY.exec(content)?.[0];
    if (url && anonKey) break;
  }

  if (!url) return undefined;
  const project: SupabaseProject = { url, origin: new URL(url).origin };
  if (anonKey) project.anonKey = anonKey;
  return project;
}
