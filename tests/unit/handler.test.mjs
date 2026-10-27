import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { handleEnquiry } from '../../server/enquiry-handler.mjs';
import { ENQUIRY_ROUTE_OPTIONS, TIMESTAMP_FIELD, MIN_FILL_MS, HONEYPOT_FIELD } from '../../src/lib/enquiry.mjs';

const ORIGIN = 'https://yalaenergy.co.zm';

const baseEnv = () => ({
  ENQUIRY_ALLOWED_ORIGINS: `${ORIGIN},https://www.yalaenergy.co.zm`,
  ENQUIRY_TO_ADDRESS: 'info@yalaenergy.co.zm',
  // Deliberately no mail key: delivery is expected to fail, which lets these
  // tests exercise every path up to and including the delivery boundary
  // without sending mail or reaching the network.
});

/**
 * Each request carries a distinct forwarded IP so the handler's rate limiter
 * (five submissions per address per ten minutes) does not bleed between tests.
 */
let ipCounter = 0;
function makeRequest(body, { method = 'POST', origin = ORIGIN, headers = {} } = {}) {
  ipCounter += 1;
  return new Request('https://api.example.com/enquiry', {
    method,
    headers: {
      'content-type': 'application/json',
      origin,
      'x-real-ip': `203.0.113.${ipCounter % 250}:${ipCounter}`,
      ...headers,
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

const goodBody = (overrides = {}) => ({
  formId: 'contact',
  name: 'Kenneth Muteto',
  company: 'Yala Energy Limited',
  email: 'kenneth@yalaenergy.co.zm',
  country: 'Zambia',
  route: ENQUIRY_ROUTE_OPTIONS[0],
  message: 'We would like to discuss the project.',
  consent: 'yes',
  [TIMESTAMP_FIELD]: String(Date.now() - MIN_FILL_MS - 500),
  ...overrides,
});

describe('enquiry handler — method and origin', () => {
  test('answers a preflight with 204 and CORS headers', async () => {
    const response = await handleEnquiry(makeRequest(null, { method: 'OPTIONS' }), baseEnv());
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), ORIGIN);
  });

  test('rejects GET with 405', async () => {
    const response = await handleEnquiry(makeRequest(null, { method: 'GET' }), baseEnv());
    assert.equal(response.status, 405);
  });

  test('rejects an origin outside the allow-list', async () => {
    const response = await handleEnquiry(
      makeRequest(goodBody(), { origin: 'https://evil.example' }),
      baseEnv(),
    );
    assert.equal(response.status, 403);
  });

  test('does not send CORS headers to a disallowed origin', async () => {
    const response = await handleEnquiry(
      makeRequest(goodBody(), { origin: 'https://evil.example' }),
      baseEnv(),
    );
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });
});

describe('enquiry handler — payload handling', () => {
  test('rejects malformed JSON with 400', async () => {
    const request = new Request('https://api.example.com/enquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': '198.51.100.9' },
      body: '{not json',
    });
    const response = await handleEnquiry(request, baseEnv());
    assert.equal(response.status, 400);
  });

  test('rejects an oversized declared body with 413', async () => {
    const response = await handleEnquiry(
      makeRequest(goodBody(), { headers: { 'content-length': String(64 * 1024) } }),
      baseEnv(),
    );
    assert.equal(response.status, 413);
  });

  test('returns 422 with per-field errors for an invalid submission', async () => {
    const response = await handleEnquiry(makeRequest(goodBody({ email: 'not-an-email' })), baseEnv());
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.ok(body.errors.email);
  });

  test('returns 422 when consent is missing', async () => {
    const response = await handleEnquiry(makeRequest(goodBody({ consent: '' })), baseEnv());
    assert.equal(response.status, 422);
    const body = await response.json();
    assert.ok(body.errors.consent);
  });

  test('rejects an unknown form id', async () => {
    const response = await handleEnquiry(makeRequest(goodBody({ formId: 'other' })), baseEnv());
    assert.equal(response.status, 422);
  });

  test('never echoes submitted content back to the client', async () => {
    const secret = 'CONFIDENTIAL-MARKER-9f3a';
    const response = await handleEnquiry(makeRequest(goodBody({ message: secret, email: 'bad' })), baseEnv());
    const text = await response.text();
    assert.ok(!text.includes(secret));
  });
});

describe('enquiry handler — spam controls', () => {
  test('a filled honeypot gets a 200 that reveals nothing', async () => {
    const response = await handleEnquiry(
      makeRequest(goodBody({ [HONEYPOT_FIELD]: 'http://spam.example' })),
      baseEnv(),
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.match(body.message, /received/i);
  });

  test('an instant submission is treated as spam, not delivered', async () => {
    const response = await handleEnquiry(
      makeRequest(goodBody({ [TIMESTAMP_FIELD]: String(Date.now()) })),
      baseEnv(),
    );
    // 200 rather than 502: delivery was never attempted.
    assert.equal(response.status, 200);
  });
});

describe('enquiry handler — delivery boundary', () => {
  test('a valid submission reaches delivery and fails cleanly without a mail key', async () => {
    const response = await handleEnquiry(makeRequest(goodBody()), baseEnv());
    assert.equal(response.status, 502);
    const body = await response.json();
    assert.match(body.message, /email info@yalaenergy\.co\.zm/);
  });

  test('a delivery failure does not leak provider internals', async () => {
    const response = await handleEnquiry(makeRequest(goodBody()), baseEnv());
    const text = await response.text();
    assert.ok(!text.includes('ENQUIRY_MAIL_API_KEY'));
    assert.ok(!text.toLowerCase().includes('resend'));
  });

  test('responses are marked no-store', async () => {
    const response = await handleEnquiry(makeRequest(goodBody()), baseEnv());
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });
});

describe('enquiry handler — rate limiting', () => {
  test('a sixth submission from one address in the window is refused', async () => {
    const env = baseEnv();
    const ip = '192.0.2.77';
    const send = () =>
      handleEnquiry(
        new Request('https://api.example.com/enquiry', {
          method: 'POST',
          headers: { 'content-type': 'application/json', origin: ORIGIN, 'x-real-ip': ip },
          body: JSON.stringify(goodBody()),
        }),
        env,
      );

    const statuses = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push((await send()).status);
    }

    assert.ok(
      statuses.slice(0, 5).every((status) => status !== 429),
      `expected the first five through, got ${statuses.join(',')}`,
    );
    assert.equal(statuses[5], 429);
  });
});
