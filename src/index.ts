/**
 * Programmatic API — the surface a GitHub Action or SARIF exporter builds on.
 * The JSON schema is versioned (report/model.ts); breaking changes bump it.
 */

export { buildScanContext } from './engine/context.js';
export { runScan } from './engine/scan.js';
export { loadConfig, parseConfig } from './engine/config.js';
export { rules, knownRuleIds } from './rules/registry.js';
export { t, tm, ruleExtra, isLocale, LOCALES } from './i18n/index.js';
export { VI_ANCHORS } from './i18n/anchors.js';
export { countBySeverity, JSON_SCHEMA_VERSION } from './report/model.js';
export { renderJson } from './report/json.js';
export { renderMarkdown } from './report/markdown.js';
export { renderTerminal } from './report/terminal.js';
export { exitCodeFor } from './report/exit-code.js';
// Live checking, with its gate attached: a session cannot be built without the
// consent object, and requestConsent is the only thing that makes one.
export { requestConsent } from './live/consent.js';
export { createLiveSession } from './live/client.js';
export { discoverSupabaseProject } from './live/discovery.js';
export { FIXED_PATHS, USER_AGENT } from './live/policy.js';
export { VERSION } from './version.js';

export type * from './rules/types.js';
export type { ScanResult, LiveCheckReceipt } from './report/model.js';
export type { TrussaryConfig, RuleOverride } from './engine/config.js';
export type { Locale, RuleBundle, RuleMessages } from './i18n/types.js';
export type { LiveConsent, ConsentResult } from './live/consent.js';
export type { LiveSession } from './live/client.js';
