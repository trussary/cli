import type { Finding } from '../rules/types.js';
import { tm, type Locale } from '../i18n/index.js';
import type { ScanResult } from './model.js';

/**
 * Stable, versioned JSON output. Messages are pre-rendered in the requested
 * locale AND the raw {key, vars} pairs are retained under `i18n` so a
 * downstream consumer (GitHub Action, SARIF exporter) can re-render.
 */

interface JsonFinding {
  id: string;
  ruleClass: string;
  severity: string;
  confidence: string;
  title: string;
  whyItMatters: string;
  howToFix: string;
  checkWhetherThisIsYou: string;
  fixedWhen: string;
  evidence: Finding['evidence'];
  stack?: string;
  live: boolean;
  suppressed?: Finding['suppressed'];
  i18n: {
    title: Finding['title'];
    whyItMatters: Finding['whyItMatters'];
    howToFix: Finding['howToFix'];
    checkWhetherThisIsYou: Finding['checkWhetherThisIsYou'];
    fixedWhen: Finding['fixedWhen'];
  };
}

export function renderJson(result: ScanResult, locale: Locale): string {
  const findings: JsonFinding[] = result.findings.map((f) => {
    const jf: JsonFinding = {
      id: f.id,
      ruleClass: f.ruleClass,
      severity: f.severity,
      confidence: f.confidence,
      title: tm(f.title, locale),
      whyItMatters: tm(f.whyItMatters, locale),
      howToFix: tm(f.howToFix, locale),
      checkWhetherThisIsYou: tm(f.checkWhetherThisIsYou, locale),
      fixedWhen: tm(f.fixedWhen, locale),
      evidence: f.evidence,
      live: f.live,
      i18n: {
        title: f.title,
        whyItMatters: f.whyItMatters,
        howToFix: f.howToFix,
        checkWhetherThisIsYou: f.checkWhetherThisIsYou,
        fixedWhen: f.fixedWhen,
      },
    };
    if (f.stack) jf.stack = f.stack;
    if (f.suppressed) jf.suppressed = f.suppressed;
    return jf;
  });

  return JSON.stringify({ ...result, findings }, null, 2);
}
