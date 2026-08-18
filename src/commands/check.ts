import { writeFileSync } from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { loadConfig } from '../engine/config.js';
import { buildScanContext } from '../engine/context.js';
import { runScan } from '../engine/scan.js';
import { isLocale, t, type Locale } from '../i18n/index.js';
import { createLiveSession } from '../live/client.js';
import { requestConsent } from '../live/consent.js';
import { discoverSupabaseProject } from '../live/discovery.js';
import { countBySeverity, JSON_SCHEMA_VERSION, type ScanResult } from '../report/model.js';
import { exitCodeFor, EXIT_LIVE_NETWORK_FAILED, EXIT_USAGE } from '../report/exit-code.js';
import { renderJson } from '../report/json.js';
import { renderMarkdown } from '../report/markdown.js';
import { renderTerminal } from '../report/terminal.js';
import { knownRuleIds, rules } from '../rules/registry.js';
import type { Severity } from '../rules/types.js';
import { isSeverity } from '../engine/severity.js';
import { toPosix } from '../engine/walk.js';
import { VERSION } from '../version.js';

export interface CheckFlags {
  path: string;
  format: 'terminal' | 'json' | 'markdown';
  out?: string;
  lang?: string;
  url?: string;
  iOwnThisSite: boolean;
  minSeverity?: string;
  offline: boolean;
  verbose: boolean;
  noCta: boolean;
}

export async function checkCommand(flags: CheckFlags): Promise<number> {
  // --- validate flags -------------------------------------------------------
  const locale: Locale = flags.lang && isLocale(flags.lang) ? flags.lang : 'en';
  if (flags.lang && !isLocale(flags.lang)) {
    process.stderr.write(`Unknown --lang "${flags.lang}" (supported: en, vi)\n`);
    return EXIT_USAGE;
  }
  let minSeverity: Severity | undefined;
  if (flags.minSeverity !== undefined) {
    if (!isSeverity(flags.minSeverity)) {
      process.stderr.write(
        `Unknown --min-severity "${flags.minSeverity}" (critical | high | medium | low)\n`,
      );
      return EXIT_USAGE;
    }
    minSeverity = flags.minSeverity;
  }
  // Consent is the only key to the network: nothing below can open a socket at
  // a site without the LiveConsent this call either grants or refuses.
  const consent = requestConsent(flags.url, flags.iOwnThisSite);
  if (!consent.ok && consent.reason === 'bad-url') {
    process.stderr.write(`--url must be an http(s) URL, got "${flags.url}"\n`);
    return EXIT_USAGE;
  }
  if (!consent.ok && consent.reason === 'not-asserted') {
    process.stderr.write(pc.yellow(t('engine.live-skipped', undefined, locale)) + '\n');
  }
  const liveAuthorized = consent.ok;

  // --- config + context -----------------------------------------------------
  const config = loadConfig(flags.path, knownRuleIds);
  const ctx = buildScanContext({
    root: flags.path,
    locale,
    extraIgnores: config.ignore,
    ...(consent.ok ? { targetUrl: consent.consent.url } : {}),
    liveCheckAuthorized: liveAuthorized,
    offline: flags.offline,
  });

  // --- live session (only when authorized) ----------------------------------
  const liveSession = consent.ok ? createLiveSession(consent.consent, ctx.budget) : undefined;
  if (liveSession) {
    // The app's own Supabase project is the one extra origin the policy allows,
    // and it is read from the app's own source rather than configured.
    const project = discoverSupabaseProject(ctx.files);
    if (project) liveSession.allowExtraOrigin(project.origin);
    await liveSession.primeRobots();
  }

  // --- scan -----------------------------------------------------------------
  const { findings, ruleErrors } = await runScan({
    ctx,
    rules,
    config,
    ...(liveSession ? { liveClient: liveSession.client } : {}),
  });

  const effectiveMin = minSeverity ?? config.minSeverity;

  const result: ScanResult = {
    schemaVersion: JSON_SCHEMA_VERSION,
    tool: { name: 'trussary', version: VERSION },
    scannedAt: new Date().toISOString(),
    root: toPosix(ctx.root),
    ...(consent.ok
      ? { target: { url: consent.consent.url, ownershipAsserted: true as const } }
      : {}),
    stacks: [...ctx.stacks].sort(),
    locale,
    findings,
    counts: countBySeverity(findings),
    suppressedCount: findings.filter((f) => f.suppressed).length,
    liveCheck: liveSession ? liveSession.receipt() : null,
    ruleErrors,
    configWarnings: config.warnings,
  };

  // --- render ---------------------------------------------------------------
  let output: string;
  switch (flags.format) {
    case 'json':
      output = renderJson(result, locale);
      break;
    case 'markdown':
      output = renderMarkdown(result, locale);
      break;
    default:
      output = renderTerminal(result, {
        locale,
        verbose: flags.verbose,
        showCta: !flags.noCta,
      });
  }

  if (flags.out) {
    writeFileSync(path.resolve(flags.out), output, 'utf8');
    process.stderr.write(`Report written to ${path.resolve(flags.out)}\n`);
  } else {
    process.stdout.write(output + (output.endsWith('\n') ? '' : '\n'));
  }

  // --- exit code ------------------------------------------------------------
  if (liveSession?.networkFailed()) return EXIT_LIVE_NETWORK_FAILED;
  return exitCodeFor(result, effectiveMin);
}
