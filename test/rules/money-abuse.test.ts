import { describe, expect, it } from 'vitest';
import { at, findingsFor, scanFixture } from '../helpers/scan.js';

describe('llm-proxy-open', () => {
  it('flags a model endpoint with no caller check as critical', async () => {
    const { findings } = await scanFixture('express-vulnerable', { only: ['llm-proxy-open'] });
    const hit = findingsFor(findings, 'llm-proxy-open')[0];

    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('critical');
    expect(hit?.confidence).toBe('likely');
    expect(at(hit!)).toContain('src/routes/chat.js');
  });

  it('does not fire for a model call in client code', async () => {
    // The client-side key is a secrets finding; it is not an open proxy.
    const { findings } = await scanFixture('next-supabase-vulnerable', {
      only: ['llm-proxy-open'],
    });
    expect(findings).toHaveLength(0);
  });
});

describe('stripe-webhook-unverified', () => {
  it('flags a webhook that acts on an unverified event', async () => {
    const { findings } = await scanFixture('express-vulnerable', {
      only: ['stripe-webhook-unverified'],
    });
    const hit = findingsFor(findings, 'stripe-webhook-unverified')[0];

    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('high');
    expect(at(hit!)).toContain('src/routes/webhook.js');
  });
});

describe('no-rate-limit-auth', () => {
  it('never claims more than possible, and never above medium', async () => {
    const { findings } = await scanFixture('express-vulnerable', { only: ['no-rate-limit-auth'] });
    const hit = findingsFor(findings, 'no-rate-limit-auth')[0];

    expect(hit).toBeDefined();
    expect(hit?.confidence).toBe('possible');
    expect(hit?.severity).toBe('medium');
    expect(hit?.evidence.kind).toBe('absence');
  });
});

describe('jwt-weak-secret', () => {
  it('flags a placeholder signing secret as certain', async () => {
    const { findings } = await scanFixture('express-vulnerable', { only: ['jwt-weak-secret'] });
    const hit = findingsFor(findings, 'jwt-weak-secret')[0];

    expect(hit).toBeDefined();
    expect(hit?.severity).toBe('critical');
    expect(hit?.confidence).toBe('certain');
    expect(at(hit!)).toBe('src/auth.js:9');
  });
});
