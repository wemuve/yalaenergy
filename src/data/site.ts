export const BRAND = {
  name: 'Yala Energy',
  legalName: 'Yala Energy Limited',
  slogan: 'Powering a Greener Future.',
  supportingHeadline: 'Renewable Energy. Engineered to Perform.',
  descriptor: 'Renewable-energy project development and PV & BESS engineering consulting.',
} as const;

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly description?: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/', description: 'Who we are and how we work' },
  { label: 'Projects', href: '/projects/', description: 'Our development portfolio' },
  {
    label: 'PV & BESS Engineering',
    href: '/pv-bess-engineering/',
    description: 'Design, simulation and consulting',
  },
  { label: 'Contact', href: '/contact/', description: 'Start a conversation' },
];

export const FOOTER_NAV: readonly { readonly title: string; readonly items: readonly NavItem[] }[] = [
  {
    title: 'Company',
    items: [
      { label: 'About Yala Energy', href: '/about/' },
      { label: 'Leadership', href: '/about/#leadership' },
      { label: 'Governance', href: '/about/#governance' },
      { label: 'Contact', href: '/contact/' },
    ],
  },
  {
    title: 'Development',
    items: [
      { label: 'Projects', href: '/projects/' },
      { label: 'Muchenje Solar PV Plant', href: '/projects/muchenje-solar-pv-plant/' },
      { label: 'Investment & partnership', href: '/projects/#investment' },
    ],
  },
  {
    title: 'Engineering',
    items: [
      { label: 'PV & BESS Engineering', href: '/pv-bess-engineering/' },
      { label: 'Deliverables', href: '/pv-bess-engineering/#deliverables' },
      { label: 'Request an assessment', href: '/pv-bess-engineering/#enquiry' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { label: 'Privacy policy', href: '/privacy/' },
      { label: 'Information accuracy', href: '/information-accuracy/' },
    ],
  },
];

/**
 * Contact details carried over from existing company materials.
 * `verified: false` items are rendered with an explicit verification note and
 * must be confirmed by the company before launch. No telephone number is
 * published here because none has been verified — see the checklist in
 * `docs/verification-checklist.md`.
 */
export const CONTACT = {
  email: 'info@yalaenergy.co.zm',
  offices: [
    {
      id: 'lusaka',
      label: 'Registered / Lusaka office',
      lines: [
        'Suite No. 2, Private Bag E891',
        'Manda Hill Shopping Centre',
        'Lusaka, Zambia',
      ],
      verified: false,
    },
    {
      id: 'project',
      label: 'Project site address',
      lines: [
        'Farm No. L/Chibo/1469453',
        'College Road, off Mungule Road',
        'Chibombo, Central Province, Zambia',
      ],
      verified: false,
    },
  ],
  /**
   * Set to a verified number to publish it; the contact page and footer render
   * an explanatory note while it is empty. Typed as `string` rather than
   * narrowed to the empty literal so that adding a number here does not turn
   * the "no number published" branches into dead code.
   */
  telephone: '' as string,
} as const;

export const ENQUIRY_ROUTES = [
  {
    id: 'project-investment',
    eyebrow: 'Route 01',
    title: 'Project development & investment',
    summary:
      'For equity investors, development partners, offtakers, utilities and lenders who want to understand the Muchenje project or our wider development pipeline.',
    bullets: [
      'Equity and development partnership discussions',
      'Project information and data-room access requests',
      'Offtake and interconnection conversations',
    ],
    formTarget: '/contact/#enquiry',
    cta: 'Discuss an investment or development partnership',
  },
  {
    id: 'engineering',
    eyebrow: 'Route 02',
    title: 'PV & BESS engineering and consulting',
    summary:
      'For developers, project owners, EPC contractors and investors who need solar PV design, energy-storage assessment and technical-commercial modelling.',
    bullets: [
      'Utility-scale PV design and energy-yield simulation',
      'Battery energy storage sizing and architecture assessment',
      'Technical-commercial scenario modelling',
    ],
    formTarget: '/pv-bess-engineering/#enquiry',
    cta: 'Request a PV & BESS assessment',
  },
  {
    id: 'general',
    eyebrow: 'Route 03',
    title: 'General & partnership enquiries',
    summary:
      'For suppliers, community stakeholders, media, recruitment and anything that does not fit the two routes above.',
    bullets: [
      'Supplier and contractor registration',
      'Community and stakeholder engagement',
      'Media and general company questions',
    ],
    formTarget: '/contact/#enquiry',
    cta: 'Send a general enquiry',
  },
] as const;
