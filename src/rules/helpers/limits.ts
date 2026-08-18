/**
 * Rate limiting and input validation, as they appear in code. Both are also
 * commonly done somewhere a file scan cannot see — at the host, the CDN, or
 * in database constraints — which is why every rule using these lists says
 * "we found none in your code" rather than "you have none".
 */

export const RATE_LIMITER =
  /\b(rateLimit|rateLimiter|ratelimit|Ratelimit|express-rate-limit|@upstash\/ratelimit|limiter|throttle|slowDown|bottleneck|arcjet|@arcjet\/|leakyBucket|tokenBucket)\b/i;

export const VALIDATION_LIBRARY =
  /\b(zod|yup|joi|valibot|superstruct|ajv|class-validator|typebox|@sinclair\/typebox|arktype)\b|\b\w+\.(?:parse|safeParse|validate|validateAsync|assert)\s*\(/;

/** Hand-written checking: someone looked at the shape of the input themselves. */
export const MANUAL_VALIDATION =
  /typeof\s+\w+(?:\.\w+)*\s*(?:===?|!==?)\s*['"](?:string|number|boolean|object)['"]|\bArray\.isArray\s*\(|\.length\s*[<>]=?\s*\d|Number\.isInteger\s*\(|\!\s*\w+\.\w+\s*\)\s*(?:return|throw)/;

/** Reading the caller's body — the input that needs checking. */
export const READS_REQUEST_BODY =
  /\breq\s*\.\s*body\b|\bawait\s+req(?:uest)?\s*\.\s*json\s*\(\s*\)|\bawait\s+req(?:uest)?\s*\.\s*formData\s*\(\s*\)|\bformData\s*\.\s*get\s*\(/;

/** Writing that body somewhere durable. */
export const WRITES_DATA =
  /\.\s*(?:insert|update|upsert|delete|create|createMany|updateMany)\s*\(|\bINSERT\s+INTO\b|\bUPDATE\s+\w+\s+SET\b/i;

/**
 * The body arrived with a signature that was checked, so it is not arbitrary
 * caller input any more — whatever else is wrong, it is not this rule.
 */
export const BODY_AUTHENTICATED =
  /constructEvent|verifyWebhook|stripe-signature|x-hub-signature|svix-signature|webhookSecret|WEBHOOK_SECRET/i;
