import pc from 'picocolors';
import path from 'node:path';
import type { Evidence, Finding, Severity } from '../rules/types.js';
import { t, tm, type Locale } from '../i18n/index.js';
import type { ScanResult } from './model.js';

const SEV_LABEL: Record<Severity, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

function sevColor(s: Severity, text: string): string {
  switch (s) {
    case 'critical':
      return pc.bold(pc.red(text));
    case 'high':
      return pc.red(text);
    case 'medium':
      return pc.yellow(text);
    case 'low':
      return pc.dim(text);
  }
}

function toNative(p: string): string {
  return p.split('/').join(path.sep);
}

function renderEvidence(e: Evidence, locale: Locale): string {
  switch (e.kind) {
    case 'file':
      return `${toNative(e.path)}:${e.line}  →  ${e.excerpt}`;
    case 'http':
      return `${e.method} ${e.url} → ${e.status}${e.header ? `  (${e.header})` : ''}${e.snippet ? `  ${e.snippet}` : ''}`;
    case 'absence':
      return `${t('engine.absence-evidence', undefined, locale)}: ${tm(e.note, locale)}`;
  }
}

export interface TerminalOptions {
  locale: Locale;
  verbose: boolean;
  showCta: boolean;
}

export function renderTerminal(result: ScanResult, opts: TerminalOptions): string {
  const { locale } = opts;
  const out: string[] = [];
  const label = (key: string) => pc.dim(t(key, undefined, locale).padEnd(12));

  out.push('');
  out.push(pc.bold(`trussary ${result.tool.version}`) + pc.dim(`  ·  ${toNative(result.root)}`));
  if (result.stacks.length > 0) {
    out.push(pc.dim(t('engine.stacks', { stacks: result.stacks.join(', ') }, locale)));
  } else {
    out.push(pc.dim(t('engine.no-stacks', undefined, locale)));
  }
  out.push('');

  for (const w of result.configWarnings) {
    out.push(pc.yellow(t('engine.config-warning', { message: w }, locale)));
  }
  for (const e of result.ruleErrors) {
    out.push(pc.yellow(t('engine.rule-error', { ruleId: e.ruleId, message: e.message }, locale)));
  }
  if (result.configWarnings.length > 0 || result.ruleErrors.length > 0) out.push('');

  const active = result.findings.filter((f) => !f.suppressed);
  const suppressed = result.findings.filter((f) => f.suppressed);

  for (const f of active) {
    out.push(
      `${sevColor(f.severity, `● ${SEV_LABEL[f.severity]}`)} ${pc.dim(`· ${f.confidence}`)}  ${pc.dim(f.id)}`,
    );
    out.push(`  ${pc.bold(tm(f.title, locale))}`);
    out.push(`  ${label('engine.why')} ${tm(f.whyItMatters, locale)}`);
    out.push(`  ${label('engine.evidence')} ${renderEvidence(f.evidence, locale)}`);
    out.push(`  ${label('engine.check')} ${tm(f.checkWhetherThisIsYou, locale)}`);
    out.push(`  ${label('engine.fixed-when')} ${tm(f.fixedWhen, locale)}`);
    out.push(`  ${label('engine.how')} ${tm(f.howToFix, locale)}`);
    if (f.confidence === 'possible') {
      out.push(`  ${pc.dim(t('engine.possible-note', undefined, locale))}`);
    }
    out.push('');
  }

  if (active.length === 0) {
    out.push(pc.green(t('engine.no-findings', undefined, locale)));
    out.push('');
  }

  if (suppressed.length > 0) {
    out.push(pc.dim(t('engine.suppressed-count', { count: suppressed.length }, locale)));
    if (opts.verbose) {
      for (const f of suppressed) {
        const reason = f.suppressed?.reason ? ` (${f.suppressed.reason})` : '';
        out.push(pc.dim(`  – ${f.id} · ${SEV_LABEL[f.severity]} · via ${f.suppressed?.by}${reason}`));
      }
    }
    out.push('');
  }

  const c = result.counts;
  out.push(
    t('engine.summary', { critical: c.critical, high: c.high, medium: c.medium, low: c.low }, locale),
  );

  if (result.liveCheck) {
    out.push(
      pc.dim(
        t(
          'engine.live-receipt',
          { requests: result.liveCheck.requestsMade, url: result.liveCheck.url },
          locale,
        ),
      ),
    );
  }

  if (opts.showCta) {
    out.push('');
    out.push(pc.dim(t('engine.cta', undefined, locale)));
  }
  out.push('');
  return out.join('\n');
}
