# Landing page updates the CLI requires

What has to change on trussary.com now that `trussary/cli` M1 has landed. Written
from the CLI side; the edits all happen in `D:\Projects\vibe-support`.

Two things changed that the site does not know about:

1. **There is now a scanner.** The site currently states there isn't one.
2. **It can touch a live site** — GET/HEAD only, on a fixed path allowlist, and
   only when the person running it passes `--i-own-this-site` about their own
   URL. The site currently promises, four times, that nothing of ours ever
   touches a live system.

The second one sounds worse than it is, and the framing matters for every edit
below. **The free review still reads source only.** What changed is that there
is now a separate thing — a CLI the owner runs on their own machine, against
their own site, on their own instruction. Nobody at Trussary probes anything.
Every amendment below preserves the original promise and scopes it to the
review, rather than weakening it.

---

## 1. Blocking — copy that becomes false the day the CLI is announced

All in `web/messages/en.json` and `web/messages/vi.json` unless noted. Current
text is quoted exactly so you can find it; suggested text is a starting point in
the house voice, not finished copy.

### 1.1 `how.steps[1].body`

> EN: "…We read source only — never your live system or your users' data."
> VI: "…Chúng tôi chỉ đọc mã nguồn, không đụng vào hệ thống thật hay dữ liệu người dùng."

Suggested EN: "…We read source only — never your live system or your users'
data. (Our CLI can check your live site, but only you can run it, and only
against a site you tell it you own.)"

Suggested VI: "…Chúng tôi chỉ đọc mã nguồn, không đụng vào hệ thống thật hay dữ
liệu người dùng. (CLI của chúng tôi có thể kiểm tra site đang chạy, nhưng chỉ
bạn mới chạy được, và chỉ với site bạn tự xác nhận là của mình.)"

### 1.2 `safety.items[0]` — **not on the original list**

> EN: "Read-only access — you give read-only access and revoke it whenever you want. We read source only, never your live system or your users' data."

The scanner plan's decision note lists four locations. This is a fifth, and it
carries the same sentence. It renders through `web/components/SafetySection.tsx`.
Amend it the same way as 1.1, or scope it: "…We read source only, never your
live system or your users' data."→ "…When **we** review, we read source only —
never your live system or your users' data."

### 1.3 `faq.items[2].a`

> EN: "…We read source only — never your production system, database, or users' data."

Same amendment. This one is the most-read of the five, so it is worth spending
the most words here — probably a full extra sentence naming the CLI and the
flag, since a reader who has just run `npx trussary` will come to the FAQ with
exactly this question.

### 1.4 `privacy.sections[1].body`

> EN: "…If you share a link to something you have built, we open it ourselves when we read your message — nothing here fetches it automatically, and we only ever read what is already public."

Still true of the **site**, and it should stay. But "nothing here fetches it
automatically" now needs a companion sentence about the CLI, because the CLI
does fetch — on the reader's own machine, at their own instruction. See §2 for
the new privacy section this wants.

### 1.5 `privacy.sections[3].body` ("Your code")

> EN: "…We read source only — never your production system, your database, or your users' data. We don't keep copies of your code once we've sent our notes."

Same amendment as 1.1. Keep the second sentence exactly as it is — the CLI never
sends code anywhere, so it strengthens rather than weakens.

### 1.6 `web/app/llms.txt/route.ts` — two separate problems

**Line ~89**, in "Facts worth getting right":

> "Access to code is read-only, to a snapshot the owner can revoke. Production systems, databases and user data are never touched."

**Line ~101**, in the 90%-figure note:

> "Trussary did not run that study and runs no scanner of its own."

The second is the one to catch. It is a flat factual claim, written to stop
models attributing the study to you — and shipping the CLI makes it false in a
way that a model quoting it would spread. Replace with something like: "Trussary
did not run that study. Trussary does publish a free CLI scanner
(`npx trussary check`) that runs on the user's own machine; it did not produce
that figure."

`llms.txt` is also where you should add the CLI to the **Pages** list once it has
a page, and remove it from "Not on this site" if anything there implies no
tooling.

### 1.7 The recorded decision itself

`docs/scanner-reverse-engineering-plan.md`, Part 8 question 3 (~line 401) reads
**"Answered 2026-08-14: verified domains only, always… This is not a default to
be relaxed per-customer or behind a flag."**

The CLI's live check is precisely a flag. The reasoning in that answer is still
sound for the **hosted SaaS scanner** it was written about — you probing a URL a
stranger typed is a completely different risk from a person probing their own
site from their own laptop. Amend it to say so explicitly, rather than leaving a
contradiction for future-you to trip over: keep "verified domains only, always"
for anything Trussary operates, and record the CLI as a separate case where the
operator and the owner are the same person and the traffic never originates from
your infrastructure.

Worth adding to that note, since it is what makes the distinction defensible: the
CLI is GET/HEAD only, never sends a payload, never attempts authentication,
follows no redirects off the asserted origin, honours robots.txt for anything
beyond the fixed diagnostic paths, caps at 2 requests/second and 25 requests
total, and writes a receipt of every path it touched into every output format.
The CFAA reasoning in the original answer does not reach a person scanning their
own property.

---

## 2. New — a privacy section for the CLI

Nothing on the privacy page describes the CLI, and it now has its own data-flow
story that a careful reader will ask about. Suggest a new
`privacy.sections[*]` after "Your code":

- **The CLI runs on your machine.** Your code is never uploaded, and there is no
  account, no telemetry and no analytics in it.
- **It makes two kinds of outbound request, both of which you control.** By
  default it asks the npm registry whether any of your dependencies has a
  critical advisory — that sends package names and version numbers, nothing
  else, to the same registry `npm install` already talks to. `--offline` turns
  it off.
- **It only touches your site if you tell it to**, with `--url` plus
  `--i-own-this-site`. Then: GET and HEAD only, a fixed list of paths, no
  payloads, no login attempts, at most 25 requests. Every report it prints
  includes a receipt of exactly which paths it asked for.

That last bullet is worth putting on the page verbatim, because it is the
strongest privacy claim on the whole site and it is checkable — the receipt is
in the output.

---

## 3. New — the CLI needs somewhere to live

There is no mention of a CLI anywhere on the site today. At minimum:

- **A page** (`/cli` or a section on `/safe-to-launch`) with the one-liner
  `npx trussary check`, what it looks for, and the confidence idea — that every
  finding says how sure it is, and a check that cannot see your dashboard never
  claims it can. That last part is the differentiator against every other
  scanner in this space, and it is the thing the site can say that they can't.
- **A link from `/safe-to-launch`.** That page ends with "Want a second pair of
  eyes?" — the CLI is the honest self-serve answer for someone who is not ready
  to email a stranger, and it maps onto the list directly (see §4).
- **`llms.txt`** entry, per §1.6.
- **The blog pillar** — `vibe-coding-mistakes` describes ten failure modes the
  CLI now detects by name. Each section is a natural place for "you can check
  this one with `npx trussary check`".

---

## 4. The seven checks ↔ the 24 rules

`/safe-to-launch` is already the CLI's outline. This mapping is worth putting on
the page — it shows the CLI is the same advice, automated, rather than a
different product:

| # | Check | CLI rules |
| --- | --- | --- |
| 1 | Can anyone read your API keys? | `secrets-in-client-bundle`, `env-committed-to-git`, `source-maps-in-prod`, `env-exposed`, `git-exposed` |
| 2 | Is your database open to anyone who asks? | `supabase-rls-missing`, `supabase-anon-readable`, `public-storage-bucket` |
| 3 | Does the server check who's asking? | `api-route-no-session`, `admin-route-unprotected`, `client-side-only-auth`, `jwt-weak-secret` |
| 4 | Are you keeping more than you need? | *(none — data minimisation is a judgement call, not a scan)* |
| 5 | What happens when it breaks? | `debug-mode-exposed`, `missing-security-headers`, `security-headers` |
| 6 | What happens when fifty people show up? | `no-rate-limit-auth`, `llm-proxy-open`, `upload-no-limits` |
| 7 | Can you undo it? | `lockfile-missing` |

Check 4 having no rule is worth saying out loud on the page rather than hiding —
it is the clearest possible demonstration that the CLI does not replace the
review, which is the whole funnel argument.

Rules with no check of their own — `wildcard-cors`, `sql-string-interpolation`,
`write-endpoint-no-validation`, `stripe-webhook-unverified`,
`dep-known-advisories` — are candidates for an eighth check, or for the blog.

### Blog pillar anchors

The CLI's rule ids and the pillar's section ids are close but not aligned. If you
want the CLI to deep-link into the blog later (an `explain` command is M2), these
are the pairs worth keeping stable:

| CLI rule id | Blog section id |
| --- | --- |
| `supabase-rls-missing` | `rls-never-enabled` |
| `secrets-in-client-bundle` | `secrets-in-bundle` |
| `no-rate-limit-auth` | `no-rate-limit` |
| `api-route-no-session` | `missing-authorisation` |
| `lockfile-missing` | `hallucinated-packages` |
| `client-side-only-auth` | `looks-right` |

---

## 5. Severity vocabulary

`blog.severity` in both locales is a three-level scale — `high` = "Critical",
`med` = "Worth fixing", `low` = "Worth knowing". The CLI ships four levels. The
mapping, if CLI output ever feeds the site or the review funnel:

| CLI | Site |
| --- | --- |
| critical, high | `high` — "Critical" |
| medium | `med` — "Worth fixing" |
| low | `low` — "Worth knowing" |

No change needed unless you want the site to display CLI output directly. If you
do, add the fourth level rather than collapsing — the CLI separates critical from
high precisely because "someone can read your database" and "your admin page is
unguarded" are different conversations.

---

## 6. What does *not* need to change

Worth stating so nobody edits these by accident:

- **`privacy.sections[5]` "Please don't paste secrets"** — still true, and now
  more useful. The CLI redacts secret values out of its own evidence, so a
  report is safe to send in a way that a screenshot of the code is not. That is
  worth one sentence there.
- **"free, no paid tier"** — the CLI is MIT-licensed and free. Unchanged.
- **"It is advice and review, not an agency"** — unchanged.
- **The 90% figure and its attribution** — the study is still not yours. Only
  the "runs no scanner of its own" clause needs the edit (§1.6).
- **"read-only access to a snapshot you can revoke"** — unchanged, and it is the
  sentence the CLI amendments should be careful to leave standing.

---

## Order of work

1. §1.6 `llms.txt` "runs no scanner of its own" — the only claim that is
   *actively wrong* rather than incomplete, and models are already quoting it.
2. §1.1–1.5, the five source-only sentences, EN + VI together.
3. §1.7 the recorded decision, so the contradiction is resolved in writing
   before anyone else reads the plan.
4. §2 the privacy section, §3 the CLI's page.
5. §4 and §5 whenever the CLI page gets written.

Steps 1–3 are the ones that must land **before** the CLI is announced anywhere
public. Steps 4–5 are the funnel, and can follow.
