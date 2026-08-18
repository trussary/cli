import type { DetectedFinding, Rule } from '../types.js';
import { discoverSupabaseProject } from '../../live/discovery.js';
import { migrationFiles, readMigrations } from '../helpers/supabase.js';

/**
 * The check that turns "we found no RLS policy in your files" into "we asked
 * your database, with your own public key, and it handed rows back".
 *
 * One GET per table, limit=1, with the anon key that already ships in your
 * website — exactly what any visitor could do. Read-only, and it stops as soon
 * as the budget says so.
 */

const MAX_TABLES = 8;

export const supabaseAnonReadableLive: Rule = {
  id: 'supabase-anon-readable',
  ruleClass: 'data-access',
  defaultSeverity: 'critical',
  maxConfidence: 'certain',
  inputs: { live: true, stacks: ['supabase'] },

  async detect(ctx): Promise<DetectedFinding[]> {
    const project = discoverSupabaseProject(ctx.files);
    if (!project?.anonKey) return [];

    const { tables } = readMigrations(ctx.files, migrationFiles(ctx.files));
    if (tables.length === 0) return [];

    const http = ctx.http();
    const out: DetectedFinding[] = [];
    const seen = new Set<string>();

    for (const table of tables) {
      if (seen.size >= MAX_TABLES) break;
      if (seen.has(table.name)) continue;
      seen.add(table.name);

      const url = `${project.url}/rest/v1/${encodeURIComponent(table.name)}?select=*&limit=1`;
      let res;
      try {
        res = await http.getWithAnonKey(url, project.anonKey);
      } catch {
        break; // budget spent or network gone: report what we have, claim nothing more
      }
      if (res.status !== 200) continue;

      // A protected table answers 200 with an empty array. Rows mean readable.
      let rows: unknown;
      try {
        rows = JSON.parse(res.body);
      } catch {
        continue;
      }
      if (!Array.isArray(rows) || rows.length === 0) continue;

      const columns = Object.keys(rows[0] as Record<string, unknown>).slice(0, 6).join(', ');
      out.push({
        confidence: 'certain',
        evidence: {
          kind: 'http',
          url: `${project.url}/rest/v1/${table.name}?select=*&limit=1`,
          method: 'GET',
          status: res.status,
          snippet: `returned ${rows.length} row with columns: ${columns}`,
        },
        vars: { table: table.name, columns, url: project.url },
      });
    }
    return out;
  },
};
