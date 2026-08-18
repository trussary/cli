import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { scanDir } from './helpers/scan.js';

/**
 * The budget the whole design exists to protect: one filesystem walk, content
 * read once, lines split once, no AST. If this gate goes red, something
 * started re-reading files.
 */
const FILE_COUNT = 1_500;
const BUDGET_MS = 10_000;

let root: string;

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), 'trussary-perf-'));
  writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({ name: 'perf', dependencies: { next: '15.0.0', '@supabase/supabase-js': '2.45.0' } }),
  );
  writeFileSync(path.join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: {} }));

  // A synthetic app: components, api routes, migrations — the shapes rules read.
  for (const dir of ['app/components', 'app/api', 'src/lib', 'supabase/migrations']) {
    mkdirSync(path.join(root, dir), { recursive: true });
  }
  for (let i = 0; i < FILE_COUNT; i++) {
    const body = [
      `// generated component ${i}`,
      `import { useState } from 'react';`,
      `export function Widget${i}() {`,
      `  const [value, setValue] = useState('item-${i}');`,
      `  return value;`,
      `}`,
      `const note = 'a moderately long line of text repeated to give the walker something to read'.repeat(3);`,
    ].join('\n');
    writeFileSync(path.join(root, 'app/components', `Widget${i}.tsx`), body);
  }
  for (let i = 0; i < 50; i++) {
    writeFileSync(
      path.join(root, 'supabase/migrations', `${String(i).padStart(4, '0')}_table.sql`),
      `create table t${i} (id uuid primary key);\nalter table t${i} enable row level security;\ncreate policy "p" on t${i} for select using (true);\n`,
    );
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('performance', () => {
  it(`scans ${FILE_COUNT}+ files in under ${BUDGET_MS / 1000}s`, async () => {
    const started = Date.now();
    const { findings, ruleErrors } = await scanDir(root);
    const elapsed = Date.now() - started;

    expect(ruleErrors).toEqual([]);
    expect(findings.length).toBeLessThan(50); // a synthetic clean app should be quiet
    expect(elapsed).toBeLessThan(BUDGET_MS);
  });
});
