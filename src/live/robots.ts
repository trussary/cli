/**
 * A deliberately small robots.txt reader: enough to honour Disallow rules for
 * our own user-agent or for everyone, and nothing more. Anything we cannot
 * parse confidently is treated as "allowed", because the fixed diagnostic
 * paths are already the equivalent of the owner opening their own site.
 */

export interface RobotsRules {
  allows(path: string): boolean;
}

export function parseRobots(text: string): RobotsRules {
  const disallow: string[] = [];
  const allow: string[] = [];
  let applies = false;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (line === '') continue;
    const [field, ...rest] = line.split(':');
    const key = (field ?? '').trim().toLowerCase();
    const value = rest.join(':').trim();

    if (key === 'user-agent') {
      applies = value === '*' || value.toLowerCase().includes('trussary');
      continue;
    }
    if (!applies) continue;
    if (key === 'disallow' && value !== '') disallow.push(value);
    if (key === 'allow' && value !== '') allow.push(value);
  }

  return {
    allows(path: string): boolean {
      const longest = (rules: string[]) =>
        rules.filter((r) => path.startsWith(r)).reduce((best, r) => Math.max(best, r.length), -1);
      const deny = longest(disallow);
      if (deny < 0) return true;
      return longest(allow) >= deny; // a more specific Allow wins, as robots.txt intends
    },
  };
}
