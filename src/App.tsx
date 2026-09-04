import claySnapshot from 'virtual:public-clay-snapshot'
import { ControlRoom } from './components/ControlRoom'
import { CaseStudy } from './components/CaseStudy'
import { MetricStrip } from './components/MetricStrip'
import { SiteHeader } from './components/SiteHeader'
import { SystemRegistry } from './components/SystemRegistry'
import { hero, portfolio, portfolioWithSnapshot, snapshotMetrics } from './content/portfolio'
import { normalizePublicSnapshot } from './content/publicSnapshot'

export default function App() {
  return <PortfolioPage snapshot={claySnapshot} />
}

export function PortfolioPage({ snapshot }: { snapshot?: unknown }) {
  const publicSnapshot = normalizePublicSnapshot(snapshot)
  const metrics = snapshotMetrics(publicSnapshot)
  const content = portfolioWithSnapshot(publicSnapshot)

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
            <h1 id="hero-title"><span>Healthcare GTM problems</span> <em>are usually</em> <span>data problems first.</span></h1>
            <p className="hero__lede">{hero.lede}</p>
            <p className="hero__proof">{hero.proof}</p>
            <div className="hero__actions">
              <a className="button" href="#control-room">Start the machine</a>
              <a className="text-link" href={portfolio.person.linkedIn}>
                LinkedIn
              </a>
              <a className="text-link" href={`mailto:${portfolio.person.email}`}>
                Email Ryan
              </a>
            </div>
          </div>
          <div className="hero__system" aria-label="An illustrated GTM data atelier">
            <p className="hero__system-label">Atelier de données · Chicago</p>
            <svg className="hero__atelier" viewBox="0 0 620 440" role="img" aria-label="A whimsical line drawing of a healthcare GTM data workshop">
              <g className="hero__atelier-lines">
                <path d="M68 92h210v137H68zM99 92v137M68 129h210M333 60h196v116H333zM374 60v116M333 102h196"/>
                <path d="m96 284 163-73 177 88-164 82zM96 284v60l176 90v-53m164-82v53l-164 82"/>
                <path d="M153 259v-48h65v20m84 26v-62h78v41m-189 45h38v24h-38zm96 16h52v31h-52z"/>
                <circle cx="166" cy="338" r="27"/><circle cx="374" cy="343" r="27"/>
                <path d="M166 311v-38m-17-25a18 18 0 0 1 34 0v25m191 43v-75m-17-25a18 18 0 0 1 34 0v25"/>
                <path d="M47 265h85m-70-14 14 14-14 14m376-52h117m-15-14 15 14-15 14"/>
                <circle cx="304" cy="116" r="18"/><path d="M304 98v36m-18-18h36"/>
                <path d="M482 273c-26-23-53-25-72-5m49-17 11 19-21 5"/>
              </g>
              <g className="hero__atelier-accent"><circle cx="304" cy="116" r="5"/><path d="M47 265h25"/></g>
              <g className="hero__atelier-blue"><path d="M530 227h25"/><circle cx="374" cy="343" r="5"/></g>
              <text x="111" y="322">SIGNALS</text><text x="286" y="289">JOIN</text><text x="355" y="331">ROUTE</text>
            </svg>
            <p className="hero__system-note">The small red pulley is failure visibility. Remove it and the whole thing becomes “just automation.”</p>
          </div>
          <MetricStrip metrics={metrics} />
        </section>

        <ControlRoom snapshot={publicSnapshot} />

        <section id="work" className="section selected-systems" aria-labelledby="work-title">
          <p className="eyebrow">02 / Les systèmes</p>
          <h2 id="work-title">Three machines. Real evidence.</h2>
          <p>See the idea first. Open a case file for the build logs, failures, and what I would change in production.</p>
          <div className="selected-systems__list">
            {content.caseStudies.map((study, index) => <CaseStudy key={study.slug} study={study} index={index} />)}
          </div>
        </section>

        <SystemRegistry snapshot={publicSnapshot} />

        <section id="about" className="section career" aria-labelledby="about-title">
          <p className="eyebrow">04 / Le parcours</p>
          <h2 id="about-title">Data platforms first. Healthcare GTM systems next.</h2>
          <p className="career__lead">4+ years building cloud data platforms across startup and digital-health environments.</p>
          <div className="career__evidence">
            <details><summary><span><strong>BetterHelp</strong>Lifecycle systems built on dependable data contracts.</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><p>Connected Snowflake, dbt, and Fivetran models to AWS-backed operational views in Looker, Python, and Google Sheets—giving Iterable lifecycle segmentation a dependable data contract.</p></details>
            <details><summary><span><strong>Cylinder Health</strong>Claims, membership, product, and billing made usable together.</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><p>Designed GCP pipelines across BigQuery, Composer/Airflow, Dataflow, Cloud Functions, GKE, GCS, and Terraform to make claims, membership, product, billing, and reporting states usable together.</p></details>
            <details><summary><span><strong>Optum / AbleTo</strong>Healthcare member data made operational at scale.</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><p>Built ETL/ELT and BigQuery data marts that made healthcare member data usable by analytical and operational teams at scale.</p></details>
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
