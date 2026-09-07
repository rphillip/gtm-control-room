import { useRef } from 'react'
import { portfolio } from '../../content/portfolio'
import { useDataWordHighlight } from '../../hooks/useDataWordHighlight'
import { FailureChainMachine } from './FailureChainMachine'
import { HospitalTamWalkthrough } from './HospitalTamWalkthrough'
import { IdentityPassportMachine } from './IdentityPassportMachine'
import { ScoreSystemBuilder } from './ScoreSystemBuilder'
import { TamChecklist } from './TamChecklist'
import { ThesisCalibrationMachine } from './ThesisCalibrationMachine'

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

const plainBuildSteps = [
  'Decide what counts as one potential customer.',
  'Connect each hospital location to the organization that operates it.',
  'Keep uncertain or conflicting matches in a human-review queue.',
  'Choose qualification rules that reflect the product being sold.',
  'Only then build the account list and investigate likely buyers.',
] as const

interface MayaPromptProps {
  question: string
  answer: string
  consequence: string
}

function MayaPrompt({ question, answer, consequence }: MayaPromptProps) {
  return (
    <aside className="tam-maya-prompt">
      <span className="tam-maya-prompt__portrait" aria-hidden="true"><i /><b /></span>
      <div>
        <span>Maya’s market puzzle</span>
        <strong>{question}</strong>
      </div>
      <details>
        <summary>Show the short answer</summary>
        <p>{answer}</p>
        <small><b>Why Maya cares:</b> {consequence}</small>
      </details>
    </aside>
  )
}

function IdentityLegend() {
  return (
    <section className="tam-identity-legend" aria-labelledby="identity-legend-title">
      <header>
        <div><span className="tam-maya-prompt__portrait" aria-hidden="true"><i /><b /></span></div>
        <div><p className="eyebrow">Meet Maya</p><h2 id="identity-legend-title">She needs a list of organizations that could buy her product.</h2><p>The red ball is one piece of data. Watch what it means as the machine connects a place to the organizations behind it.</p></div>
      </header>
      <div className="tam-identity-legend__machine" aria-label="A hospital location connects to a health system, which connects to a potential customer">
        <article>
          <span>01 / A place</span>
          <i className="tam-identity-icon tam-identity-icon--facility" aria-hidden="true"><b /><b /><b /></i>
          <strong>Hospital</strong>
          <small>One physical location</small>
        </article>
        <i className="tam-identity-legend__arrow" aria-hidden="true">→</i>
        <article>
          <span>02 / An operator</span>
          <i className="tam-identity-icon tam-identity-icon--system" aria-hidden="true"><b /><b /><b /></i>
          <strong>Health system</strong>
          <small>A group that operates locations</small>
        </article>
        <i className="tam-identity-legend__arrow" aria-hidden="true">→</i>
        <article>
          <span>03 / A potential customer</span>
          <i className="tam-identity-icon tam-identity-icon--account" aria-hidden="true"><b /></i>
          <strong>Sales account</strong>
          <small>The organization Maya may approach</small>
        </article>
        <i className="tam-identity-legend__ball" aria-hidden="true" data-artifact-data-ball />
      </div>
      <dl className="tam-mini-glossary">
        <div><dt>TAM</dt><dd>The total revenue opportunity if every suitable organization became a customer.</dd></div>
        <div><dt>GTM</dt><dd>How a company finds, understands, and reaches potential customers.</dd></div>
      </dl>
    </section>
  )
}

export function HospitalTamPage() {
  const mainRef = useRef<HTMLElement>(null)
  useDataWordHighlight(mainRef)
  const baseUrl = import.meta.env.BASE_URL

  return (
    <>
      <a className="skip-link" href="#main">Skip to hospital TAM artifact</a>
      <header className="site-header hospital-tam-header">
        <a className="site-header__mark" href={baseUrl} aria-label="RS — return to Ryan Sulapas portfolio">RS<span aria-hidden="true">/</span></a>
        <nav aria-label="Hospital TAM sections"><ul className="site-header__nav"><li><a href="#walkthrough">Story</a></li><li><a href="#failures">Why</a></li><li><a href="#pipeline">Identity</a></li><li><a href="#filters">Thesis</a></li><li><a href="#scoring">Brief</a></li></ul></nav>
      </header>

      <main ref={mainRef} id="main" className="hospital-tam-page" tabIndex={-1}>
        <section className="hospital-tam-hero" aria-labelledby="hospital-tam-title">
          <div>
            <p className="eyebrow">Provider-market study · Demo / synthetic walkthrough</p>
            <h1 id="hospital-tam-title"><span>5,000 Hospitals</span> Doesn’t Mean <span>5,000 Prospects</span></h1>
            <p>Imagine selling software to hospital organizations. A public file may list roughly 5,000 hospital locations, but several locations can share the same organization—and the same purchasing decision.</p>
            <ul className="artifact-tags" aria-label="Project tags">{['GTM Engineering', 'Data Engineering', 'Healthcare', 'Entity Resolution', 'TAM Design'].map((tag) => <li key={tag}>{tag}</li>)}</ul>
          </div>
          <aside className="hospital-tam-hero__thesis"><span>Source row</span><strong>≠</strong><span>Buying unit</span><small>Facility records are inputs. Accounts are decisions.</small></aside>
        </section>

        <p className="tam-disclosure"><strong>Independent portfolio exercise.</strong> Public-data concepts, synthetic examples, and no patient or private company information. Not work performed for, sponsored by, or endorsed by Turquoise Health, CMS, AHRQ, Clay, LinkedIn, or any depicted organization.</p>

        <IdentityLegend />

        <MayaPrompt
          question="If the file contains 10 hospital rows, does Maya have 10 potential customers?"
          answer="Not necessarily. A row describes a hospital location. Several locations can belong to the same organization and share one purchasing decision."
          consequence="Counting locations as customers can make her market look much larger than it really is."
        />

        <HospitalTamWalkthrough />

        <section id="failures" className="section tam-failures" aria-labelledby="failures-title">
          <p className="eyebrow">02 / Ce qui casse</p>
          <h2 id="failures-title">What breaks if every hospital row becomes a customer?</h2>
          <p className="tam-section-guide">Run the same data through both paths. Skipping the identity work creates five connected business problems; resolving first produces one stable account.</p>
          <MayaPrompt
            question="Why can’t Maya simply email every row in the file?"
            answer="Several rows may point to the same customer. Treating them separately can create duplicate messages, conflicting ownership, and inflated reports."
            consequence="A tidy-looking list can still cause a messy customer experience."
          />
          <FailureChainMachine />
        </section>

        <section id="pipeline" className="section tam-pipeline-section" aria-labelledby="pipeline-title">
          <p className="eyebrow">03 / La chaîne d'identité</p>
          <h2 id="pipeline-title">How one hospital record becomes one reviewable sales account.</h2>
          <p className="tam-section-guide">Follow Hospital A from a public listing to the organization a seller recognizes. Each station adds evidence; if two sources disagree, the machine stops instead of inventing an answer.</p>
          <MayaPrompt
            question="How does Maya know which organization sits behind Hospital A?"
            answer="She carries the hospital’s identifier through trusted connections: first to its operating system, then to the commercial organization a seller recognizes."
            consequence="When sources disagree, pausing for a person is safer than silently choosing the wrong owner."
          />
          <IdentityPassportMachine />
          <p className="tam-pipeline-note"><strong>Why this matters:</strong> matching records that describe the same real-world organization changes the size and meaning of the market. Imperfect matches, acquisitions, stale records, and missing information still need human review.</p>
        </section>

        <section id="filters" className="section tam-filters" aria-labelledby="filters-title">
          <p className="eyebrow">04 / Qualifier l'univers</p>
          <h2 id="filters-title">The product determines which accounts matter.</h2>
          <p>A GTM thesis is the rule for deciding which organizations are worth investigating for a particular product. In this example, hospitals negotiate payment terms with insurance companies, so commercial-insurer complexity matters more than simply asking, “Is this technically a hospital?” Change the product strategy and the same account can follow a different route.</p>
          <MayaPrompt
            question="If an organization is real, does that automatically make it a good prospect?"
            answer="No. The organization must also have a problem Maya’s particular product can solve. The switches below represent those product-specific rules."
            consequence="A correct account can still be the wrong customer for this product."
          />
          <ThesisCalibrationMachine />
        </section>

        <section id="scoring" className="section tam-scoring" aria-labelledby="scoring-title">
          <p className="eyebrow">05 / Le dossier de compte</p>
          <h2 id="scoring-title">Build an account brief you can act on.</h2>
          <p>Once you know who the potential customer is, gather evidence that tells a seller what to investigate next. This produces a research brief—not a universal score or a prediction that the organization will buy.</p>
          <MayaPrompt
            question="What should Maya learn before deciding how to approach the account?"
            answer="She collects clues about the organization’s size, footprint, hospital mix, and likely buying functions—while keeping the source and uncertainty attached."
            consequence="Evidence gives her a useful next question; it does not pretend to predict a purchase."
          />
          <ScoreSystemBuilder />
        </section>

        <section id="lesson" className="section tam-hard-part" aria-labelledby="hard-part-title">
          <p className="eyebrow">06 / Le vrai travail</p>
          <h2 id="hard-part-title">The difficult part was deciding what each record meant.</h2>
          <p>Downloading a list was easy. The real work was recognizing that different sources describe different layers of the market—and that sales needs a trustworthy connection between them.</p>
          <blockquote><span>A public file describes hospital locations.</span><span>A system directory groups operating organizations.</span><span>Company tools recognize commercial identities.</span><strong>Sales needs one record for each potential customer.</strong></blockquote>
          <details className="tam-technical-notes"><summary>Technical notes for hiring managers</summary><div><p>CMS lists hospitals registered with Medicare. AHRQ applies a documented operational definition of health systems. Company platforms organize around company and domain identities. For this thesis, the target account was the organization believed to control contracting.</p><p>Those layers do not resolve perfectly. Production should preserve confidence, source history, unmatched records, and a human-review queue instead of hiding uncertainty behind one “matched” field.</p></div></details>
        </section>

        <section className="section tam-replication" aria-labelledby="replication-title">
          <p className="eyebrow">How to keep the market honest</p>
          <h2 id="replication-title">Five rules are enough to remember.</h2>
          <ol>{plainBuildSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol>
          <details className="tam-builder-notes"><summary>Open the technical implementation checklist</summary><div><ol>{buildSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span>{step}</li>)}</ol><p>The method is tool-independent: Clay, SQL, dbt, Python, spreadsheets, APIs, enrichment providers, and a CRM can all participate. The definition of one account matters more than the tool.</p></div></details>
        </section>

        <TamChecklist />

        <section className="section tam-loop-summary" aria-labelledby="loop-summary-title">
          <p className="eyebrow">The whole journey</p>
          <h2 id="loop-summary-title">From hospital rows to a market sales can trust.</h2>
          <ol><li><span>Input</span><strong>Hospital-location records</strong></li><li><span>Resolve</span><strong>Connect facilities to systems and buying organizations</strong></li><li><span>Output</span><strong>One reviewable record per potential customer</strong></li><li><span>Result</span><strong>Honest market size, coordinated outreach, and trustworthy reporting</strong></li></ol>
        </section>

        <footer className="section tam-footer">
          <p><strong>Before you count or prioritize a market, make sure you know what one row actually represents.</strong></p>
          <div className="tam-footer__sources"><span>Primary source concepts:</span><a href="https://data.cms.gov/provider-data/dataset/xubh-q36u" target="_blank" rel="noreferrer noopener">CMS Hospital General Information</a><a href="https://www.ahrq.gov/sites/default/files/wysiwyg/chsp/compendium/2023-hospital-linkage-techdoc.pdf" target="_blank" rel="noreferrer noopener">AHRQ 2023 linkage documentation</a></div>
          <div><a className="button" href={baseUrl}>Return to portfolio</a><a className="text-link" href={`${baseUrl}signal-convergence/`}>Try the Signal Convergence Playground</a><a className="text-link" href={`mailto:${portfolio.person.email}`}>Discuss a GTM data system</a></div>
        </footer>
      </main>
    </>
  )
}
