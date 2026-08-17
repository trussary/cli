# Plan: `trussary` CLI — security scanner for AI-built apps

## Context

`trussary/cli` is the free top-of-funnel for trussary.com — a paid security-review service for non-technical builders shipping apps made with Lovable, Bolt, Replit, v0, Claude Code. The CLI scans a local repo (and optionally a live URL) for the specific failure modes of AI-generated apps on five stacks (Next.js, Vite+React, Supabase, Vercel, Express), and explains findings in language a non-engineer can act on. The ruleset — not the engine — is the product.

`D:\Projects\cli` is an empty git repo (zero commits). The sibling repo `D:\Projects\vibe-support` holds the site whose content this tool must align with: the `/safe-to-launch` 7-check list, the `vibe-coding-mistakes` blog pillar (10 failure modes with stable ids like `rls-never-enabled`, `secrets-in-bundle`), the `docs/scanner-reverse-engineering-plan.md` Probe contract, and a fully bilingual EN/VI copy corpus with an established voice ("Hiding a button is not a permission check", "a key that has been public stays public").

### Decisions locked (owner, this session)

1. **Live checks ship in v1** behind `--i-own-this-site` (self-asserted ownership), GET/HEAD only, rate-limited.
2. **Severity: 4 levels** — critical / high / medium / low. `--min-severity` gates the CI exit code.
3. **EN + VI both complete in M1**, VI co-written to the site's standard (English technical terms kept — `API key`, `RLS`, `endpoint` — Vietnamese explanation around them). No machine-translated security advice.
4. **Full rule catalog in M1** (all six classes), sequenced internally.

### ⚠ Consistency flag (must be actioned alongside launch, not in this repo)

Decision 1 amends the recorded decision in `vibe-support/docs/scanner-reverse-engineering-plan.md` ("verified domains only, always — not a default to be relaxed behind a flag") and conflicts with four places of live site copy promising "we read source only — never your live system" (`how.steps[1]`, `faq.items[2].a`, `privacy.sections[1].body`, `privacy.sections[3].body`, plus `llms.txt`). Before the CLI's live check is announced, that copy needs a deliberate amendment (e.g. "…unless you run our CLI against your own site and tell it so"). Tracked as Open Question #1.

Severity mapping note: the site's 3-level vocabulary (`high|med|low` → "Critical / Worth fixing / Worth knowing") maps from the CLI's 4 levels as critical+high → high, medium → med, low → low when findings feed the review funnel.

---

## 1. Architecture

**North stars:** (1) false positives are the #1 product risk — `confidence` is load-bearing and rules structurally cannot over-claim; (2) minimal supply chain — target 3 runtime deps, < 2 MB unpacked, bundled with tsup; (3) adding a rule is a data-shaped change — one rule file + one registry line + two message bundles, zero engine edits; (4) network I/O exists only inside a walled-garden `live/` module that refuses to run without the flag.

### Directory tree

```
trussary/
  package.json                 # bin: { trussary: ./dist/cli.js }, type: module, engines: node>=20
  tsconfig.json  tsup.config.ts  vitest.config.ts
  README.md  LICENSE (MIT)  CHANGELOG.md  .trussaryrc.example
  src/
    cli.ts                     # thin: hand-rolled arg parse → dispatch
    index.ts                   # programmatic API (reserved for GitHub Action / fix)
    commands/check.ts          # only v1 command  (reserved: explain.ts, fix.ts)
    engine/
      scan.ts                  # runScan(ctx) → ScanResult pipeline
      context.ts  walk.ts  fileset.ts  stack-detect.ts  suppress.ts  severity.ts
    rules/
      registry.ts              # static Rule[] — the one-line-per-rule extension point
      types.ts                 # Rule, Finding, Evidence, contexts
      helpers/                 # entropy, secret-patterns (data table), env-files,
                               # source-map, supabase, redact
      secrets/  data-access/  auth/  money-abuse/  input/  deploy/
                               # one file per rule; *.live.ts = needs --i-own-this-site
    i18n/
      index.ts                 # t(key, vars, locale) — hand-rolled, ~35 lines
      messages/{en,vi}.json    # engine/UI strings
      rules/{en,vi}/<rule-id>.json   # one bundle per rule per locale
    live/
      client.ts  policy.ts  consent.ts   # the ONLY module that opens sockets
    report/
      model.ts  terminal.ts  json.ts  markdown.ts  exit-code.ts
  test/
    fixtures/                  # intentionally-vulnerable + clean apps per stack
    false-positives/           # known-safe-but-tempting snippets (regression suite)
    rules/  __snapshots__/  i18n-parity.test.ts  perf.test.ts
```

**Separation:** engine walks the filesystem once, detects stacks, builds a lazy `FileSet` (content/lines/AST cached per path), then runs each registered rule whose `inputs` match. Rules emit message *keys* + vars, never localized text; the reporter resolves locale at render time. `explain` (M2) is a pure read over the same i18n bundles; `fix` (M3) reuses `howToFix` structure — neither requires engine changes, which is what "architecture doesn't preclude them" means concretely.

## 2. Rule & Finding schema (exact types)

```ts
export type Severity   = 'critical' | 'high' | 'medium' | 'low';
export type Confidence = 'certain' | 'likely' | 'possible';
export type RuleClass  = 'secrets' | 'data-access' | 'auth' | 'money-abuse' | 'input' | 'deploy';
export type Stack      = 'next' | 'vite-react' | 'supabase' | 'vercel' | 'express';

export interface Msg { key: string; vars?: Record<string, string | number> }

export type Evidence =
  | { kind: 'file'; path: string; line: number; column?: number; excerpt: string }  // excerpt REDACTED at construction
  | { kind: 'http'; url: string; method: 'GET' | 'HEAD'; status: number; header?: string; snippet?: string }
  | { kind: 'absence'; note: Msg };   // "no RLS policy found in any migration"

export interface Finding {
  id: string;                        // stable rule id, e.g. "secrets-in-client-bundle"
  ruleClass: RuleClass;
  severity: Severity;
  confidence: Confidence;
  title: Msg;                        // plain, concrete, no jargon
  whyItMatters: Msg;                 // consequence-framed
  howToFix: Msg;                     // stack-specific
  checkWhetherThisIsYou: Msg;        // a non-engineer can perform this  (site's signature structure)
  fixedWhen: Msg;                    // VERIFIABLE END STATE, not an action (rotated, not moved)
  evidence: Evidence;
  stack?: Stack;
  live: boolean;
  suppressed?: { by: 'inline' | 'rc'; reason?: string };
}

export interface RuleInputs { globs?: string[]; stacks?: Stack[]; live?: boolean }

export interface Rule {
  id: string;
  ruleClass: RuleClass;
  defaultSeverity: Severity;
  maxConfidence: Confidence;         // structural honesty cap — a rule that can't see dashboards can never say 'certain'
  inputs: RuleInputs;
  detect(ctx: RuleContext): DetectedFinding[] | Promise<DetectedFinding[]>;
}

export interface DetectedFinding {
  severity?: Severity;               // override when evidence warrants
  confidence: Confidence;            // required; engine clamps to rule.maxConfidence
  evidence: Evidence;
  vars?: Record<string, string | number>;
}
```

`ScanContext` carries `root` (normalized), `stacks: Set<Stack>`, `files: FileSet` (lazy caches), `liveCheckAuthorized`, `targetUrl`, `budget`. `RuleContext.http()` **throws** unless the rule declared `live: true` AND the flag was passed.

### Example rule A — `secrets-in-client-bundle`

Three detection branches, three honesty levels:
1. Known provider key literal (`sk_live_`, `sk-ant-`, `service_role` JWT, AWS `AKIA…`) in client-shipped files (`src/`, `app/`, `components/`, `dist/`, `.next/static/`) → **critical / certain**.
2. `VITE_*` / `NEXT_PUBLIC_*` env var whose *name* contains `SECRET|SERVICE_ROLE|PRIVATE|TOKEN|API_KEY` → **critical / likely** (value could be a placeholder).
3. High-entropy string (Shannon > 4.0) assigned to `key|secret|token|password` identifier → **high / possible** (the FP-prone branch — every known-safe pattern pinned in `test/false-positives/`; allowlist for known-public prefixes: `pk_live_`, `pk_test_`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`).

EN bundle (`i18n/rules/en/secrets-in-client-bundle.json`):
```json
{
  "title": "A password-level key is sitting in your app's public files",
  "why": "Anything shipped to the browser is readable by anyone who opens your site. A {provider} secret key found there can be used to spend your money or read your data.",
  "how": "Remove the key from client code, move it to a server-only environment variable, and — the part almost everyone skips — rotate it: create a new key and delete the old one at {provider}.",
  "check": "Open your live site, view page source, and search for sk_, SECRET, SERVICE_ROLE. Anything a stranger can find there, a stranger already has.",
  "fixedWhen": "The key has been rotated — a brand-new key issued and the old one revoked. A key that was ever public stays compromised even after you move it."
}
```
VI bundle keeps technical anchors (`rotate`, `key`, `revoke`, `provider`) per the site standard.

### Example rule B — `supabase-rls-missing` (maxConfidence: 'likely')

Only runs if Supabase client usage is found. Three branches:
- Migrations create tables, **zero** `ENABLE ROW LEVEL SECURITY` / `CREATE POLICY` anywhere → **critical / likely** (dashboard-set policies are invisible to a file scan — the rule structurally cannot claim certainty).
- Client usage but no `supabase/migrations/` at all → **high / possible** (`absence` evidence).
- Partial coverage → one **high / likely** finding per uncovered table.

`fixedWhen` reuses the site's proven wording: *"You can query each table with the anon key — never the service role key — and get back only what that person should see. RLS on with no policy denies everything and looks like a broken app; that's the cue to write policies, not to switch RLS back off."* The live rule `supabase-anon-readable` is what upgrades this to **certain** (observed rows returned).

## 3. Detection strategy & the confidence contract

**Regex + file heuristics by default; no AST parser in M1.** Bundling `typescript` (~60 MB) or Babel would destroy npx cold-start; the two rules that genuinely want structure (`client-side-only-auth`, `sql-string-interpolation`) ship regex-first with honest `possible`/`likely` confidence, and `oxc-parser` is added in M2 *only if* real-world FP data demands it. `FileSet.ast()` exists from day one as a lazy per-file cache so that upgrade is drop-in.

The honesty pattern, encoded via `maxConfidence`:
- **`certain`** requires either a literal in shipped code (matched `sk_live_` in a client file, `Access-Control-Allow-Origin: *` literal, `.env` in `git ls-files`) or a live observation (anon query returned rows; response headers actually missing).
- **Static rules blind to dashboard/edge/infra config cap at `likely`** (RLS, security headers in config, Stripe signature check possibly in a helper).
- **Heuristics with plausible innocent explanations cap at `possible`** (entropy matches, "no rate limiter found *in your code*", missing validation) — and their wording states exactly what was and wasn't seen ("we found no rate limit in your code — if you set one at your host, you're covered"), so the finding is true as written even when a mitigation exists elsewhere.

Pipeline: one fs walk (`fdir`), stack fingerprinting from `package.json`/config files, bounded-concurrency rule execution over the shared `FileSet`, suppression, severity gating, aggregate → sorted `ScanResult`. Files read once, lines split once (`\r?\n` — Windows), AST never in M1. Perf test asserts < 10 s on a large synthetic fixture.

## 4. Rule catalog (M1) — with FP challenges and proposed additions

| id | class | default sev | max conf | notes |
|---|---|---|---|---|
| secrets-in-client-bundle | secrets | critical | certain | 3 branches as above |
| env-committed-to-git | secrets | critical | certain | `git ls-files`; degrades to possible if git absent. Also flags real-looking secrets in `.env.example` |
| source-maps-in-prod | secrets | medium | likely | `.map` in `dist`/`.next/static` + no explicit opt-out |
| supabase-rls-missing | data-access | critical | likely | see above |
| supabase-anon-readable **(live)** | data-access | critical | certain | anon REST `select=*&limit=1` on tables discovered in source |
| public-storage-bucket | data-access | high | likely | bucket created public in migrations/config |
| upload-no-limits | data-access | medium | possible | upload endpoint, no type/size constraint found |
| client-side-only-auth | auth | high | possible | regex-first in M1; AST upgrade candidate |
| api-route-no-session | auth | high | likely | Next API routes / server actions with no session/auth import+call in file |
| admin-route-unprotected | auth | high | likely | `/admin` routes with no auth evidence |
| llm-proxy-open | money-abuse | critical | likely | endpoint calling OpenAI/Anthropic with no auth check in handler |
| stripe-webhook-unverified | money-abuse | high | likely | webhook handler; no `constructEvent`/`STRIPE_WEBHOOK_SECRET` anywhere in file |
| no-rate-limit-auth | money-abuse | medium | possible | **challenged — see below** |
| sql-string-interpolation | input | high | likely | template literal / concat into `.query(`-family calls |
| write-endpoint-no-validation | input | medium | possible | **challenged — see below** |
| missing-security-headers | deploy | medium | likely | static (config); paired live rule → certain |
| security-headers **(live)** | deploy | medium | certain | actual response headers |
| debug-mode-exposed | deploy | medium | likely | static + live (stack traces / debug flags in response) |
| wildcard-cors | deploy | high | certain | literal `*` with credentials context |
| dep-known-advisories | deploy | high | certain | npm registry bulk-advisory endpoint (allowed per constraints); critical advisories only; silently skipped offline / with `--offline` |

**Challenged (FP-risk mitigation, per the kickoff's request):**
- `no-rate-limit-auth` — infra-level limiters (Vercel, Cloudflare) are invisible; demoted to **medium/possible** and worded as "in your code". Never fails CI at default gate.
- `write-endpoint-no-validation` — validation via ORM constraints or DB checks is invisible; **medium/possible**, requires the endpoint to actually write from `req.body` before firing.
- `client-side-only-auth` — regex over `useEffect` + `router.push('/login')` patterns will miss and mis-hit; ships at **possible**, wording asks the user to run the site's own manual check (sign out, fetch anyway). First in line for the M2 AST upgrade.
- Entropy branch of secrets — capped `possible`; consider `--strict` opt-in if real-world noise is high.

**Proposed additions** (grounded in the site's own catalog; cheap and high-confidence):
- `lockfile-missing` (input/deploy, medium/certain) — no committed lockfile → hallucinated-package/slopsquatting exposure; direct tie-in to the blog's `hallucinated-packages`.
- `jwt-weak-secret` (auth, critical/certain) — hardcoded JWT secrets matching known AI-generated defaults (`supersecretjwt`, `secret`, `changeme`) — straight from the scanner plan's catalog.
- `git-exposed` **(live)** (secrets, critical/certain) — `GET /.git/HEAD` returns git content; already within the live allowlist.
- `env-exposed` **(live)** (secrets, critical/certain) — `GET /.env` returns env-shaped content.

**Deliberately out (non-goals honored):** style/lint anything, general SAST depth (taint analysis), SEO/a11y/perf categories from the SaaS scanner plan — this CLI is security-only.

## 5. Live-check safety model

All network I/O lives in `src/live/`; `RuleContext.http()` throws without authorization. If `--url` is given without `--i-own-this-site`, nothing is probed — a one-line notice explains the flag and the static scan proceeds.

- **Methods:** GET and HEAD only. Never POST/PUT/PATCH/DELETE, never auth attempts, never payloads (no SQLi/XSS/JWT forging — detection reads only).
- **Targets:** only the exact asserted origin + the app's own Supabase project URL discovered in source. Off-origin redirects not followed.
- **Fixed path allowlist:** `/`, `/.env`, `/.git/HEAD`, `/robots.txt`, `/security.txt`, `/.well-known/security.txt`, discovered `*.js.map`, Supabase REST `GET /rest/v1/<table>?select=*&limit=1` (anon key from the app's own source, limit=1).
- **Budgets:** 2 req/s, ≤ 25 requests total, 5 s per-request timeout, 20 s total live wall-clock, single connection.
- **robots.txt** fetched and respected for discovered/optional paths.
- **User-agent:** `trussary/<version> (+https://trussary.com/cli; self-scan)`.
- **Receipt:** every output format includes `LiveCheckReceipt { url, ownershipAsserted: true, assertedAt, userAgent, requestsMade, pathsProbed[], robotsRespected }` — the self-assertion and exact footprint are always on the record.

## 6. i18n

One JSON bundle **per rule per locale** (`i18n/rules/{en,vi}/<rule-id>.json`) + engine bundles. Hand-rolled `t(key, vars, locale)` with `{name}` interpolation; fallback chain locale → en → raw key (never blank, never crash). `--lang vi` wins over env detection.

Two CI gates keep "EN + VI both complete" true structurally:
1. **Parity test** — every key present in EN must exist in VI and vice versa; a rule without its VI bundle fails the build.
2. **Anchor lint** — VI strings must retain the rule's English technical anchor terms (e.g. `supabase-rls-missing` VI must contain `anon`, `RLS`, `service role`), operationalizing the site's co-writing standard.

JSON output pre-renders in the requested locale AND retains raw `{key, vars}` under `finding.i18n` for downstream re-rendering.

## 7. Config, suppression, output, exit codes

**`.trussaryrc`** (JSON only, walk-up discovery): `ignore` globs, per-rule `false` (disable) / `{severity}` override / `{minConfidence}`, `minSeverity` default. Precedence: flags > rc > defaults. Unknown rule ids warn (typo protection).

**Inline:** `// trussary-ignore <rule-id> [reason]` (line above) and `// trussary-ignore-line <rule-id>`. Suppressed findings aren't deleted — they're counted and listed in verbose/markdown output so silencing stays auditable. Suppression never affects exit code.

Default ignores (`node_modules`, `.git`, `dist`, `build`) apply to most rules but **not** to `secrets-in-client-bundle`/`source-maps-in-prod` — built output is exactly where those bugs ship.

**Terminal** (picocolors, `NO_COLOR`-aware): findings grouped critical→low, confidence shown on every finding, `possible` rendered muted with a "we can't be sure from files alone" note. Footer: counts, suppressed count, live receipt, soft trussary.com CTA (`--no-cta` to hide).

**JSON:** `ScanResult` with `schemaVersion: 1`; additive = minor, breaking = version bump. Paths POSIX in JSON (CI stability), native separators in terminal display.

**Markdown** (`--out`): summary table + one `##` per finding using the fix-block structure (Why it matters / Check whether this is you / Fixed when / How to fix / Before applying / Do NOT apply if).

**Exit codes:** `0` nothing at/above gate · `1` findings at/above gate · `2` usage/config error · `3` live check requested but network failed. Interactive default gate shows everything, fails on nothing; `--min-severity` makes CI gating explicit.

## 8. Dependencies (M1: 3 runtime deps)

| dep | why |
|---|---|
| `picocolors` | 2 kB colors, NO_COLOR-aware, zero deps (chalk rejected: heavier) |
| `fdir` | fastest zero-dep walker (fast-glob rejected: micromatch+braces tree; `fs.glob` is Node 22+) |
| `picomatch` | glob matching for rule inputs/ignores (minimatch rejected: heavier) |

Hand-rolled on purpose: arg parsing (~60 lines, one command), i18n (~35 lines), rc parsing (`JSON.parse`), secret patterns (curated ~15-provider data table, not trufflehog), git via `child_process` → `git ls-files`, HTTP via Node 20's global `fetch`, entropy/redaction/line-index. Dev deps (`typescript`, `tsup`, `vitest`, `@types/node`) don't ship — tsup bundles to a single `dist/cli.js`; `files:` allowlist in package.json; hard budget **< 2 MB unpacked**. M2-conditional: `oxc-parser`.

## 9. Testing

- **Fixtures:** `next-supabase-vulnerable`, `vite-react-vulnerable`, `express-vulnerable`, plus `next-clean` / `vite-clean` negative controls asserting **zero findings** — a rule that lights up on clean code fails CI.
- **Assertion tests** for detection (rule X on fixture Y → finding id/severity/confidence at file:line); **snapshot tests** only for renderers.
- **`test/false-positives/`** — known-safe-but-tempting snippets (anon key, `pk_live_`, CSS hashes, data URIs). Real-world FP reports get added here red-first, then the rule is defanged. This suite is the product's most important asset.
- **i18n parity + VI anchor lint** (§6); **perf gate** < 10 s; **CI matrix windows-latest + ubuntu-latest** (owner is on Windows: CRLF line-splitting, path normalization — POSIX internally via `path.posix`, native at display).

## 10. Milestones

**M1 — launch (npm publish `trussary@0.1.0`):**
1. *M1.0 engine spine* — walk, stack-detect, FileSet, registry, suppression, severity, terminal+json, exit codes, rc; 2 rules end-to-end (`secrets-in-client-bundle`, `env-committed-to-git`) proving the shape.
2. *M1.1 secrets + deploy* (highest signal, lowest FP) + markdown renderer.
3. *M1.2 data-access + auth* (static).
4. *M1.3 money-abuse + input* + proposed additions (`lockfile-missing`, `jwt-weak-secret`).
5. *M1.4 live module* — flag, budgets, receipt, `supabase-anon-readable`, `security-headers`, `git-exposed`, `env-exposed`.
6. *M1.5 VI complete* (co-written) + parity/anchor gates + full FP suite + perf gate → publish. README with trademark-safe naming (Lovable/Bolt/Replit/v0 in README + npm keywords only).

**M2 — honesty hardening & `explain`:** `oxc-parser` iff FP data demands it (upgrade `client-side-only-auth`, `sql-string-interpolation`); `trussary explain <rule-id>` (pure read over i18n bundles); new stacks (SvelteKit, Firebase) as fingerprint + rules.

**M3 — `fix` & ecosystem:** `trussary fix` for the safe-to-apply subset only (headers in config, `.gitignore` entries) with mandatory diff preview + `--dry-run` default — rotation-type fixes deliberately never auto-applied; GitHub Action wrapping `--format json` → SARIF (why the JSON schema is versioned from day one).

## 11. Open questions for the owner

1. **Site-copy amendment** (from Decision 1): who updates the four "source only" copy locations + `llms.txt` + the scanner plan doc, and does the CLI's live check stay unannounced until that lands?
2. **`dep-known-advisories` default:** on by default (POST to npm registry's bulk advisory endpoint — within the stated "npm registry" carve-out) with `--offline` to disable — confirm this reading of the network constraint.
3. **CTA copy** in the terminal footer and markdown report — owner-written to match brand voice (low-pressure, "nudge us"), needed before M1.5.
4. **VI co-writing** — plan assumes the owner (co-)writes/reviews every VI bundle during M1.5; confirm bandwidth, since it gates the launch by Decision 3.
5. **British spelling** in EN strings (site standard: "authorisation", "minimise") — assume yes?

## Verification

- `npm test` green: fixture assertions, zero-findings clean controls, false-positive suite, i18n parity + VI anchor lint, renderer snapshots, perf < 10 s.
- Manual: `npx . check test/fixtures/next-supabase-vulnerable` → expected findings with correct severities/confidences; `npx . check test/fixtures/next-clean` → exit 0, zero findings; `--format markdown --out report.md` renders the fix-block structure; `--lang vi` renders complete VI; `--url` without the flag probes nothing (verify with a local server + request log); `--url http://localhost:...` **with** flag stays within budget (≤ 25 req, 2 req/s) and prints the receipt.
- CI matrix (Windows + Linux) green; packed size `npm pack --dry-run` < 2 MB; `npx` cold-start pulls exactly 3 runtime deps.