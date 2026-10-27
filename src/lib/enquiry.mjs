/**
 * Shared enquiry-form schema and validation.
 *
 * This module is plain ESM with no build step and no dependencies, so the exact
 * same validation runs in three places:
 *   1. the browser, for immediate accessible feedback;
 *   2. `server/enquiry-handler.mjs`, as the authoritative server-side check;
 *   3. `tests/unit/enquiry.test.mjs`, under `node --test`.
 *
 * Client-side validation is a convenience. The server-side call is the one that
 * decides whether a submission is accepted.
 */

/** @typedef {'text'|'email'|'select'|'textarea'|'radio'|'checkbox'} FieldType */

/**
 * @typedef {object} Field
 * @property {string} name
 * @property {string} label
 * @property {FieldType} type
 * @property {boolean} required
 * @property {string} [hint]
 * @property {string} [autocomplete]
 * @property {number} [maxLength]
 * @property {readonly string[]} [options]
 * @property {boolean} [wide]
 */

export const MAX_LENGTHS = Object.freeze({
  name: 120,
  company: 160,
  email: 254,
  country: 120,
  projectLocation: 160,
  capacity: 80,
  timeline: 120,
  message: 4000,
  subject: 160,
});

export const PROJECT_STAGES = Object.freeze([
  'Early concept',
  'Site identified',
  'Feasibility stage',
  'Permitting / licensing',
  'Pre-financial close',
  'Under construction',
  'Operational asset',
]);

export const SERVICE_OPTIONS = Object.freeze([
  'Utility-scale PV design and simulation',
  'Battery energy storage assessment',
  'Technical-commercial modelling',
  'Project development support',
  'Combination / not sure yet',
]);

export const BESS_OPTIONS = Object.freeze(['Yes', 'No', 'Still deciding']);

export const ENQUIRY_ROUTE_OPTIONS = Object.freeze([
  'Project development and investment',
  'PV & BESS engineering and consulting',
  'General and partnership enquiry',
]);

/** Field name used as a honeypot. Real people never fill it in. */
export const HONEYPOT_FIELD = 'website_url';
/** Hidden field holding the time the form was rendered, in ms since epoch. */
export const TIMESTAMP_FIELD = 'form_rendered_at';
/** Submissions faster than this are rejected as automated. */
export const MIN_FILL_MS = 2500;

/** @type {Readonly<Record<string, readonly Field[]>>} */
export const FORM_SCHEMAS = Object.freeze({
  contact: Object.freeze([
    { name: 'name', label: 'Full name', type: 'text', required: true, autocomplete: 'name', maxLength: MAX_LENGTHS.name },
    { name: 'company', label: 'Company or organisation', type: 'text', required: true, autocomplete: 'organization', maxLength: MAX_LENGTHS.company },
    { name: 'email', label: 'Business email', type: 'email', required: true, autocomplete: 'email', maxLength: MAX_LENGTHS.email },
    { name: 'country', label: 'Country', type: 'text', required: true, autocomplete: 'country-name', maxLength: MAX_LENGTHS.country },
    {
      name: 'route',
      label: 'What is your enquiry about?',
      type: 'select',
      required: true,
      options: ENQUIRY_ROUTE_OPTIONS,
      wide: true,
    },
    {
      name: 'message',
      label: 'How can we help?',
      type: 'textarea',
      required: true,
      maxLength: MAX_LENGTHS.message,
      hint: 'Please avoid sending confidential or commercially sensitive information through this form.',
      wide: true,
    },
  ]),
  engineering: Object.freeze([
    { name: 'name', label: 'Full name', type: 'text', required: true, autocomplete: 'name', maxLength: MAX_LENGTHS.name },
    { name: 'company', label: 'Company', type: 'text', required: true, autocomplete: 'organization', maxLength: MAX_LENGTHS.company },
    { name: 'email', label: 'Business email', type: 'email', required: true, autocomplete: 'email', maxLength: MAX_LENGTHS.email },
    { name: 'country', label: 'Country', type: 'text', required: true, autocomplete: 'country-name', maxLength: MAX_LENGTHS.country },
    {
      name: 'projectLocation',
      label: 'Project location',
      type: 'text',
      required: false,
      maxLength: MAX_LENGTHS.projectLocation,
      hint: 'District, province or coordinates if you have them.',
    },
    {
      name: 'capacity',
      label: 'Project capacity',
      type: 'text',
      required: false,
      maxLength: MAX_LENGTHS.capacity,
      hint: 'For example 20 MWp, or a range if it is not fixed yet.',
    },
    { name: 'projectStage', label: 'Project stage', type: 'select', required: true, options: PROJECT_STAGES },
    { name: 'service', label: 'Service required', type: 'select', required: true, options: SERVICE_OPTIONS },
    { name: 'bessIncluded', label: 'Is battery storage in scope?', type: 'radio', required: true, options: BESS_OPTIONS, wide: true },
    {
      name: 'timeline',
      label: 'Expected timeline',
      type: 'text',
      required: false,
      maxLength: MAX_LENGTHS.timeline,
      hint: 'When you need the assessment, and any decision date it feeds.',
    },
    {
      name: 'message',
      label: 'Additional information',
      type: 'textarea',
      required: false,
      maxLength: MAX_LENGTHS.message,
      hint: 'Please avoid sending confidential or commercially sensitive information through this form.',
      wide: true,
    },
  ]),
});

/**
 * Deliberately conservative email check: one @, a dot-bearing domain, no
 * whitespace, no angle brackets, no commas. Rejecting an exotic-but-valid
 * address is a far smaller problem here than accepting a malformed one.
 * @param {string} value
 */
export function isPlausibleEmail(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > MAX_LENGTHS.email) return false;
  if (/[\s<>,;"'\\()[\]]/.test(trimmed)) return false;
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  // A dot may separate parts of the local address but may not start it, end it
  // or repeat — ".."" is only legal inside a quoted local part, which is
  // rejected above along with every other quoted form.
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!domain || domain.length > 253 || !domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  const tld = domain.slice(domain.lastIndexOf('.') + 1);
  return /^[a-z]{2,24}$/i.test(tld);
}

/**
 * Strip control characters and collapse runaway whitespace. Values are escaped
 * at the point of rendering, not here; this only removes characters that have
 * no business in a form field.
 * @param {unknown} value
 */
export function normaliseValue(value) {
  if (typeof value !== 'string') return '';
  /* eslint-disable-next-line no-control-regex */
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[ \t]{3,}/g, '  ').trim();
}

/** Header-injection guard for values that may reach an email envelope. */
export function hasHeaderInjection(value) {
  return typeof value === 'string' && /[\r\n]/.test(value);
}

/**
 * Validate a submission against one of the schemas.
 *
 * @param {string} formId  Key of `FORM_SCHEMAS`.
 * @param {Record<string, unknown>} payload
 * @param {{ now?: number, enforceTiming?: boolean }} [options]
 * @returns {{ ok: boolean, errors: Record<string, string>, values: Record<string, string>, spam: boolean }}
 */
export function validateEnquiry(formId, payload, options = {}) {
  const schema = FORM_SCHEMAS[formId];
  /** @type {Record<string, string>} */
  const errors = {};
  /** @type {Record<string, string>} */
  const values = {};

  if (!schema) {
    return { ok: false, errors: { _form: 'Unknown form.' }, values, spam: false };
  }
  if (payload === null || typeof payload !== 'object') {
    return { ok: false, errors: { _form: 'Invalid submission.' }, values, spam: false };
  }

  // Spam signals are evaluated first and never explained back to the client.
  let spam = false;
  if (normaliseValue(payload[HONEYPOT_FIELD]) !== '') spam = true;
  if (options.enforceTiming) {
    const renderedAt = Number(payload[TIMESTAMP_FIELD]);
    const now = options.now ?? Date.now();
    if (!Number.isFinite(renderedAt) || renderedAt <= 0) spam = true;
    else if (now - renderedAt < MIN_FILL_MS) spam = true;
  }

  for (const field of schema) {
    const raw = normaliseValue(payload[field.name]);
    values[field.name] = raw;

    if (!raw) {
      if (field.required) errors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (field.maxLength && raw.length > field.maxLength) {
      errors[field.name] = `${field.label} must be ${field.maxLength} characters or fewer.`;
      continue;
    }
    if (field.type === 'email' && !isPlausibleEmail(raw)) {
      errors[field.name] = 'Enter a valid business email address, for example name@company.com.';
      continue;
    }
    if ((field.type === 'select' || field.type === 'radio') && field.options && !field.options.includes(raw)) {
      errors[field.name] = `Choose one of the available options for ${field.label.toLowerCase()}.`;
      continue;
    }
    if (field.type !== 'textarea' && hasHeaderInjection(raw)) {
      errors[field.name] = `${field.label} contains characters that are not allowed.`;
    }
  }

  if (normaliseValue(payload.consent) !== 'yes') {
    errors.consent = 'Please confirm you have read how we handle your information.';
  }

  return { ok: Object.keys(errors).length === 0 && !spam, errors, values, spam };
}

/**
 * Render a validated submission as a plain-text email body.
 * @param {string} formId
 * @param {Record<string, string>} values
 */
export function formatEnquiry(formId, values) {
  const schema = FORM_SCHEMAS[formId] ?? [];
  const lines = [`Enquiry form: ${formId}`, `Received: ${new Date().toISOString()}`, ''];
  for (const field of schema) {
    const value = values[field.name];
    if (value) lines.push(`${field.label}: ${value}`);
  }
  return lines.join('\n');
}
