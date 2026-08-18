# Changelog

All notable changes to this project are documented here. The JSON output has
its own `schemaVersion`: additive changes are a minor release, breaking ones
bump the schema version.

## [0.1.0] — unreleased

First release.

### Added

- `trussary check [path]` — the only command: scans a repository and explains
  what it finds in language a non-engineer can act on.
- 24 rules across six classes: secrets, data access, auth, money abuse, input
  and deploy. Every finding carries a confidence (`certain` / `likely` /
  `possible`) that a rule cannot exceed, so a check that cannot see your
  dashboard never claims it can.
- Live checks behind `--url` plus `--i-own-this-site`: GET and HEAD only, a
  fixed path allowlist, 2 requests per second, at most 25 requests, and a
  receipt of every path touched in every output format.
- English and Vietnamese, both complete, gated by a parity test and an anchor
  lint that keeps English technical terms in the Vietnamese text.
- Output as terminal, JSON (`schemaVersion: 1`) or Markdown; `--min-severity`
  for CI gating; `.trussaryrc` and `// trussary-ignore` for suppression, which
  marks findings rather than deleting them.
