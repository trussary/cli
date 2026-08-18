import type { FileEntry, FileSet } from '../types.js';

/**
 * Reading Supabase migrations well enough to answer one question honestly:
 * which tables exist, and which of them have RLS switched on with a policy.
 *
 * A file scan cannot see policies created in the dashboard, which is why
 * every rule built on this caps at 'likely'.
 */

export const MIGRATION_GLOBS = [
  'supabase/migrations/**/*.sql',
  'supabase/**/*.sql',
  'migrations/**/*.sql',
  'db/migrations/**/*.sql',
];

export interface TableRef {
  name: string;
  file: string;
  line: number;
}

/** Schemas Supabase manages itself — never our business to police. */
const MANAGED_SCHEMA = /^(auth|storage|realtime|extensions|graphql|vault|supabase_\w+)\./;

const CREATE_TABLE = /create\s+table\s+(?:if\s+not\s+exists\s+)?([\w."`]+)/gi;
const ENABLE_RLS = /alter\s+table\s+(?:only\s+)?([\w."`]+)\s+enable\s+row\s+level\s+security/gi;
const CREATE_POLICY = /create\s+policy\s+(?:[^\s]+|"[^"]+")\s+on\s+([\w."`]+)/gi;

export function normalizeTable(raw: string): string {
  const cleaned = raw.replace(/["`]/g, '').trim().toLowerCase();
  return cleaned.startsWith('public.') ? cleaned.slice('public.'.length) : cleaned;
}

export function migrationFiles(files: FileSet): FileEntry[] {
  const seen = new Set<string>();
  const out: FileEntry[] = [];
  for (const f of files.list(MIGRATION_GLOBS)) {
    if (seen.has(f.path)) continue;
    seen.add(f.path);
    out.push(f);
  }
  return out;
}

export interface MigrationFacts {
  tables: TableRef[];
  rlsEnabled: Set<string>;
  policied: Set<string>;
}

export function readMigrations(files: FileSet, entries: FileEntry[]): MigrationFacts {
  const tables: TableRef[] = [];
  const rlsEnabled = new Set<string>();
  const policied = new Set<string>();

  for (const entry of entries) {
    const lines = files.lines(entry.path);
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i] as string;
      collect(CREATE_TABLE, text, (name) => {
        if (MANAGED_SCHEMA.test(name)) return;
        tables.push({ name: normalizeTable(name), file: entry.path, line: i + 1 });
      });
      collect(ENABLE_RLS, text, (name) => rlsEnabled.add(normalizeTable(name)));
      collect(CREATE_POLICY, text, (name) => policied.add(normalizeTable(name)));
    }
  }
  return { tables, rlsEnabled, policied };
}

function collect(re: RegExp, text: string, fn: (name: string) => void): void {
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) fn(m[1] as string);
}

/** Files that talk to Supabase from the app itself. */
export function supabaseClientFiles(files: FileSet): FileEntry[] {
  return files
    .list(['**/*.{ts,tsx,js,jsx,mjs,cjs}'])
    .filter((f) => /@supabase\/(supabase-js|ssr|auth-helpers)|createClient\s*\(/.test(files.read(f.path)));
}
