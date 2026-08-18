# trussary

Security check for apps built with AI. It reads your project and tells you, in
plain language, what a stranger could reach — exposed keys, database tables
with no protection, endpoints that never ask who is calling.

Built for people shipping apps made with Lovable, Bolt, Replit, v0 or Claude
Code, on Next.js, Vite + React, Supabase, Vercel and Express.

```bash
npx trussary check
```

No install, no account, no code leaves your machine unless you explicitly ask
for a live check of your own site.

## What it looks for

Six classes of the mistakes AI-built apps actually ship with:

| Class | Examples |
| --- | --- |
| **secrets** | a paid API key in your website's public files, a committed `.env`, source maps shipping your original code |
| **data access** | Supabase tables with no Row Level Security, public storage buckets, uploads with no stated limits |
| **auth** | admin pages protected only by a hard-to-guess URL, API routes that never check a session, guards that run in the browser after the data has already arrived |
| **money abuse** | an open proxy to a paid model API, a payment webhook that believes whatever it is sent, no limit on sign-in attempts |
| **input** | queries built by pasting values into text, endpoints that save whatever they are given |
| **deploy** | wildcard CORS, missing security headers, debug output on a live site, critical advisories in your dependencies, no lockfile |

## Confidence, and why it is on every finding

A file scan cannot see your Supabase dashboard, your host's settings, or your
CDN. Rather than guess and sound certain, every finding says how sure it is —
and a rule structurally cannot claim more than it can know:

- **certain** — observed directly. A `sk_live_` key in a file that ships to the
  browser; a `*` in your CORS setting; your live site answering with data.
- **likely** — the evidence is in your files, but the mitigation could live
  somewhere we cannot read.
- **possible** — a heuristic with an innocent explanation. Worded as what we
  did and did not see: "we found no rate limit **in your code**".

Nothing here fails your build unless you ask it to. `--min-severity high` makes
CI gating explicit; without it, the command shows everything and exits 0.

## Checking your live site

Static checks read files. Some questions can only be answered by asking the
deployed site — is `/.env` actually downloadable, does the database hand rows
to a stranger. That needs two flags, together:

```bash
npx trussary check --url https://myapp.vercel.app --i-own-this-site
```

The rules, which are hard limits rather than defaults:

- **GET and HEAD only.** Never a write, never a login attempt, never a payload.
  Nothing is sent that could change anything.
- **A fixed path allowlist**: `/`, `/.env`, `/.git/HEAD`, `/robots.txt`,
  `/security.txt`, `/.well-known/security.txt`, plus your own Supabase project's
  REST endpoint using the anon key already published in your own website.
- **Your origin only.** Redirects off it are not followed.
- **2 requests per second, 25 requests total, 5s per request, 20s in all.**
- **robots.txt** is fetched and honoured for anything beyond the fixed paths.
- **A receipt** in every output format: the URL, the time you asserted
  ownership, the user agent, and every path touched.

Pass `--url` without `--i-own-this-site` and nothing is probed at all — the
command says so and carries on with the file scan.

Only point this at a site you own.

## Options

```
trussary check [path] [options]

  --format <terminal|json|markdown>   Output format (default: terminal)
  --out <file>                        Write the report to a file
  --lang <en|vi>                      Output language (default: en)
  --url <https://…>                   Also check your live site
  --i-own-this-site                   Assert you own the --url target
  --min-severity <level>              Exit 1 when findings reach this level
  --offline                           Skip the npm advisory lookup
  --verbose                           List suppressed findings
  --no-cta                            Hide the trussary.com footer line
```

Exit codes: `0` nothing at or above the gate · `1` findings at or above it ·
`2` a usage or config error · `3` a live check was asked for and the network
failed.

## Configuration

A `.trussaryrc` next to your project (JSON, discovered by walking up):

```json
{
  "ignore": ["vendor/**"],
  "minSeverity": "high",
  "rules": {
    "no-rate-limit-auth": false,
    "upload-no-limits": { "severity": "low" },
    "client-side-only-auth": { "minConfidence": "likely" }
  }
}
```

Or in the code itself:

```js
// trussary-ignore jwt-weak-secret rotating this before launch
```

Suppressed findings are counted and listed rather than deleted, so silencing
something stays visible. Suppression never changes the exit code.

## Vietnamese

`--lang vi` renders everything in Vietnamese. The technical terms stay in
English — `RLS`, `anon key`, `rotate`, `endpoint` — because those are the words
your dashboard uses and the words you would search for. The explanation around
them is Vietnamese, written rather than machine-translated, and a build gate
enforces both halves of that.

## What it is not

Not a linter, not a general-purpose SAST tool, not a code-quality checker. It
looks for the specific ways AI-built apps get broken into, and nothing else. A
clean result means these checks passed — it is not a certificate.

If you want a person to look at the whole picture, that is what
[trussary.com](https://trussary.com) is for.

## Requirements

Node 20 or newer. Three runtime dependencies (`picocolors`, `fdir`,
`picomatch`).

## Licence

MIT.

---

Lovable, Bolt, Replit, v0, Supabase, Vercel, Next.js and Claude Code are
trademarks of their respective owners. This project is not affiliated with any
of them; the names appear here to describe what the tool reads.
