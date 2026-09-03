import claySnapshot from './data/clay-snapshot.json'
import { ControlRoom } from './components/ControlRoom'
import { CaseStudy } from './components/CaseStudy'
import { MetricStrip } from './components/MetricStrip'
import { SiteHeader } from './components/SiteHeader'
import { SystemRegistry } from './components/SystemRegistry'
import { hero, portfolio, snapshotMetrics } from './content/portfolio'
import { normalizePublicSnapshot } from './content/publicSnapshot'

export default function App() {
  return <PortfolioPage snapshot={claySnapshot} />
}

export function PortfolioPage({ snapshot }: { snapshot?: unknown }) {
  const publicSnapshot = normalizePublicSnapshot(snapshot)
  const metrics = snapshotMetrics(publicSnapshot)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 id="hero-title">{hero.title}</h1>
            <p className="hero__lede">{hero.lede}</p>
            <p className="hero__proof">{hero.proof}</p>
            <div className="hero__actions">
              <a className="button" href="#control-room">
                Enter the Control Room
              </a>
              <a className="text-link" href={portfolio.person.linkedIn}>
                LinkedIn
              </a>
              <a className="text-link" href={`mailto:${portfolio.person.email}`}>
                Email Ryan
              </a>
            </div>
          </div>
          <div className="hero__system" aria-label="GTM data-system loop">
            <p className="hero__system-label">Operating loop · observable by design</p>
            <ol className="hero__loop">
              <li>Detect</li>
              <li>Normalize</li>
              <li>Qualify</li>
              <li>Route</li>
              <li>Activate</li>
              <li>Observe</li>
              <li>Improve</li>
            </ol>
            <p className="hero__system-note">Signals become dependable only when their failure states remain in view.</p>
          </div>
          <MetricStrip metrics={metrics} />
        </section>

        <ControlRoom snapshot={publicSnapshot} />

        <section id="work" className="section selected-systems" aria-labelledby="work-title">
          <p className="eyebrow">02 / Selected systems</p>
          <h2 id="work-title">Work with evidence, not a tool list.</h2>
          <p>Three systems show the problem, observable build, evidence boundary, failure state, and the production revision I would make next.</p>
          <div className="selected-systems__list">
            {portfolio.caseStudies.map((study, index) => <CaseStudy key={study.slug} study={study} index={index} />)}
          </div>
        </section>

        <SystemRegistry snapshot={publicSnapshot} />

        <section id="about" className="section career" aria-labelledby="about-title">
          <p className="eyebrow">04 / Through-line</p>
          <h2 id="about-title">Data platforms first. Healthcare GTM systems next.</h2>
          <p className="career__lead">4+ years building cloud data platforms across startup and digital-health environments.</p>
          <div className="career__evidence">
            <article><h3>BetterHelp</h3><p>Connected Snowflake, dbt, and Fivetran models to AWS-backed operational views in Looker, Python, and Google Sheets—giving Iterable lifecycle segmentation a dependable data contract.</p></article>
            <article><h3>Cylinder Health</h3><p>Designed GCP pipelines across BigQuery, Composer/Airflow, Dataflow, Cloud Functions, GKE, GCS, and Terraform to make claims, membership, product, billing, and reporting states usable together.</p></article>
            <article><h3>Optum / AbleTo</h3><p>Built ETL/ELT and BigQuery data marts that made healthcare member data usable by analytical and operational teams at scale.</p></article>
          </div>
          <p className="career__footnote">Earlier, two years of oil-and-gas data consulting supplied one durable lesson: an automation reduced a multiweek process to 10 minutes. It is supporting proof for the same instinct—make repetitive, high-stakes data work observable and repeatable.</p>
        </section>

        <section id="contact" className="section contact" aria-labelledby="contact-title">
          <p className="eyebrow">05 / Next system</p>
          <h2 id="contact-title">Building a healthcare GTM data system?</h2>
          <p>Let’s talk about the source data, signal contracts, routing, and reliability work that makes an activation layer useful.</p>
          <div className="contact__links"><a className="button" href={`mailto:${portfolio.person.email}`}>Email Ryan</a><a className="text-link" href={portfolio.person.linkedIn} target="_blank" rel="noreferrer">Professional profile</a></div>
        </section>
      </main>
    </>
  )
}
