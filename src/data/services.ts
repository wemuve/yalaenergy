import type { ServiceBlock } from './types';

export const SERVICES_PAGE = {
  title: 'PV & BESS Engineering, Design and Consulting',
  heroHeadline: 'Better solar projects start with better modelling.',
  heroLede:
    'Yala Energy supports developers, project owners, EPC contractors and investors with solar PV design, energy-storage assessment, technical modelling and project-development support. Every engagement has a written scope, stated inputs and declared assumptions — so you know exactly what the output can and cannot be used for.',
  positioning:
    'This is engineering-informed consulting. We produce the analysis that lets you choose between configurations, size a storage system honestly and test a business case before committing capital. It is not a substitute for detailed design, protection studies, grid-code compliance work or manufacturer validation — and we say which is which in every deliverable.',
} as const;

export const SERVICES: readonly ServiceBlock[] = [
  {
    id: 'pv-design',
    index: '01',
    title: 'Utility-scale PV design and simulation',
    lede:
      'The configuration decisions made in the first weeks of a solar project set its yield for twenty-five years. We model them properly before they get locked in.',
    scope: [
      'Preliminary plant layout and land-use assessment',
      'DC and AC capacity configuration',
      'DC/AC ratio scenario comparisons',
      'Module and inverter configuration assessment',
      'Expected energy-yield simulation',
      'Loss and inverter-clipping analysis',
      'Equipment quantity estimates',
      'Technical scenario comparisons',
      'Preliminary CAPEX assumptions, where supported by current inputs',
    ],
    boundary:
      'Preliminary design and simulation at feasibility and pre-FID level. Detailed electrical design, single-line diagrams for construction, protection coordination, earthing design and grid-code compliance studies are separate scopes requiring a licensed design authority.',
  },
  {
    id: 'bess',
    index: '02',
    title: 'Battery Energy Storage Systems',
    lede:
      'Storage is sized by the job it has to do. We start from the operating profile and work back to energy, power and duration — not the other way around.',
    scope: [
      'Storage energy-capacity assessment (MWh)',
      'Storage power-capacity assessment (MW)',
      'Duration and cycling analysis',
      'Preliminary AC-coupled versus DC-coupled architecture assessment',
      'PV-plus-storage scenario modelling',
      'Charging and discharging profile analysis',
      'Preliminary energy-shifting and curtailment scenarios',
      'Technical-commercial comparisons between storage options',
    ],
    boundary:
      'Preliminary assessment only. Detailed electrical engineering, protection studies, grid-code and ancillary-service compliance, fire and safety engineering, thermal management design, warranty negotiation and manufacturer validation of degradation and performance are outside this scope and require the selected supplier and a design authority.',
  },
  {
    id: 'modelling',
    index: '03',
    title: 'Technical-commercial modelling',
    lede:
      'A model is only useful if its assumptions are visible. We build the link between the engineering case and the investment case, and we show our inputs.',
    scope: [
      'Preliminary CAPEX and OPEX assumptions',
      'Energy-yield scenarios tied to the technical configuration',
      'Revenue and tariff sensitivity analysis',
      'Battery dispatch, degradation and replacement assumptions',
      'Project-life financial scenarios',
      'Key risk identification and sensitivity analysis',
      'Preliminary investment decision support',
    ],
    boundary:
      'All financial outputs are estimates and scenarios, not guarantees, forecasts of actual results, investment advice or a recommendation to invest. They do not replace an independent model audit, lender technical due diligence, tax or legal advice.',
  },
  {
    id: 'development-support',
    index: '04',
    title: 'Project development support',
    lede:
      'Development is coordination work. We help project owners sequence the studies, interpret the outputs and keep the technical story consistent in front of investors.',
    scope: [
      'Site and resource assessment coordination',
      'Technical feasibility coordination',
      'Grid-interconnection study coordination',
      'Project configuration review and challenge',
      'Stakeholder and technical-partner coordination',
      'Development-stage risk identification',
      'Investor-facing technical summaries',
    ],
    boundary:
      'Advisory and coordination support. Yala Energy does not act as the utility, the regulator, the permitting authority or the licensed design authority, and cannot guarantee the outcome of any third-party study, application or approval.',
  },
];

export const DELIVERABLES = [
  {
    title: 'Design assumptions and inputs register',
    body: 'Every input, source and assumption behind the analysis, in one reviewable document. Issued with every engagement.',
  },
  {
    title: 'Preliminary plant configuration',
    body: 'DC and AC capacity, module and inverter configuration, and the reasoning behind each choice.',
  },
  {
    title: 'PV layout and simulation summary',
    body: 'Indicative layout, land-use assessment and simulation summary, issued in our own report format and subject to the applicable software licence terms.',
  },
  {
    title: 'DC/AC scenario comparison',
    body: 'Side-by-side comparison of DC/AC ratio options against yield, clipping and indicative cost.',
  },
  {
    title: 'BESS configuration assessment',
    body: 'Energy and power sizing, duration, preliminary coupling architecture and the scenarios behind the recommendation.',
  },
  {
    title: 'Preliminary energy-yield report',
    body: 'Expected annual yield with stated losses, uncertainty treatment and the limits of a preliminary assessment.',
  },
  {
    title: 'Technical-commercial comparison',
    body: 'The engineering options expressed in commercial terms, with sensitivities on the assumptions that matter.',
  },
  {
    title: 'Risk and assumptions register',
    body: 'Development-stage risks, their technical drivers and what study would close each one.',
  },
  {
    title: 'Next-stage engineering recommendations',
    body: 'A clear statement of which studies come next, in what order, and what each needs as an input.',
  },
] as const;

export const TOOLING = {
  title: 'Software and tooling',
  statement:
    'Yala Energy uses RatedPower by Enverus for applicable utility-scale PV design and simulation workflows, subject to project scope and software licensing permissions.',
  role:
    'Where the engagement scope and licence terms permit, the tool supports plant configuration, indicative layout generation and energy-yield simulation. Results are interpreted, documented and issued by Yala Energy in its own report format, alongside the assumptions register.',
  disclaimers: [
    'RatedPower is a product of Enverus. Yala Energy does not own, develop or resell it.',
    'Nothing on this page implies endorsement of Yala Energy by Enverus, or any partnership, reseller or certification relationship.',
    'Not every model output can be commercially redistributed. The deliverables available in a given engagement depend on the applicable licence terms and are confirmed in writing in the scope of work.',
    'No proprietary software screenshots or raw software outputs are published on this website.',
    'Final design and construction require engineering verification, a licensed design authority and the relevant regulatory approvals. A preliminary simulation is not a construction document.',
  ],
  internalNote:
    'Written confirmation of permitted commercial consulting use under the applicable licence must be on file before deliverables derived from the software are offered publicly.',
} as const;
