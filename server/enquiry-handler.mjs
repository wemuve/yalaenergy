/**
 * Enquiry submission handler.
 *
 * A dependency-free, standards-based handler: it takes a `Request` and returns
 * a `Response`, so it runs unchanged on Vercel Functions, Netlify Functions,
 * Cloudflare Workers, Deno Deploy, or behind a small Node adapter. Deployment
 * recipes are in the README.
 *
 * It is NOT bundled into the website. Nothing in `src/` imports it, so no
 * secret it reads can leak into the browser bundle.
 *
 * Security posture:
 *   • Origin allow-list, so the endpoint cannot be driven from other sites.
 *   • Request body size cap before parsing.
 *   • Server-side validation via the same module the browser uses.
 *   • Honeypot and submission-timing checks, answered with a 200 so that a bot
 *     learns nothing from the response.
 *   • Per-IP rate limiting.
 *   • Header-injection guards on every value that reaches the mail envelope.
 *   • No submitted content is echoed back in any response.
 */
import { validateEnquiry, formatEnquiry, hasHeaderInjection } from '../src/lib/enquiry.mjs';

const MAX_BODY_BYTES = 24 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

/**
 * In-memory rate limiter. Adequate for a single long-lived instance; on a
 * platform that scales to many short-lived instances, back this with a shared
 * store (Upstash, KV, Redis) — see the README.
 * @type {Map<string, number[]>}
 */
const hits = new Map();

function rateLimited(key, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > RATE_LIMIT_MAX;
}

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extraHeaders,
    },
  });
}

function allowedOrigins(env) {
  return (env.ENQUIRY_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsHeaders(origin, allowed) {
  if (!origin || !allowed.includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function clientKey(request) {
  const headers = request.headers;
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-real-ip') ??
    (headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ??
    'unknown'
  );
}

/**
 * @param {Request} request
 * @param {Record<string, string | undefined>} env
 * @returns {Promise<Response>}
 */
export async function handleEnquiry(request, env = process.env) {
  const allowed = allowedOrigins(env);
  const origin = request.headers.get('origin');
  const cors = corsHeaders(origin, allowed);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') {
    return json(405, { message: 'Method not allowed.' }, { allow: 'POST, OPTIONS', ...cors });
  }

  // A cross-origin POST from an origin we do not recognise is refused outright.
  if (origin && allowed.length > 0 && !allowed.includes(origin)) {
    return json(403, { message: 'Origin not permitted.' });
  }

  if (rateLimited(clientKey(request))) {
    return json(
      429,
      { message: 'Too many enquiries from this address. Please try again later, or email info@yalaenergy.co.zm.' },
      { 'retry-after': '600', ...cors },
    );
  }

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json(413, { message: 'That message is too long to submit here. Please email it instead.' }, cors);
  }

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { message: 'That message is too long to submit here. Please email it instead.' }, cors);
    }
    payload = JSON.parse(raw);
  } catch {
    return json(400, { message: 'Could not read that submission.' }, cors);
  }

  const formId = typeof payload?.formId === 'string' ? payload.formId : '';
  const result = validateEnquiry(formId, payload, { enforceTiming: true });

  // Spam is accepted with a success response on purpose: telling a bot which
  // signal caught it is free information for whoever wrote it.
  if (result.spam) {
    return json(200, { message: 'Thank you. Your enquiry has been received.' }, cors);
  }

  if (!result.ok) {
    return json(422, { message: 'Some fields need attention.', errors: result.errors }, cors);
  }

  const to = env.ENQUIRY_TO_ADDRESS ?? 'info@yalaenergy.co.zm';
  const subject =
    formId === 'engineering'
      ? `PV & BESS assessment request — ${result.values.company || 'unnamed company'}`
      : `Website enquiry — ${result.values.company || 'unnamed company'}`;

  // Belt and braces: the validator already rejects these, but the envelope is
  // the one place where a stray newline turns into an injected header.
  if (hasHeaderInjection(subject) || hasHeaderInjection(result.values.email)) {
    return json(422, { message: 'Some fields need attention.', errors: { email: 'Invalid value.' } }, cors);
  }

  try {
    await deliver({
      to,
      replyTo: result.values.email,
      subject,
      text: formatEnquiry(formId, result.values),
      env,
    });
  } catch (error) {
    // Never surface provider internals to the client.
    console.error('[enquiry] delivery failed:', error instanceof Error ? error.message : error);
    return json(
      502,
      { message: 'We could not deliver your enquiry just now. Please email info@yalaenergy.co.zm directly.' },
      cors,
    );
  }

  return json(
    200,
    { message: 'Thank you. Your enquiry has been sent and we will respond to the email address you provided.' },
    cors,
  );
}

/**
 * Delivery via Resend. Swap the fetch below for Postmark, SES or your provider
 * of choice — nothing else in this file depends on which one is used.
 */
async function deliver({ to, replyTo, subject, text, env }) {
  const apiKey = env.ENQUIRY_MAIL_API_KEY;
  if (!apiKey) {
    throw new Error('ENQUIRY_MAIL_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM_ADDRESS ?? 'Yala Energy website <website@yalaenergy.co.zm>',
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`mail provider responded ${response.status}`);
  }
}

/** Vercel / Netlify edge-style default export. */
export default (request) => handleEnquiry(request);

/** Exported for the unit tests. */
export const __testing = { rateLimited, RATE_LIMIT_MAX, MAX_BODY_BYTES };
