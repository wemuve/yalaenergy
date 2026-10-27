# Pre-launch verification checklist

Every claim on this website that needs confirmation from Yala Energy Limited
before the site goes public, with where it appears and what document or decision
would close it.

The site is deliberately built so that nothing here blocks launch *technically*
— each item is already published with an honest status label. Closing an item
means upgrading its label, not discovering a problem.

**How to close an item:** obtain the evidence, then update the matching entry in
`src/data/` (the file and field are named for each item) and change its `status`.
The badge, the table and the verification note all follow from that one edit.

Status key: ☐ open · ☑ closed

---

## A. Brand and identity

| ID | Item | Where | Needed |
| --- | --- | --- | --- |
| ☐ BRAND-1 | **Official logo file.** The site currently renders a vector *reconstruction* of the three-blade mark. | Header, footer, drawer, 404, social image, icons | Official SVG (preferred) or PNG at `public/brand/yala-energy-logo.svg`. Then run `npm run assets:og`. |
| ☐ BRAND-2 | **Exact brand colour values.** The greens and yellow are sampled from the supplied logo image, not from a brand specification. | `src/styles/tokens.css`, `Logo.astro` | Brand guideline hex values. |
| ☐ BRAND-3 | **Typography.** Archivo + Inter were chosen to match the logo's character. They are not confirmed as the brand typefaces. | Site-wide | Confirm, or supply licensed brand fonts (see `public/fonts/README.md`). |
| ☐ BRAND-4 | **Slogan and supporting headline wording.** "Powering a Greener Future." and "Renewable Energy. Engineered to Perform." | Hero, footer, social image | Written confirmation these are final and correctly punctuated. |

## B. Company record — `src/data/company.ts`

| ID | Item | Current status | Needed |
| --- | --- | --- | --- |
| ☐ CO-1 | Registered name "Yala Energy Limited" | `supplied` | PACRA certificate of incorporation |
| ☐ CO-2 | **Incorporation date: 9 June 2026** | `supplied` | Certificate of incorporation. **Note:** this date is recent. Confirm it is correct and not a typo for an earlier year — it materially affects how the company's track record reads. |
| ☐ CO-3 | Legal form: private company limited by shares | `supplied` | Registration documents |
| ☐ CO-4 | Ownership: wholly Zambian owned | `supplied` | Share register / shareholding statement |
| ☐ CO-5 | Registered address | unverified | Confirm against the certificate; the published Manda Hill address is carried over from existing materials |
| ☐ CO-6 | TPIN / company registration number | not published | Decide whether to publish; supply if so |

## C. Leadership — `src/data/company.ts` → `LEADERSHIP`

Both biographies are published with a `Company-stated` badge and an explicit note
that they are pending written confirmation and that named organisations do not
endorse Yala Energy.

| ID | Item | Needed |
| --- | --- | --- |
| ☐ LEAD-1 | **Eng. Kenneth S. Muteto** — title "Co-founder and Project Director"; MSc Donetsk Polytechnic Institute; postgraduate qualification NTH; IMD Advanced Strategic Management Programme | Written confirmation from the individual |
| ☐ LEAD-2 | Kenneth S. Muteto — "Executive Director for Distribution and Supply, ZESCO Limited"; oversight of the Lusaka Transmission Project; board service re rural electrification and power-sector training | Confirm each role, its dates, and whether it is current or former. Any role stated in the present tense that is in fact former must be corrected. |
| ☐ LEAD-3 | **Shipango Muteto** — title "Co-founder and Promoter"; chartered insurer; postgraduate qualifications in marketing and corporate management | Written confirmation from the individual |
| ☐ LEAD-4 | Shipango Muteto — senior positions at Zambia State Insurance Corporation, Professional Insurance Corporation Zambia, ZEP RE; Chairman of the Board of Trustees at NAPSA; President of the Microinsurance Technical Advisory Group | Confirm each, with dates and current/former status. Chairmanships and presidencies especially — these read as current unless dated. |
| ☐ LEAD-5 | **Relationship disclosure.** The two founders share a surname. | Confirm whether a family relationship exists and whether it should be disclosed. Investors will ask; it is better volunteered. |
| ☐ LEAD-6 | **Portraits.** Currently initials, not photographs. | Authorised photographs plus written consent to publish, or confirm initials stand. Do not substitute stock images of other people. |
| ☐ LEAD-7 | **Wider team.** Only two people are named. | Confirm whether others should appear, or whether the company is accurately described as two founders at this stage. |

## D. Muchenje project — `src/data/project.ts`

| ID | Claim | Current status | Needed |
| --- | --- | --- | --- |
| ☐ PRJ-1 | 20 MWp proposed solar PV capacity | `assumption` | Technical basis; confirm whether 20 MWp is DC peak and what the intended AC export capacity is |
| ☐ PRJ-2 | 40–60 MWh proposed battery storage | `assumption` | Confirm the range, and state the intended **power** rating (MW) and duration — energy alone does not specify a BESS |
| ☐ PRJ-3 | ≈ 8.2 km, 33 kV evacuation line | `assumption` | Route basis, survey status, wayleave position |
| ☐ PRJ-4 | Connection to a new ZESCO 33/11 kV substation | `outstanding` | Any correspondence with ZESCO; confirm whether the substation exists, is planned by ZESCO, or is assumed by the project. **This is the single highest-risk assumption on the site.** |
| ☐ PRJ-5 | 25-year design life | `assumption` | Confirm as the design basis |
| ☐ PRJ-6 | ≈ USD 31 million estimated CAPEX | `estimate` | Basis of the estimate: date, scope, source of pricing, what it includes and excludes |
| ☐ PRJ-7 | 41 hectares of project land | `supplied` | Title or survey document stating the area |
| ☐ PRJ-8 | **99-year leasehold interest** | `supplied` | **Lease or title document.** Published as claimed-and-unreviewed. A land claim is the first thing any investor verifies. |
| ☐ PRJ-9 | Farm No. L/Chibo/1469453 as the project address | unverified | Confirm the number and that it matches the land interest |
| ☐ PRJ-10 | Location: Chieftainess Mungule area, Chibombo District, Central Province | `confirmed` on site | Confirm spelling and the correct form of address for the traditional authority |
| ☐ PRJ-11 | Single-asset project company structure | `assumption` | Confirm intended; it is published as not yet incorporated |
| ☐ PRJ-12 | "Early development" stage | `confirmed` | Confirm this is how the company wants the project described |
| ☐ PRJ-13 | Traditional and local authority engagement "under way" | in timeline stage 01 | Confirm what engagement has actually taken place |

## E. Solar resource — `src/data/project.ts` → `solarResource`

| ID | Item | Needed |
| --- | --- | --- |
| ☐ RES-1 | 5.5–6.0 kWh/m²/day | Confirm the metric (published as GHI long-term daily average), the **data period**, and the exact extraction coordinates |
| ☐ RES-2 | Attribution to World Bank Group / ESMAP / Solargis | Confirm the exact dataset and version, and that the attribution wording meets its licence terms |
| ☐ RES-3 | Resource map | No map is published. If one is wanted, its metric, period, source, licence and uncertainty must be published with it |

## F. Engineering services — `src/data/services.ts`

| ID | Item | Needed |
| --- | --- | --- |
| ☐ SVC-1 | **RatedPower by Enverus licence.** The site states the tool is used "subject to project scope and software licensing permissions". | **Written confirmation that the licence permits commercial consulting use and distribution of derived deliverables**, before the services page is promoted. This is a contractual exposure, not a wording question. |
| ☐ SVC-2 | Deliverables list (9 items) | Confirm the company can competently produce and legally distribute each one |
| ☐ SVC-3 | "Respond to qualified enquiries within five working days" | Confirm this commitment is deliverable — it is published on three pages |
| ☐ SVC-4 | Scope boundaries (what each service excludes) | Confirm each boundary is correct, especially the BESS and modelling exclusions |
| ☐ SVC-5 | Professional indemnity insurance | Confirm cover is in place before consulting engagements are accepted |
| ☐ SVC-6 | Engineering registration | Confirm whether EIZ / ERB registration or a licensed design authority is required for any service offered, and whether the company or a named engineer holds it |

## G. Contact details — `src/data/site.ts`

| ID | Item | Current state | Needed |
| --- | --- | --- | --- |
| ☐ CON-1 | `info@yalaenergy.co.zm` | published | Confirm the mailbox is monitored |
| ☐ CON-2 | Lusaka office: Suite No. 2, Private Bag E891, Manda Hill Shopping Centre | published with "pending verification" note | Confirm. Note a private bag is a postal address, not a street address — confirm whether a visitable office address exists |
| ☐ CON-3 | Project site: Farm No. L/Chibo/1469453, College Road, off Mungule Road, Chibombo | published with "pending verification" note | Confirm |
| ☐ CON-4 | **Telephone** | **not published** | Supply a verified number, or confirm none should be published. The site deliberately publishes no number rather than an unverified one. |
| ☐ CON-5 | Map / coordinates | not published | Decide whether to publish; no pin is invented |
| ☐ CON-6 | Social media profiles | not published | Supply verified profile URLs if any exist |

## H. Legal and privacy — `src/pages/privacy.astro`

| ID | Item | Needed |
| --- | --- | --- |
| ☐ PRIV-1 | Named data-protection contact and correspondence address | Supply; currently flagged as to be confirmed |
| ☐ PRIV-2 | Form-handling and email providers | Name them and confirm cross-border transfer safeguards |
| ☐ PRIV-3 | Retention periods (24 months for unsuccessful enquiries) | Confirm against company policy and Zambian requirements |
| ☐ PRIV-4 | Zambia Data Protection Act compliance | Legal review of the policy, including registration obligations |
| ☐ PRIV-5 | Policy accuracy | The policy states there are no cookies, analytics or third-party embeds. **If any are added later, update the policy in the same change.** |
| ☐ PRIV-6 | Securities-law wording | Legal review of the "not an offer" language on the project, projects and information-accuracy pages |

## I. Media — `src/data/media.ts`

| ID | Item | Needed |
| --- | --- | --- |
| ☐ MEDIA-1 | Photograph files | Add to `src/assets/media/` per `README.md`. Until then, illustrated fallbacks render. |
| ☐ MEDIA-2 | **Publication rights for each photograph** | Confirm Yala Energy may publish each image on its website, and whether any credit line is required |
| ☐ MEDIA-3 | Caption accuracy | All four are published as illustrative and explicitly "not the Muchenje site". Confirm none of them is in fact a Yala Energy asset — if one is, set `siteSpecific: true` and write its real caption |
| ☐ MEDIA-4 | Site photography | Commission photographs of the actual Muchenje site if the project is to be shown as it really is |

## J. Technical and operational

| ID | Item | Needed |
| --- | --- | --- |
| ☐ OPS-1 | Form endpoint | Deploy `server/enquiry-handler.mjs` and set `PUBLIC_ENQUIRY_ENDPOINT`. **Until then the forms are in demo mode and say so.** |
| ☐ OPS-2 | Mail provider and `ENQUIRY_MAIL_API_KEY` | Configure in the host's environment, never in the repository |
| ☐ OPS-3 | SPF / DKIM / DMARC for the sending domain | Configure, or enquiry notifications will land in spam |
| ☐ OPS-4 | `SITE_URL` in the build environment | Set to the production origin |
| ☐ OPS-5 | Security response headers | Apply the set in the README at the host |
| ☐ OPS-6 | Rate-limiter backing store | Required if deploying to a multi-instance serverless platform |
| ☐ OPS-7 | Redirects from the existing site | Map old `/index.php/...` URLs to the new routes so existing links and search rankings survive |
| ☐ OPS-8 | Analytics | None is installed. If one is added, choose a cookieless option and update the privacy policy in the same change |

---

## Standing rules

These are enforced by `tests/e2e/run.mjs` — a change that breaks one fails the
test suite.

1. **No prohibited claims.** "Shovel-ready", "bankable project", "signed PPA",
   "guaranteed returns", "fully permitted", "ready to build" and similar may
   only appear inside an explicit denial.
2. **No fabricated endorsements.** ZESCO, Enverus, government bodies and the
   organisations in the leadership biographies endorse nothing.
3. **No invented contact details.** No telephone number, office, map pin or
   social profile that has not been verified.
4. **Imagery is disclosed.** Any image that is not of a Yala Energy asset is
   captioned as illustrative and identified as not the Muchenje site.
5. **Forms never lie.** If there is no endpoint, the form says nothing was sent.
6. **MW is not MWh.** Generation capacity in MWp, storage energy in MWh, storage
   power in MW — never conflated.
7. **No secrets in the bundle.** Scanned on every test run.
