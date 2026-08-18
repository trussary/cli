import type { DetectedFinding, Rule } from '../types.js';
import { isAnalysableSource, SOURCE_GLOBS } from '../helpers/paths.js';
import { trimExcerpt } from '../helpers/redact.js';

/**
 * A webhook endpoint that believes whatever it is told. Stripe signs every
 * event; verifying that signature is what separates "Stripe says this order
 * was paid" from "someone typed a JSON body that says it was paid".
 *
 * The verification may live in a shared helper we cannot follow, so: 'likely'.
 */

const WEBHOOK_FILE = /webhook/i;
const STRIPE_USAGE = /\bstripe\b/i;
const VERIFICATION = /constructEvent|STRIPE_WEBHOOK_SECRET|webhooks?\s*\.\s*constructEvent|stripe-signature/i;

/** The handler acts on the event — that is what makes the missing check matter. */
const ACTS_ON_EVENT =
  /event\s*\.\s*type|\.\s*(?:insert|update|upsert|create)\s*\(|fulfill|grantAccess|markPaid|setSubscription/i;

export const stripeWebhookUnverified: Rule = {
  id: 'stripe-webhook-unverified',
  ruleClass: 'money-abuse',
  defaultSeverity: 'high',
  maxConfidence: 'likely',
  inputs: { globs: SOURCE_GLOBS },

  detect(ctx): DetectedFinding[] {
    const out: DetectedFinding[] = [];

    for (const file of ctx.files.list(SOURCE_GLOBS)) {
      if (!isAnalysableSource(file.path)) continue;
      const content = ctx.files.read(file.path);
      if (!STRIPE_USAGE.test(content)) continue;
      if (!WEBHOOK_FILE.test(file.path) && !WEBHOOK_FILE.test(content)) continue;
      if (VERIFICATION.test(content)) continue;
      if (!ACTS_ON_EVENT.test(content)) continue;

      const lines = ctx.files.lines(file.path);
      const idx = lines.findIndex((l) => ACTS_ON_EVENT.test(l));

      out.push({
        confidence: 'likely',
        evidence: {
          kind: 'file',
          path: file.path,
          line: idx + 1,
          excerpt: trimExcerpt(lines[idx] as string),
        },
        vars: { file: file.path, line: idx + 1 },
      });
    }
    return out;
  },
};
