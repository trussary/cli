import type { DetectedFinding, Rule } from '../types.js';

/**
 * Source maps in built output hand a reader your original, commented,
 * un-minified code — including anything you thought minification hid.
 *
 * We can see the .map file; we cannot see whether that build directory is the
 * one you deployed. Hence 'likely', never 'certain'.
 */

const BUILT_MAPS = [
  'dist/**/*.map',
  'build/**/*.map',
  'out/**/*.map',
  '.next/static/**/*.map',
  'public/**/*.js.map',
];

const CONFIG_GLOBS = [
  'next.config.{js,mjs,cjs,ts}',
  'vite.config.{js,mjs,cjs,ts}',
  'webpack.config.{js,mjs,cjs,ts}',
];

/** An explicit opt-in in config is the cause worth naming in the fix text. */
const SOURCEMAP_OPT_IN =
  /(productionBrowserSourceMaps\s*:\s*true|sourcemap\s*:\s*(true|['"]inline['"]|['"]hidden['"]))/;

export const sourceMapsInProd: Rule = {
  id: 'source-maps-in-prod',
  ruleClass: 'secrets',
  defaultSeverity: 'medium',
  maxConfidence: 'likely',
  inputs: { globs: BUILT_MAPS },

  detect(ctx): DetectedFinding[] {
    const maps = ctx.files.list(BUILT_MAPS);
    if (maps.length === 0) return [];

    let optInFile: string | undefined;
    for (const cfg of ctx.files.list(CONFIG_GLOBS)) {
      if (SOURCEMAP_OPT_IN.test(ctx.files.read(cfg.path))) {
        optInFile = cfg.path;
        break;
      }
    }

    const first = maps[0] as { path: string };
    return [
      {
        confidence: 'likely',
        evidence: {
          kind: 'file',
          path: first.path,
          line: 1,
          excerpt: `${maps.length} source map file(s) in your build output, starting with this one`,
        },
        vars: {
          file: first.path,
          count: maps.length,
          cause: optInFile ?? 'your build settings',
        },
      },
    ];
  },
};
