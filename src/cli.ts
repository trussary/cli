#!/usr/bin/env node
import { checkCommand, type CheckFlags } from './commands/check.js';
import { EXIT_USAGE } from './report/exit-code.js';
import { VERSION } from './version.js';

const HELP = `trussary ${VERSION} — security check for apps built with AI

Usage:
  trussary check [path] [options]

Options:
  --format <terminal|json|markdown>   Output format (default: terminal)
  --out <file>                        Write the report to a file
  --lang <en|vi>                      Output language (default: en)
  --url <https://…>                   Also check your live site (requires --i-own-this-site)
  --i-own-this-site                   Assert you own the --url target. Never probe a site
                                      that is not yours.
  --min-severity <level>              Exit non-zero when findings reach this level
                                      (critical | high | medium | low)
  --offline                           Skip checks that need the npm registry
  --verbose                           List suppressed findings
  --no-cta                            Hide the trussary.com footer line
  --help, -h                          Show this help
  --version, -v                       Show the version

Examples:
  npx trussary check
  npx trussary check ./my-app --format markdown --out report.md
  npx trussary check --lang vi
  npx trussary check --url https://myapp.vercel.app --i-own-this-site
  npx trussary check --min-severity high
`;

interface ParsedArgs {
  command?: string;
  flags: CheckFlags;
  help: boolean;
  version: boolean;
  errors: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const flags: CheckFlags = {
    path: '.',
    format: 'terminal',
    iOwnThisSite: false,
    offline: false,
    verbose: false,
    noCta: false,
  };
  const parsed: ParsedArgs = { flags, help: false, version: false, errors: [] };
  const positional: string[] = [];

  const takesValue = new Set(['--format', '--out', '--lang', '--url', '--min-severity']);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    switch (arg) {
      case '--help':
      case '-h':
        parsed.help = true;
        break;
      case '--version':
      case '-v':
        parsed.version = true;
        break;
      case '--i-own-this-site':
        flags.iOwnThisSite = true;
        break;
      case '--offline':
        flags.offline = true;
        break;
      case '--verbose':
        flags.verbose = true;
        break;
      case '--no-cta':
        flags.noCta = true;
        break;
      default: {
        if (takesValue.has(arg)) {
          const value = argv[++i];
          if (value === undefined || value.startsWith('--')) {
            parsed.errors.push(`${arg} needs a value`);
            break;
          }
          if (arg === '--format') {
            if (value === 'terminal' || value === 'json' || value === 'markdown') {
              flags.format = value;
            } else {
              parsed.errors.push(`unknown format "${value}" (terminal | json | markdown)`);
            }
          } else if (arg === '--out') flags.out = value;
          else if (arg === '--lang') flags.lang = value;
          else if (arg === '--url') flags.url = value;
          else if (arg === '--min-severity') flags.minSeverity = value;
          break;
        }
        if (arg.startsWith('-')) {
          parsed.errors.push(`unknown option "${arg}"`);
          break;
        }
        positional.push(arg);
      }
    }
  }

  if (positional.length > 0) parsed.command = positional[0] as string;
  if (positional.length > 1) flags.path = positional[1] as string;
  return parsed;
}

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }
  if (parsed.help || parsed.command === undefined) {
    process.stdout.write(HELP);
    return parsed.help || parsed.command === undefined ? 0 : EXIT_USAGE;
  }
  if (parsed.errors.length > 0) {
    for (const e of parsed.errors) process.stderr.write(`${e}\n`);
    return EXIT_USAGE;
  }
  if (parsed.command !== 'check') {
    process.stderr.write(`Unknown command "${parsed.command}". Only "check" exists (for now).\n`);
    return EXIT_USAGE;
  }
  return checkCommand(parsed.flags);
}

main().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`trussary: ${(err as Error).message}\n`);
    process.exit(EXIT_USAGE);
  },
);
