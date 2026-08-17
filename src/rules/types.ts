/**
 * Core contracts for the trussary rule engine.
 *
 * Rules are data + a detector. They emit message keys (never localized text)
 * and a confidence the engine clamps to the rule's `maxConfidence` — a rule
 * that cannot see dashboard/edge config can structurally never claim 'certain'.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Confidence = 'certain' | 'likely' | 'possible';

export type RuleClass =
  | 'secrets'
  | 'data-access'
  | 'auth'
  | 'money-abuse'
  | 'input'
  | 'deploy';

export type Stack = 'next' | 'vite-react' | 'supabase' | 'vercel' | 'express';

/** A localizable string reference. Rendered text never lives on a finding. */
export interface Msg {
  key: string;
  vars?: Record<string, string | number>;
}

export type Evidence =
  | {
      kind: 'file';
      /** POSIX-style path relative to scan root. */
      path: string;
      line: number;
      column?: number;
      /** Redacted at construction — never contains a live secret value. */
      excerpt: string;
    }
  | {
      kind: 'http';
      url: string;
      method: 'GET' | 'HEAD';
      status: number;
      header?: string;
      snippet?: string;
    }
  | { kind: 'absence'; note: Msg };

export interface Finding {
  id: string;
  ruleClass: RuleClass;
  severity: Severity;
  confidence: Confidence;
  title: Msg;
  whyItMatters: Msg;
  howToFix: Msg;
  checkWhetherThisIsYou: Msg;
  /** A verifiable end state, not an action (a leaked key is fixed when rotated). */
  fixedWhen: Msg;
  evidence: Evidence;
  stack?: Stack;
  live: boolean;
  suppressed?: { by: 'inline' | 'rc'; reason?: string };
}

export interface RuleInputs {
  /** Only run when files matching these globs exist. Overrides default ignores when explicit. */
  globs?: string[];
  /** Only run when one of these stacks was detected. */
  stacks?: Stack[];
  /** Requires --url plus --i-own-this-site. */
  live?: boolean;
}

export interface DetectedFinding {
  severity?: Severity;
  confidence: Confidence;
  evidence: Evidence;
  vars?: Record<string, string | number>;
  stack?: Stack;
}

export interface Rule {
  id: string;
  ruleClass: RuleClass;
  defaultSeverity: Severity;
  /** Structural honesty cap; the engine clamps every finding to this. */
  maxConfidence: Confidence;
  inputs: RuleInputs;
  detect(ctx: RuleContext): DetectedFinding[] | Promise<DetectedFinding[]>;
}

export interface FileEntry {
  /** POSIX-style path relative to scan root. */
  path: string;
  /** Absolute native path on disk. */
  absPath: string;
  size: number;
}

export interface FileSet {
  /** All walked files, or the subset matching a glob (POSIX-style patterns). */
  list(glob?: string | string[]): FileEntry[];
  /** Cached full content. Returns '' for unreadable/binary-looking files. */
  read(path: string): string;
  /** Cached line split (\r?\n — line numbers stay correct on Windows). */
  lines(path: string): string[];
  has(path: string): boolean;
}

export interface LiveBudget {
  maxRequestsPerSecond: number;
  maxTotalRequests: number;
  perRequestTimeoutMs: number;
  totalWallClockMs: number;
}

export interface PackageJsonLike {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  [key: string]: unknown;
}

export interface ScanContext {
  /** Absolute, normalized root. */
  root: string;
  stacks: Set<Stack>;
  files: FileSet;
  packageJson?: PackageJsonLike;
  liveCheckAuthorized: boolean;
  targetUrl?: string;
  budget: LiveBudget;
  locale: string;
  /** Skip rules that need outbound network beyond the asserted target (npm advisories). */
  offline: boolean;
}

/** Rate-limited, allowlisted HTTP client — the only way a rule touches the network. */
export interface SafeHttpClient {
  get(url: string): Promise<SafeHttpResponse>;
  head(url: string): Promise<SafeHttpResponse>;
}

export interface SafeHttpResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  /** Body capped at 256 KB; '' for HEAD. */
  body: string;
  ok: boolean;
}

export interface RuleContext {
  ruleId: string;
  scan: ScanContext;
  files: FileSet;
  /** Throws unless the rule declared inputs.live and --i-own-this-site was passed. */
  http(): SafeHttpClient;
}
