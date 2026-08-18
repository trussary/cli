import type { DetectedFinding, Rule } from '../types.js';
import {
  migrationFiles,
  readMigrations,
  supabaseClientFiles,
} from '../helpers/supabase.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * Row Level Security is the difference between "the app does not show you
 * other people's rows" and "the database will not hand them over".
 *
 * Three branches, three honesty levels — and none of them may say 'certain',
 * because policies created in the Supabase dashboard leave no trace in files.
 */
export const supabaseRlsMissing: Rule = {
  id: 'supabase-rls-missing',
  ruleClass: 'data-access',
  defaultSeverity: 'critical',
  maxConfidence: 'likely',
  inputs: { stacks: ['supabase'] },

  detect(ctx): DetectedFinding[] {
    const clients = supabaseClientFiles(ctx.files);
    if (clients.length === 0) return [];

    const migrations = migrationFiles(ctx.files);

    // Branch 2 — the app talks to Supabase but the schema is not in the repo.
    if (migrations.length === 0) {
      const first = clients[0] as { path: string };
      return [
        {
          severity: 'high',
          confidence: 'possible',
          evidence: {
            kind: 'absence',
            note: { key: 'supabase-rls-missing.no-migrations', vars: { file: first.path } },
          },
          vars: { file: first.path, table: 'every table', tables: 'every table' },
        },
      ];
    }

    const { tables, rlsEnabled, policied } = readMigrations(ctx.files, migrations);
    if (tables.length === 0) return [];

    const uncovered = tables.filter((t) => !rlsEnabled.has(t.name) || !policied.has(t.name));
    if (uncovered.length === 0) return [];

    // Branch 1 — tables exist and nothing anywhere turns RLS on.
    if (rlsEnabled.size === 0 && policied.size === 0) {
      const first = tables[0] as { name: string; file: string; line: number };
      return [
        {
          severity: 'critical',
          confidence: 'likely',
          evidence: {
            kind: 'file',
            path: first.file,
            line: first.line,
            excerpt: trimExcerpt(
              `${tables.length} table(s) created, no ENABLE ROW LEVEL SECURITY or CREATE POLICY in any migration`,
            ),
          },
          vars: {
            table: first.name,
            tables: tables.map((t) => t.name).join(', '),
            count: tables.length,
          },
        },
      ];
    }

    // Branch 3 — partial coverage: name the tables that were left out.
    return uncovered.map((t) => ({
      severity: 'high' as const,
      confidence: 'likely' as const,
      evidence: {
        kind: 'file' as const,
        path: t.file,
        line: t.line,
        excerpt: rlsEnabled.has(t.name)
          ? `table "${t.name}" has RLS enabled but no policy in any migration`
          : `table "${t.name}" is created without RLS, while other tables in this project have it`,
      },
      vars: { table: t.name, tables: t.name, count: 1 },
    }));
  },
};
