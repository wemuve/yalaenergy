import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEnquiry,
  isPlausibleEmail,
  normaliseValue,
  hasHeaderInjection,
  formatEnquiry,
  FORM_SCHEMAS,
  ENQUIRY_ROUTE_OPTIONS,
  PROJECT_STAGES,
  SERVICE_OPTIONS,
  BESS_OPTIONS,
  HONEYPOT_FIELD,
  TIMESTAMP_FIELD,
  MIN_FILL_MS,
  MAX_LENGTHS,
} from '../../src/lib/enquiry.mjs';

const validContact = () => ({
  name: 'Kenneth Muteto',
  company: 'Yala Energy Limited',
  email: 'kenneth@yalaenergy.co.zm',
  country: 'Zambia',
  route: ENQUIRY_ROUTE_OPTIONS[0],
  message: 'We would like to discuss the Muchenje project.',
  consent: 'yes',
});

const validEngineering = () => ({
  name: 'A Developer',
  company: 'Example Renewables',
  email: 'projects@example.com',
  country: 'Zambia',
  projectStage: PROJECT_STAGES[2],
  service: SERVICE_OPTIONS[0],
  bessIncluded: BESS_OPTIONS[0],
  consent: 'yes',
});

describe('isPlausibleEmail', () => {
  const good = [
    'a@b.co',
    'first.last@sub.example.com',
    'name+tag@example.org',
    'NAME@EXAMPLE.COM',
    "o'brien".replace("'", '') + '@example.com',
  ];
  const bad = [
    '',
    'no-at-sign.com',
    'two@@example.com',
    'spaces in@example.com',
    'trailing@example.',
    'double..dot@example.com',
    '@example.com',
    'user@-example.com',
    'user@example',
    'user@example.c',
    'user@example.123',
    'a'.repeat(70) + '@example.com',
    'user@example.com\nBcc: attacker@evil.com',
    '"quoted"@example.com',
    'user<script>@example.com',
  ];

  for (const value of good) {
    test(`accepts ${JSON.stringify(value)}`, () => {
      assert.equal(isPlausibleEmail(value), true);
    });
  }
  for (const value of bad) {
    test(`rejects ${JSON.stringify(value)}`, () => {
      assert.equal(isPlausibleEmail(value), false);
    });
  }

  test('rejects non-strings', () => {
    for (const value of [null, undefined, 42, {}, []]) {
      assert.equal(isPlausibleEmail(value), false);
    }
  });
});

describe('normaliseValue', () => {
  test('trims surrounding whitespace', () => {
    assert.equal(normaliseValue('  hello  '), 'hello');
  });

  test('strips control characters', () => {
    assert.equal(normaliseValue('he\u0000l\u0007lo'), 'hello');
  });

  test('keeps newlines, which message bodies legitimately contain', () => {
    assert.equal(normaliseValue('line one\nline two'), 'line one\nline two');
  });

  test('returns an empty string for non-strings', () => {
    assert.equal(normaliseValue(undefined), '');
    assert.equal(normaliseValue(null), '');
    assert.equal(normaliseValue(123), '');
  });
});

describe('hasHeaderInjection', () => {
  test('flags carriage returns and newlines', () => {
    assert.equal(hasHeaderInjection('Subject\r\nBcc: x@y.z'), true);
    assert.equal(hasHeaderInjection('Subject\nBcc: x@y.z'), true);
  });

  test('passes ordinary values', () => {
    assert.equal(hasHeaderInjection('Yala Energy Limited'), false);
  });
});

describe('validateEnquiry — contact form', () => {
  test('accepts a complete submission', () => {
    const result = validateEnquiry('contact', validContact());
    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, {});
    assert.equal(result.spam, false);
  });

  test('rejects an unknown form id', () => {
    const result = validateEnquiry('nope', validContact());
    assert.equal(result.ok, false);
    assert.ok(result.errors._form);
  });

  test('rejects a non-object payload', () => {
    assert.equal(validateEnquiry('contact', null).ok, false);
    assert.equal(validateEnquiry('contact', 'string').ok, false);
  });

  test('requires every required field', () => {
    const result = validateEnquiry('contact', { consent: 'yes' });
    assert.equal(result.ok, false);
    for (const field of FORM_SCHEMAS.contact.filter((f) => f.required)) {
      assert.ok(result.errors[field.name], `expected an error for ${field.name}`);
    }
  });

  test('requires consent', () => {
    const payload = { ...validContact(), consent: '' };
    const result = validateEnquiry('contact', payload);
    assert.equal(result.ok, false);
    assert.ok(result.errors.consent);
  });

  test('rejects a consent value other than "yes"', () => {
    const result = validateEnquiry('contact', { ...validContact(), consent: 'on' });
    assert.equal(result.ok, false);
    assert.ok(result.errors.consent);
  });

  test('rejects a select value outside the allowed options', () => {
    const result = validateEnquiry('contact', { ...validContact(), route: 'Something else' });
    assert.equal(result.ok, false);
    assert.ok(result.errors.route);
  });

  test('enforces the maximum message length', () => {
    const payload = { ...validContact(), message: 'x'.repeat(MAX_LENGTHS.message + 1) };
    const result = validateEnquiry('contact', payload);
    assert.equal(result.ok, false);
    assert.ok(result.errors.message);
  });

  test('accepts a message at exactly the maximum length', () => {
    const payload = { ...validContact(), message: 'x'.repeat(MAX_LENGTHS.message) };
    assert.equal(validateEnquiry('contact', payload).ok, true);
  });

  test('rejects a header injection attempt in a single-line field', () => {
    const payload = { ...validContact(), name: 'Attacker\r\nBcc: evil@example.com' };
    const result = validateEnquiry('contact', payload);
    assert.equal(result.ok, false);
    assert.ok(result.errors.name);
  });

  test('returns normalised values, not raw input', () => {
    const result = validateEnquiry('contact', { ...validContact(), name: '  Spaced Name  ' });
    assert.equal(result.values.name, 'Spaced Name');
  });
});

describe('validateEnquiry — engineering form', () => {
  test('accepts a submission with only the required fields', () => {
    const result = validateEnquiry('engineering', validEngineering());
    assert.equal(result.ok, true);
  });

  test('requires the BESS answer', () => {
    const payload = { ...validEngineering() };
    delete payload.bessIncluded;
    const result = validateEnquiry('engineering', payload);
    assert.equal(result.ok, false);
    assert.ok(result.errors.bessIncluded);
  });

  test('accepts every allowed BESS answer', () => {
    for (const option of BESS_OPTIONS) {
      const result = validateEnquiry('engineering', { ...validEngineering(), bessIncluded: option });
      assert.equal(result.ok, true, `expected ${option} to be accepted`);
    }
  });

  test('optional fields may be omitted', () => {
    const result = validateEnquiry('engineering', validEngineering());
    assert.equal(result.values.projectLocation, '');
    assert.equal(result.values.timeline, '');
    assert.equal(result.ok, true);
  });
});

describe('spam controls', () => {
  test('a filled honeypot marks the submission as spam', () => {
    const payload = { ...validContact(), [HONEYPOT_FIELD]: 'http://spam.example' };
    const result = validateEnquiry('contact', payload);
    assert.equal(result.spam, true);
    assert.equal(result.ok, false);
  });

  test('timing is not enforced on the client', () => {
    const payload = { ...validContact(), [TIMESTAMP_FIELD]: String(Date.now()) };
    const result = validateEnquiry('contact', payload, { enforceTiming: false });
    assert.equal(result.spam, false);
    assert.equal(result.ok, true);
  });

  test('an instant submission is spam when timing is enforced', () => {
    const now = 1_000_000;
    const payload = { ...validContact(), [TIMESTAMP_FIELD]: String(now - 100) };
    const result = validateEnquiry('contact', payload, { enforceTiming: true, now });
    assert.equal(result.spam, true);
    assert.equal(result.ok, false);
  });

  test('a submission after the minimum fill time passes', () => {
    const now = 1_000_000;
    const payload = { ...validContact(), [TIMESTAMP_FIELD]: String(now - MIN_FILL_MS - 1) };
    const result = validateEnquiry('contact', payload, { enforceTiming: true, now });
    assert.equal(result.spam, false);
    assert.equal(result.ok, true);
  });

  test('a missing or nonsense timestamp is spam when timing is enforced', () => {
    const now = 1_000_000;
    for (const value of [undefined, '', 'abc', '0', '-5']) {
      const payload = { ...validContact(), [TIMESTAMP_FIELD]: value };
      const result = validateEnquiry('contact', payload, { enforceTiming: true, now });
      assert.equal(result.spam, true, `expected ${JSON.stringify(value)} to be treated as spam`);
    }
  });
});

describe('formatEnquiry', () => {
  test('includes every supplied field under its label', () => {
    const values = validateEnquiry('contact', validContact()).values;
    const text = formatEnquiry('contact', values);
    assert.match(text, /Full name: Kenneth Muteto/);
    assert.match(text, /Business email: kenneth@yalaenergy\.co\.zm/);
    assert.match(text, /How can we help\?: We would like to discuss/);
  });

  test('omits empty optional fields', () => {
    const values = validateEnquiry('engineering', validEngineering()).values;
    const text = formatEnquiry('engineering', values);
    assert.doesNotMatch(text, /Expected timeline:/);
  });

  test('tolerates an unknown form id', () => {
    assert.match(formatEnquiry('nope', {}), /Enquiry form: nope/);
  });
});

describe('schema integrity', () => {
  test('every field has a unique name within its form', () => {
    for (const [formId, schema] of Object.entries(FORM_SCHEMAS)) {
      const names = schema.map((field) => field.name);
      assert.equal(new Set(names).size, names.length, `duplicate field name in ${formId}`);
    }
  });

  test('select and radio fields always declare their options', () => {
    for (const schema of Object.values(FORM_SCHEMAS)) {
      for (const field of schema) {
        if (field.type === 'select' || field.type === 'radio') {
          assert.ok(Array.isArray(field.options) && field.options.length > 0, field.name);
        }
      }
    }
  });

  test('no field name collides with a spam control', () => {
    for (const schema of Object.values(FORM_SCHEMAS)) {
      for (const field of schema) {
        assert.notEqual(field.name, HONEYPOT_FIELD);
        assert.notEqual(field.name, TIMESTAMP_FIELD);
        assert.notEqual(field.name, 'consent');
      }
    }
  });
});
