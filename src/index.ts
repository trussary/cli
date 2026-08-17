/**
 * Programmatic API — the surface a GitHub Action or SARIF exporter builds on.
 * The JSON schema is versioned (report/model.ts); breaking changes bump it.
 */

export { buildScanContext } from './engine/context.js';
export { runScan } from './engine/scan.js';
export { loadConfig, parseConfig } from './engine/config.js';
export { rules, knownRuleIds } from './rules/registry.js';
export { t, tm, isLocale, LOCALES } from './i18n/index.js';
export { countBySeverity, JSON_SCHEMA_VERSION } from './report/model.js';
export { renderJson } from './report/json.js';
export { renderMarkdown } from './report/markdown.js';
export { renderTerminal } from './report/terminal.js';
export { exitCodeFor } from './report/exit-code.js';
export { VERSION } from './version.js';

export type * from './rules/types.js';
export type { ScanResult, LiveCheckReceipt } from './report/model.js';
export type { TrussaryConfig, RuleOverride } from './engine/config.js';
export type { Locale, RuleBundle, RuleMessages } from './i18n/types.js';
