import { useRef } from 'react'
import { ArtifactAudienceGuide } from '../../components/ArtifactAudienceGuide'
import { portfolio } from '../../content/portfolio'
import { useDataWordHighlight } from '../../hooks/useDataWordHighlight'
import { HospitalTamWalkthrough } from './HospitalTamWalkthrough'
import { TamChecklist } from './TamChecklist'

const failureModes = [
  ['Double-counted TAM', 'Multiple hospitals appear as separate prospects even when one system controls contracting.'],
  ['Duplicate outreach', 'Different facilities—or even different systems—resolve to the same parent company.'],
  ['Bad scoring', 'Facility size, system scale, and company complexity become one misleading number.'],
  ['Wrong buyer', 'A local administrator is enriched when the buying decision lives centrally.'],
  ['Broken reporting', 'Pipeline looks larger because duplicate entities were never resolved.'],
] as const

const pipeline = [
  'Public data',
  'Facility',
  'System resolution',
  'Company resolution',
  'Account scoring',
  'Buyer-function evidence',
  'Qualified GTM audience',
] as const

const filterGroups = [
  {
    title: 'Hospital type',
    examples: 'Acute care · Critical access · Psychiatric · Rural emergency · Children’s · Long-term · Federal',
    note: 'The label describes the facility. It is not a universal verdict on account fit.',
  },
  {
    title: 'Ownership',
    examples: 'Voluntary nonprofit · Proprietary · District / authority · Local / state government · Federal',
    note: 'Ownership matters only when the commercial thesis gives it a reason to matter.',
  },
  {
    title: 'Likely review or disqualification',
    examples: 'Federal / VA / military · Low complexity · Minimal commercial-payer exposure · Closed / acquired / duplicate',
    note: 'Missing public evidence belongs in a review state—not an automatic exclusion.',
  },
] as const

const scoringDimensions = [
  ['System size', '1–2 hospitals · 3–9 hospitals · 10+ hospitals'],
  ['Geographic complexity', '1 state · 2 states · 3+ states'],
  ['Facility complexity', 'Acute-care hospital count'],
  ['Buying-function evidence', 'Managed Care · Payer Contracting · Revenue Cycle · Reimbursement · Pricing Strategy'],
] as const

const buildSteps = [
  'Define the actual buying unit.',
  'Identify the source system’s unit of record.',
  'Find a stable crosswalk key.',
  'Preserve identifiers as strings where needed.',
  'Resolve source entities to the buying unit.',
  'Deduplicate at every entity layer.',
  'Keep raw source IDs for lineage.',
  'Score only after entity resolution.',
  'Enrich buyers only after accounts are stable.',
  'Manually inspect weird edge cases.',
] as const

export function HospitalTamPage() {
  const mainRef = useRef<HTMLElement>(null)
  useDataWordHighlight(mainRef)
  const baseUrl = import.meta.env.BASE_URL

  return (
    <>
      <a className="skip-link" href="#main">Skip to hospital TAM artifact</a>
      <header className="site-header hospital-tam-header">
        <a className="site-header__mark" href={baseUrl} aria-label="RS — return to Ryan Sulapas portfolio">RS<span aria-hidden="true">/</span></a>
        <nav aria-label="Hospital TAM sections"><ul className="site-header__nav"><li><a href="#walkthrough">Walkthrough</a></li><li><a href="#pipeline">Entity chain</a></li><li><a href="#filters">Filters</a></li><li><a href="#checklist">Checklist</a></li></ul></nav>
      </header>

      <main ref={mainRef} id="main" className="hospital-tam-page" tabIndex={-1}>
        <section className="hospital-tam-hero" aria-labelledby="hospital-tam-title">
          <div>
            <p className="eyebrow">Provider-market study · Demo / synthetic walkthrough</p>
            <h1 id="hospital-tam-title"><span>5,000 Hospitals</span> Don’t Mean <span>5,000 Prospects</span></h1>
            <p>How to turn messy public healthcare data into a GTM-ready account universe.</p>
            <ul className="artifact-tags" aria-label="Project tags">{['GTM Engineering', 'Data Engineering', 'Healthcare', 'Entity Resolution', 'TAM Design'].map((tag) => <li key={tag}>{tag}</li>)}</ul>
          </div>
          <aside className="hospital-tam-hero__thesis"><span>Source row</span><strong>≠</strong><span>Buying unit</span><small>Facility records are inputs. Accounts are decisions.</small></aside>
        </section>

        <p className="tam-disclosure"><strong>Independent portfolio exercise.</strong> Public-data concepts, synthetic examples, and no patient or private company information. Not work performed for, sponsored by, or endorsed by Turquoise Health, CMS, AHRQ, Clay, LinkedIn, or any depicted organization.</p>

        <ArtifactAudienceGuide
          plainEnglish="A hospital list is like a pile of mailing labels: several labels can belong to one family, and several families can share one parent company. Follow the red data ball as ten records are sorted into the three organizations a seller could actually approach."
          hiringManager="This artifact demonstrates source-grain analysis, normalized string identifiers, facility-to-system crosswalks, parent-company resolution, multi-layer deduplication, explicit unresolved states, lineage, and scoring only after the account model is stable."
        />

        <HospitalTamWalkthrough />

        <section id="pipeline" className="section tam-pipeline-section" aria-labelledby="pipeline-title">
          <p className="eyebrow">02 / La chaîne d'identité</p>
          <h2 id="pipeline-title">The hospital is the facility. The TAM is the buying organization.</h2>
          <ol className="tam-pipeline">{pipeline.map((stage, index) => <li key={stage}><span>0{index + 1}</span><strong>{stage}</strong></li>)}</ol>
          <div className="tam-join-contract">
            <div><span>CMS</span><strong>facility_id</strong><small>Store as text</small></div><b aria-hidden="true">=</b><div><span>AHRQ linkage</span><strong>ccn</strong><small>Preserve leading zeroes</small></div><i aria-hidden="true">→</i><div><span>System key</span><strong>health_sys_id</strong><small>Dedupe here, then again by company</small></div>
          </div>
          <p className="tam-pipeline-note">Entity resolution is not just cleanup. It changes the size and meaning of the TAM—and imperfect matches, acquisitions, stale records, and missing domains still need review.</p>
        </section>

        <section className="section tam-failures" aria-labelledby="failures-title">
          <p className="eyebrow">03 / Ce qui casse</p>
          <h2 id="failures-title">What breaks if you skip this?</h2>
          <div>{failureModes.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </section>

        <section id="filters" className="section tam-filters" aria-labelledby="filters-title">
          <p className="eyebrow">04 / Qualifier l'univers</p>
          <h2 id="filters-title">Filters should reflect the GTM thesis.</h2>
          <p>For this hypothetical healthcare pricing and payer-contracting motion, commercial-payer complexity mattered more than “is this technically a hospital?” These are decision prompts, not universal hard filters.</p>
          <div>{filterGroups.map((group) => <details key={group.title}><summary><span>{group.title}</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><div><strong>{group.examples}</strong><p>{group.note}</p></div></details>)}</div>
        </section>

        <section className="section tam-scoring" aria-labelledby="scoring-title">
          <p className="eyebrow">05 / Scorer après résolution</p>
          <h2 id="scoring-title">Score the system you can actually sell to.</h2>
          <p>These are illustrative signals for this specific commercial thesis—not universal healthcare scoring rules and not a purchase-intent model. Role titles are evidence to investigate, not proof of authority, budget, or responsibility.</p>
          <div>{scoringDimensions.map(([name, values]) => <article key={name}><h3>{name}</h3><p>{values}</p></article>)}</div>
        </section>

        <section className="section tam-hard-part" aria-labelledby="hard-part-title">
          <p className="eyebrow">06 / Le vrai travail</p>
          <h2 id="hard-part-title">The hard part wasn’t the API.</h2>
          <p>Pulling the CMS API was easy. The hard part was realizing CMS and Sales were talking about different entities. The API gave me data. The GTM engineering work was deciding what that data meant.</p>
          <blockquote><span>CMS thinks in facilities.</span><span>AHRQ thinks in health systems.</span><span>Clay and LinkedIn think in companies.</span><strong>Sales cares about the buying organization.</strong></blockquote>
          <aside className="tam-precision-note"><strong>The precise version:</strong> CMS lists hospitals registered with Medicare. AHRQ applies a documented operational definition of health systems. Company platforms organize around company and domain identities. For this thesis, the target account was the organization believed to control contracting.</aside>
          <p>Those layers do not resolve perfectly. I would preserve confidence, lineage, unresolved states, and a human-review queue instead of hiding ambiguity behind one “matched” field.</p>
        </section>

        <section className="section tam-replication" aria-labelledby="replication-title">
          <p className="eyebrow">How to build this yourself</p>
          <h2 id="replication-title">Know what one row represents.</h2>
          <ol>{buildSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>
          <p>The method is tool-independent: Clay, SQL, dbt, Python, spreadsheets, APIs, enrichment providers, and a CRM can all participate. The entity contract matters more than the tool.</p>
        </section>

        <TamChecklist />

        <footer className="section tam-footer">
          <p><strong>Before you score the market, make sure you know what one row actually represents.</strong></p>
          <div className="tam-footer__sources"><span>Primary source concepts:</span><a href="https://data.cms.gov/provider-data/dataset/xubh-q36u" target="_blank" rel="noreferrer noopener">CMS Hospital General Information</a><a href="https://www.ahrq.gov/sites/default/files/wysiwyg/chsp/compendium/2023-hospital-linkage-techdoc.pdf" target="_blank" rel="noreferrer noopener">AHRQ 2023 linkage documentation</a></div>
          <div><a className="button" href={baseUrl}>Return to portfolio</a><a className="text-link" href={`${baseUrl}signal-convergence/`}>Try the Signal Convergence Playground</a><a className="text-link" href={`mailto:${portfolio.person.email}`}>Discuss a GTM data system</a></div>
        </footer>
      </main>
    </>
  )
}
