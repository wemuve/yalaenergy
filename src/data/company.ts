import type { Capability, Person } from './types';

export const COMPANY = {
  headline: 'Zambian owned. Built for long-term energy infrastructure.',
  lede:
    'Yala Energy Limited was formed to develop renewable-energy projects that support long-term energy security, diversification and sustainable development — and to bring real engineering rigour to the decisions those projects depend on.',
  description: [
    'Yala Energy Limited is a private company limited by shares, incorporated in Zambia. It was established to develop, own and operate renewable-energy generation assets, and to support other developers and project owners with the technical work that determines whether a project is worth building.',
    'The company is wholly Zambian owned and is seeking appropriate equity and technical partners to take its projects through feasibility, permitting and financial close. Its first project is the proposed Muchenje Solar PV Plant in Chibombo District.',
    'Yala Energy takes a deliberately unglamorous view of project development: resource data before capacity claims, grid studies before connection promises, and a financial model that survives contact with a lender. That discipline is also the basis of the PV and BESS engineering services the company offers to clients.',
  ],
  record: [
    {
      label: 'Registered name',
      value: 'Yala Energy Limited',
      status: 'supplied' as const,
      note: 'To be checked against the PACRA certificate of incorporation.',
    },
    {
      label: 'Incorporation',
      value: '9 June 2026, Zambia',
      status: 'supplied' as const,
      note: 'Date as supplied by the company. Certificate of incorporation to be provided for verification.',
    },
    {
      label: 'Legal form',
      value: 'Private company limited by shares',
      status: 'supplied' as const,
      note: 'To be confirmed against the company registration documents.',
    },
    {
      label: 'Ownership',
      value: 'Wholly Zambian owned',
      status: 'supplied' as const,
      note: 'As stated by the company. Shareholding to be confirmed from the share register.',
    },
    {
      label: 'Sector',
      value: 'Independent power production and renewable-energy project development',
      status: 'confirmed' as const,
      note: 'Reflects the activities described on this website.',
    },
  ],
  vision:
    'To be a leading Zambian independent power producer delivering energy that powers communities, industry and national development.',
  mission:
    'To generate reliable, affordable and clean electricity that strengthens energy security, supports growth and builds climate resilience.',
  approach: [
    {
      title: 'Develop properly, not quickly',
      body: 'A solar project is a thirty-year obligation. We would rather spend an extra season on resource data, grid studies and land documentation than carry an unexamined assumption into a financing discussion.',
    },
    {
      title: 'Engineering before marketing',
      body: 'Capacity figures, yield estimates and CAPEX numbers are modelling outputs, not slogans. Every figure we publish carries its status, and we say plainly what has not yet been studied.',
    },
    {
      title: 'Partnership on clear terms',
      body: 'We are open about what the company has and has not secured. Partners and investors get the same picture we work from, which is the only basis on which due diligence is worth anyone’s time.',
    },
    {
      title: 'Local benefit as a design input',
      body: 'Local hiring, skills transfer and community engagement are planned alongside the electrical design, not retrofitted once construction starts.',
    },
  ],
  governance: {
    lede:
      'Yala Energy intends to operate to the governance standards its lenders, partners and regulators will expect of an independent power producer. The arrangements below are the company’s stated intentions for how it will be governed as it grows — they are not all in place today.',
    intentions: [
      {
        title: 'Board oversight',
        body: 'An appropriately constituted board with independent representation as the company and its projects grow.',
        status: 'outstanding' as const,
      },
      {
        title: 'Audited accounts',
        body: 'Annual financial statements prepared and independently audited in line with Zambian requirements.',
        status: 'outstanding' as const,
      },
      {
        title: 'Transparent reporting',
        body: 'Regular, consistent reporting to shareholders, lenders and project partners.',
        status: 'outstanding' as const,
      },
      {
        title: 'Environmental and social safeguards',
        body: 'Project development aligned to Zambian environmental requirements and to the environmental and social standards expected by international lenders.',
        status: 'outstanding' as const,
      },
    ],
  },
  community: {
    lede:
      'The Muchenje site sits in a living landscape with its own authorities, livelihoods and expectations. The company’s stated intentions for how it will engage are set out below; formal programmes follow the environmental and social impact assessment.',
    commitments: [
      {
        title: 'Local hiring',
        body: 'Prioritising Chibombo District and Zambian labour across construction and operations, with the roles and numbers defined by the construction programme.',
      },
      {
        title: 'Skills transfer',
        body: 'Pairing Zambian engineers and technicians with international specialists through design, construction and commissioning so capability stays in the country.',
      },
      {
        title: 'Constructive engagement',
        body: 'Early and continuing engagement with traditional leadership, local authorities and affected households, documented through the ESIA process.',
      },
    ],
    status: 'outstanding' as const,
  },
} as const;

export const CAPABILITIES: readonly Capability[] = [
  {
    index: '01',
    title: 'Solar PV Generation',
    summary:
      'Utility-scale solar generation and project design, from site screening and layout through to the configuration decisions that set a plant’s lifetime yield.',
    points: [
      'Site screening and resource assessment',
      'Plant layout and DC/AC configuration',
      'Energy-yield and loss modelling',
    ],
  },
  {
    index: '02',
    title: 'Battery Energy Storage',
    summary:
      'Storage assessment and integration, sized to the operating profile a project actually needs rather than to a headline number.',
    points: [
      'Energy (MWh) and power (MW) sizing',
      'AC- versus DC-coupled architecture assessment',
      'Charge, discharge and energy-shifting scenarios',
    ],
  },
  {
    index: '03',
    title: 'Grid Interconnection',
    summary:
      'Technical coordination of the electrical infrastructure and grid connection that decide whether generation can actually reach the network.',
    points: [
      'Connection point and voltage-level assessment',
      'Evacuation line routing and infrastructure scoping',
      'Coordination of system-impact and connection studies',
    ],
  },
  {
    index: '04',
    title: 'PV & BESS Engineering and Consulting',
    summary:
      'The same engineering capability, offered to developers, project owners, EPC contractors and investors as scoped consulting work.',
    points: [
      'PV design and energy-yield simulation',
      'BESS configuration assessment',
      'Technical-commercial modelling and decision support',
    ],
    href: '/pv-bess-engineering/',
    linkLabel: 'Explore PV & BESS Engineering',
  },
];

/**
 * Leadership. Every biography here is reproduced from information supplied by
 * the company and is flagged `supplied` until the individuals confirm their
 * titles, credentials and current positions in writing. No third-party
 * organisation named in a biography endorses Yala Energy.
 */
export const LEADERSHIP: readonly Person[] = [
  {
    name: 'Eng. Kenneth S. Muteto',
    role: 'Co-founder and Project Director',
    initials: 'KM',
    summary:
      'Electrical engineer with over thirty years of power-sector experience, spanning distribution and supply operations, transmission project delivery and sector institutions.',
    credentials: [
      'MSc in Electrical Engineering, Donetsk Polytechnic Institute',
      'Postgraduate qualification in Electrical Power Distribution Systems, Norwegian Technical University (NTH)',
      'IMD Advanced Strategic Management Programme, Lausanne',
    ],
    experience: [
      'Executive Director for Distribution and Supply, ZESCO Limited',
      'Oversight of major projects including the Lusaka Transmission Project',
      'Board service associated with rural electrification and power-sector training institutions',
    ],
    status: 'supplied',
  },
  {
    name: 'Shipango Muteto',
    role: 'Co-founder and Promoter',
    initials: 'SM',
    summary:
      'Chartered insurer and executive with over forty years of leadership experience across insurance, reinsurance, risk management and corporate governance in Africa.',
    credentials: [
      'Chartered insurer',
      'Postgraduate qualifications in marketing and corporate management',
    ],
    experience: [
      'Senior positions at Zambia State Insurance Corporation',
      'Senior positions at Professional Insurance Corporation Zambia',
      'Senior positions at ZEP RE',
      'Chairman of the Board of Trustees, NAPSA',
      'President, Microinsurance Technical Advisory Group',
    ],
    status: 'supplied',
  },
];
