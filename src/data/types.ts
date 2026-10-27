/**
 * Verification vocabulary.
 *
 * Every externally-facing factual claim on this website carries one of these
 * statuses. The UI renders the status next to the claim, so the site can be
 * ambitious about the project without ever asserting something that has not
 * been documented. See `docs/verification-checklist.md`.
 */
export type ClaimStatus =
  | 'confirmed' //    Documented and verifiable; safe to state as fact.
  | 'supplied' //     Stated by the company; supporting document not yet reviewed.
  | 'estimate' //     Sponsor-provided estimate requiring validation.
  | 'assumption' //   Design assumption for the current project concept.
  | 'in-progress' //  Work actively under way.
  | 'outstanding'; // Not yet secured, applied for or agreed.

export interface StatusMeta {
  readonly label: string;
  readonly description: string;
}

export const STATUS_META: Record<ClaimStatus, StatusMeta> = {
  confirmed: {
    label: 'Confirmed',
    description: 'Documented and verifiable.',
  },
  supplied: {
    label: 'Company-stated',
    description: 'Stated by Yala Energy; supporting documentation under review.',
  },
  estimate: {
    label: 'Estimate',
    description: 'Sponsor estimate requiring validation through detailed study.',
  },
  assumption: {
    label: 'Design assumption',
    description: 'Working assumption of the current project concept, subject to change.',
  },
  'in-progress': {
    label: 'In progress',
    description: 'Work under way; not yet complete.',
  },
  outstanding: {
    label: 'Outstanding',
    description: 'Not yet secured, applied for or agreed.',
  },
};

export interface Metric {
  readonly value: string;
  /** Numeric component, used for the accessible count-up animation. */
  readonly numeric?: number;
  readonly unit?: string;
  readonly prefix?: string;
  readonly label: string;
  readonly note: string;
  readonly status: ClaimStatus;
}

export interface TimelineStage {
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly items: readonly string[];
  readonly status: ClaimStatus;
  readonly statusLine: string;
}

export interface Capability {
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  readonly points: readonly string[];
  readonly href?: string;
  readonly linkLabel?: string;
}

export interface ServiceBlock {
  readonly id: string;
  readonly index: string;
  readonly title: string;
  readonly lede: string;
  readonly scope: readonly string[];
  readonly boundary: string;
}

export interface Person {
  readonly name: string;
  readonly role: string;
  readonly initials: string;
  readonly summary: string;
  readonly credentials: readonly string[];
  readonly experience: readonly string[];
  readonly status: ClaimStatus;
}
