/**
 * Enquiry form controller.
 *
 * Three behaviours, chosen by whether an endpoint is configured:
 *
 *   • **No endpoint** → DEMO MODE. The form validates fully and then says, in
 *     plain words, that nothing was sent and where to email instead. It never
 *     claims a submission was delivered.
 *   • **Endpoint configured** → the submission is POSTed as JSON and the real
 *     outcome is reported, including server-side field errors.
 *   • **No JavaScript** → the <form> falls back to a `mailto:` action with the
 *     subject prefilled, and a visible note explains it.
 *
 * Validation here mirrors `src/lib/enquiry.mjs` exactly, because that same
 * module is what the server handler runs. Client validation is for feedback
 * speed; the server decides.
 */
import { validateEnquiry, TIMESTAMP_FIELD } from '../lib/enquiry.mjs';

interface Outcome {
  state: 'success' | 'error' | 'demo';
  title: string;
  body: string;
}

export function initForms(): void {
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>('[data-enquiry-form]'));
  forms.forEach(setupForm);
}

function setupForm(form: HTMLFormElement): void {
  const formId = form.dataset.enquiryForm ?? 'contact';
  const endpoint = (form.dataset.endpoint ?? '').trim();
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-form-submit]');
  const timestamp = form.querySelector<HTMLInputElement>(`[name="${TIMESTAMP_FIELD}"]`);

  // Stamped from the client so the value reflects when this visitor actually
  // saw the form, not when the page was built and cached.
  if (timestamp) timestamp.value = String(Date.now());

  // The mailto fallback only exists for the no-JavaScript case. Once this
  // controller is running, submission is handled here.
  form.removeAttribute('action');
  form.removeAttribute('target');
  form.noValidate = true;
  const fallbackNote = form.querySelector<HTMLElement>('[data-nojs-note]');
  if (fallbackNote) fallbackNote.hidden = true;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = collect(form);
    const result = validateEnquiry(formId, payload, { enforceTiming: false });

    clearErrors(form);

    if (!result.ok) {
      applyErrors(form, result.errors);
      const firstKey = Object.keys(result.errors)[0];
      const field = firstKey ? form.querySelector<HTMLElement>(`[name="${firstKey}"]`) : null;
      report(status, {
        state: 'error',
        title: 'Please check the highlighted fields',
        body: `${Object.keys(result.errors).length} field${
          Object.keys(result.errors).length === 1 ? '' : 's'
        } need${Object.keys(result.errors).length === 1 ? 's' : ''} attention before this can be sent.`,
      });
      field?.focus();
      return;
    }

    if (!endpoint) {
      report(status, {
        state: 'demo',
        title: 'Demo mode — nothing was sent',
        body:
          'This form passed validation, but no submission endpoint is configured for this deployment, so your message has not been delivered to anyone. ' +
          'Please email info@yalaenergy.co.zm directly. To enable live submissions, set PUBLIC_ENQUIRY_ENDPOINT (see README).',
      });
      return;
    }

    setBusy(submit, true);
    report(status, { state: 'demo', title: 'Sending…', body: 'Submitting your enquiry.' });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ formId, ...payload }),
      });

      const data = await response.json().catch(() => ({}) as Record<string, unknown>);

      if (response.ok) {
        form.reset();
        if (timestamp) timestamp.value = String(Date.now());
        report(status, {
          state: 'success',
          title: 'Enquiry received',
          body:
            typeof data.message === 'string'
              ? data.message
              : 'Thank you. Your enquiry has been sent and we will respond to the email address you provided.',
        });
        return;
      }

      if (response.status === 422 && data.errors && typeof data.errors === 'object') {
        applyErrors(form, data.errors as Record<string, string>);
        report(status, {
          state: 'error',
          title: 'Please check the highlighted fields',
          body: 'The server could not accept this submission as entered.',
        });
        return;
      }

      report(status, {
        state: 'error',
        title: 'That did not go through',
        body:
          typeof data.message === 'string'
            ? data.message
            : `The server responded with status ${response.status}. Please try again, or email info@yalaenergy.co.zm.`,
      });
    } catch {
      report(status, {
        state: 'error',
        title: 'Could not reach the server',
        body:
          'Your enquiry was not sent — this is usually a network problem. Please try again, or email info@yalaenergy.co.zm directly.',
      });
    } finally {
      setBusy(submit, false);
    }
  });

  // Clear a field's error as soon as the visitor starts fixing it.
  form.addEventListener('input', (event) => {
    const target = event.target as HTMLElement;
    if (!('name' in target)) return;
    const name = (target as HTMLInputElement).name;
    if (name) clearFieldError(form, name);
  });
}

function collect(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form);
  const payload: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === 'string') payload[key] = value;
  }
  // An unchecked checkbox is absent from FormData; normalise it explicitly.
  const consent = form.querySelector<HTMLInputElement>('[name="consent"]');
  payload.consent = consent?.checked ? 'yes' : '';
  return payload;
}

function errorHost(form: HTMLFormElement, name: string): HTMLElement | null {
  return form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
}

function applyErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  for (const [name, message] of Object.entries(errors)) {
    const host = errorHost(form, name);
    if (host) host.textContent = message;
    const controls = form.querySelectorAll<HTMLElement>(`[name="${name}"]`);
    controls.forEach((control) => {
      control.setAttribute('aria-invalid', 'true');
      if (host?.id) {
        const described = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
        if (!described.includes(host.id)) {
          control.setAttribute('aria-describedby', [...described, host.id].join(' '));
        }
      }
    });
  }
}

function clearFieldError(form: HTMLFormElement, name: string): void {
  const host = errorHost(form, name);
  if (host) host.textContent = '';
  form
    .querySelectorAll<HTMLElement>(`[name="${name}"]`)
    .forEach((control) => control.removeAttribute('aria-invalid'));
}

function clearErrors(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((host) => {
    host.textContent = '';
  });
  form
    .querySelectorAll<HTMLElement>('[aria-invalid="true"]')
    .forEach((control) => control.removeAttribute('aria-invalid'));
}

function report(status: HTMLElement | null, outcome: Outcome): void {
  if (!status) return;
  status.dataset.state = outcome.state;
  status.innerHTML = '';
  const title = document.createElement('strong');
  title.className = 'form__status-title';
  title.textContent = outcome.title;
  const body = document.createElement('span');
  body.textContent = outcome.body;
  status.append(title, body);
}

function setBusy(button: HTMLButtonElement | null, busy: boolean): void {
  if (!button) return;
  button.dataset.busy = busy ? 'true' : 'false';
  button.disabled = busy;
  const spinner = button.querySelector<HTMLElement>('[data-spinner]');
  if (spinner) spinner.hidden = !busy;
}
