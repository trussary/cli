import type {
  DetectedFinding,
  Finding,
  Rule,
  RuleContext,
  SafeHttpClient,
  ScanContext,
} from '../rules/types.js';
import type { TrussaryConfig } from './config.js';
import { applySuppression } from './suppress.js';
import { clampConfidence, confidenceRank, severityRank } from './severity.js';

export interface RunScanOptions {
  ctx: ScanContext;
  rules: Rule[];
  config: TrussaryConfig;
  /** Provided only when live checks are authorized; rules reach it via ctx.http(). */
  liveClient?: SafeHttpClient;
}

export interface ScanRunResult {
  findings: Finding[];
  /** Rules that threw — reported, never silently swallowed. */
  ruleErrors: { ruleId: string; message: string }[];
}

function shouldRun(rule: Rule, ctx: ScanContext): boolean {
  if (rule.inputs.live && (!ctx.liveCheckAuthorized || !ctx.targetUrl)) return false;
  if (rule.inputs.stacks && !rule.inputs.stacks.some((s) => ctx.stacks.has(s))) return false;
  if (rule.inputs.globs && ctx.files.list(rule.inputs.globs).length === 0 && !rule.inputs.live) {
    return false;
  }
  return true;
}

function finalize(rule: Rule, detected: DetectedFinding, config: TrussaryConfig): Finding {
  const override = config.rules[rule.id];
  const overrideSeverity =
    override !== false && override?.severity ? override.severity : undefined;

  const finding: Finding = {
    id: rule.id,
    ruleClass: rule.ruleClass,
    severity: overrideSeverity ?? detected.severity ?? rule.defaultSeverity,
    confidence: clampConfidence(detected.confidence, rule.maxConfidence),
    title: { key: `${rule.id}.title`, ...(detected.vars ? { vars: detected.vars } : {}) },
    whyItMatters: { key: `${rule.id}.why`, ...(detected.vars ? { vars: detected.vars } : {}) },
    howToFix: { key: `${rule.id}.how`, ...(detected.vars ? { vars: detected.vars } : {}) },
    checkWhetherThisIsYou: {
      key: `${rule.id}.check`,
      ...(detected.vars ? { vars: detected.vars } : {}),
    },
    fixedWhen: { key: `${rule.id}.fixedWhen`, ...(detected.vars ? { vars: detected.vars } : {}) },
    evidence: detected.evidence,
    // For a liveOptional rule, only the findings that actually came from the
    // network are live ones.
    live: rule.inputs.live === true || detected.evidence.kind === 'http',
  };
  if (detected.stack) finding.stack = detected.stack;
  return finding;
}

export async function runScan(opts: RunScanOptions): Promise<ScanRunResult> {
  const { ctx, rules, config, liveClient } = opts;
  const findings: Finding[] = [];
  const ruleErrors: { ruleId: string; message: string }[] = [];

  for (const rule of rules) {
    if (!shouldRun(rule, ctx)) continue;

    const ruleCtx: RuleContext = {
      ruleId: rule.id,
      scan: ctx,
      files: ctx.files,
      http(): SafeHttpClient {
        if (!rule.inputs.live && !rule.inputs.liveOptional) {
          throw new Error(`rule ${rule.id} did not declare inputs.live but requested http()`);
        }
        if (!ctx.liveCheckAuthorized || !liveClient) {
          throw new Error('live checks require --url plus --i-own-this-site');
        }
        return liveClient;
      },
    };

    try {
      const detected = await rule.detect(ruleCtx);
      for (const d of detected) {
        const f = finalize(rule, d, config);
        // Per-rule minConfidence filter from .trussaryrc.
        const override = config.rules[rule.id];
        if (
          override !== false &&
          override?.minConfidence &&
          confidenceRank(f.confidence) > confidenceRank(override.minConfidence)
        ) {
          continue;
        }
        findings.push(f);
      }
    } catch (err) {
      ruleErrors.push({ ruleId: rule.id, message: (err as Error).message });
    }
  }

  applySuppression(findings, ctx.files, config);

  findings.sort((a, b) => {
    const bySev = severityRank(a.severity) - severityRank(b.severity);
    if (bySev !== 0) return bySev;
    const byConf = confidenceRank(a.confidence) - confidenceRank(b.confidence);
    if (byConf !== 0) return byConf;
    return a.id.localeCompare(b.id);
  });

  return { findings, ruleErrors };
}
