import type { Metric, TimelineStage } from './types';

export const MUCHENJE = {
  slug: 'muchenje-solar-pv-plant',
  name: 'Muchenje Solar PV Plant',
  shortName: 'Muchenje',
  stage: 'Early development',
  stageNote:
    'Concept and early development. The project is not permitted, contracted, financed or under construction.',
  location: {
    area: 'Chieftainess Mungule area',
    district: 'Chibombo District',
    province: 'Central Province',
    country: 'Zambia',
    short: 'Chibombo District, Zambia',
  },
  summary:
    'A proposed 20 MWp solar PV generation project with battery energy storage in Chibombo District, Central Province, Zambia. The current concept includes an approximately 8.2 km, 33 kV overhead evacuation line to intended ZESCO interconnection infrastructure.',
  technical: [
    {
      parameter: 'Solar PV capacity',
      value: '20 MWp',
      status: 'assumption' as const,
      note: 'Proposed DC capacity of the current project concept. The AC export capacity follows from the final inverter and interconnection design.',
    },
    {
      parameter: 'Battery energy storage',
      value: '40–60 MWh',
      status: 'assumption' as const,
      note: 'Proposed energy capacity range. Final energy (MWh) and power (MW) ratings depend on the intended operating profile and a completed storage study.',
    },
    {
      parameter: 'Evacuation line',
      value: '≈ 8.2 km, 33 kV overhead',
      status: 'assumption' as const,
      note: 'Indicative route length from the site to the intended interconnection point. Wayleaves, route survey and line design are outstanding.',
    },
    {
      parameter: 'Intended connection',
      value: 'ZESCO 33/11 kV substation',
      status: 'outstanding' as const,
      note: 'A connection to a new ZESCO 33/11 kV substation is the intended arrangement. It is subject to confirmation, grid studies and a connection agreement with ZESCO. No agreement is in place.',
    },
    {
      parameter: 'Design life',
      value: '25 years',
      status: 'assumption' as const,
      note: 'Target design life used for the current concept and for indicative modelling.',
    },
    {
      parameter: 'Estimated CAPEX',
      value: 'approx. USD 31 million',
      status: 'estimate' as const,
      note: 'Sponsor estimate. Requires validation through current technical design, equipment quotations, interconnection studies, EPC pricing and financial modelling.',
    },
    {
      parameter: 'Project land',
      value: '41 hectares',
      status: 'supplied' as const,
      note: 'Area associated with the project, as stated by the company. Title and area to be verified against the land documentation.',
    },
    {
      parameter: 'Land tenure',
      value: '99-year leasehold (claimed)',
      status: 'supplied' as const,
      note: 'A 99-year leasehold interest is claimed by the company. The lease documentation has not been independently reviewed and is on the verification checklist.',
    },
    {
      parameter: 'Development structure',
      value: 'Single-asset project company',
      status: 'assumption' as const,
      note: 'Intended structure for the project concept. Not yet incorporated or capitalised as a separate project company.',
    },
    {
      parameter: 'Development stage',
      value: 'Early development',
      status: 'confirmed' as const,
      note: 'No power purchase agreement, generation licence, environmental approval, grid-connection agreement or financial close has been achieved.',
    },
  ],
  solarResource: {
    range: '5.5–6.0 kWh/m²/day',
    metric: 'Global horizontal irradiation (GHI), long-term daily average',
    source:
      'Preliminary reference derived from public solar-resource mapping published by the World Bank Group / ESMAP with data by Solargis.',
    limitation:
      'This is a regional screening reference only. It is not a site-specific yield assessment, carries its own uncertainty band, and the exact data period and extraction point must be stated before any figure is relied upon commercially. A bankable yield assessment requires on-site or satellite-calibrated resource data, site-specific loss modelling and an independent P50/P90 analysis.',
    status: 'estimate' as const,
  },
  commercial: {
    objective:
      'Secure an appropriate offtake arrangement and the equity and technical partners needed to take the project through feasibility, permitting and financial close.',
    capexNote:
      'The approximately USD 31 million figure is a sponsor estimate at concept stage. It has not been validated against a current technical design, live equipment quotations, interconnection study outputs, EPC pricing or a reviewed financial model, and should be treated as indicative only.',
    tariffNote:
      'No tariff has been agreed and no power purchase agreement has been signed. Storage changes a project’s dispatch profile and may change its commercial value, but it does not by itself guarantee a higher tariff or a better return. Tariff outcomes depend on the offtaker, the regulatory framework and the negotiated terms.',
  },
} as const;

export const PROJECT_METRICS: readonly Metric[] = [
  {
    value: '20',
    numeric: 20,
    unit: 'MWp',
    label: 'Proposed solar PV capacity',
    note: 'Peak DC capacity of the current concept. Design assumption.',
    status: 'assumption',
  },
  {
    value: '40–60',
    numeric: 60,
    unit: 'MWh',
    label: 'Proposed battery energy storage',
    note: 'Energy capacity range, not power capacity. Design assumption.',
    status: 'assumption',
  },
  {
    value: '8.2',
    numeric: 8.2,
    unit: 'km',
    label: 'Proposed 33 kV evacuation line',
    note: 'Indicative route length. Wayleaves and line design outstanding.',
    status: 'assumption',
  },
  {
    value: '25',
    numeric: 25,
    unit: 'years',
    label: 'Target design life',
    note: 'Used for the current concept and indicative modelling.',
    status: 'assumption',
  },
];

export const PROJECT_TIMELINE: readonly TimelineStage[] = [
  {
    index: '01',
    title: 'Land and company',
    summary:
      'Company formation and securing a site with the characteristics a utility-scale solar project needs: irradiation, terrain, access and a credible route to the grid.',
    items: [
      'Yala Energy Limited incorporated in Zambia',
      'Site identified in the Chieftainess Mungule area, Chibombo District',
      'Land interest claimed by the company — documentation under review',
      'Traditional and local authority engagement under way',
    ],
    status: 'in-progress',
    statusLine:
      'Company-stated progress. Land title, area and tenure are subject to document verification.',
  },
  {
    index: '02',
    title: 'Feasibility and technical design',
    summary:
      'Turning a site into a defensible engineering case: resource, yield, layout, storage sizing and how the plant connects to the network.',
    items: [
      'Site-specific solar resource and energy-yield assessment',
      'Plant layout, DC/AC configuration and loss modelling',
      'Battery energy storage sizing (MW and MWh) and architecture',
      'Grid-connection and system-impact studies with the network operator',
      'Geotechnical, topographical and environmental baseline surveys',
    ],
    status: 'outstanding',
    statusLine: 'Not yet complete. This is the current focus of the development programme.',
  },
  {
    index: '03',
    title: 'Equity partner and permits',
    summary:
      'Bringing in capital and technical capability, and working through the licensing, environmental and land processes that apply to a Zambian IPP.',
    items: [
      'Equity and technical partner selection, subject to mutual due diligence',
      'Generation licensing and regulatory applications',
      'Environmental and social impact assessment and approvals',
      'Land conversion, survey and wayleave processes as applicable',
    ],
    status: 'outstanding',
    statusLine: 'No licences, permits or environmental approvals have been granted.',
  },
  {
    index: '04',
    title: 'Offtake and financial close',
    summary:
      'The commercial spine of the project: who buys the power, at what price, and on what terms the project can be financed.',
    items: [
      'Power purchase agreement negotiation',
      'Tariff and regulatory approval process',
      'Debt and equity structuring, lender technical due diligence',
      'EPC and O&M procurement and contracting',
    ],
    status: 'outstanding',
    statusLine: 'No PPA, tariff approval, financing commitment or EPC contract is in place.',
  },
  {
    index: '05',
    title: 'Construction and commissioning',
    summary:
      'Building the plant, the storage system and the evacuation line, then proving performance before handover to operations.',
    items: [
      'Construction of the solar plant, BESS and 33 kV evacuation line',
      'Grid-code compliance testing and witness testing',
      'Commissioning, performance testing and reliability run',
      'Operational handover and long-term O&M mobilisation',
    ],
    status: 'outstanding',
    statusLine: 'Not commenced. Construction follows permitting, offtake and financial close.',
  },
];
