import claySnapshot from './data/clay-snapshot.json'
import { ControlRoom } from './components/ControlRoom'
import { MetricStrip } from './components/MetricStrip'
import { SiteHeader } from './components/SiteHeader'
import { hero, portfolio, snapshotMetrics } from './content/portfolio'
import type { ClaySnapshot } from './content/types'

// JSON imports lose tuple inference; Task 2 has already sanitized this build-time asset.
const metrics = snapshotMetrics(claySnapshot as unknown as ClaySnapshot)

export default function App() {
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

        <ControlRoom snapshot={claySnapshot} />

        <section id="work" className="section section--placeholder" aria-labelledby="work-title">
          <p className="eyebrow">02 / Selected systems</p>
          <h2 id="work-title">Work with evidence, not a tool list.</h2>
          <p>Three case studies cover account scoring, healthcare entity resolution, and activation-ready workflows.</p>
        </section>

        <section id="registry" className="section section--placeholder" aria-labelledby="registry-title">
          <p className="eyebrow">03 / System registry</p>
          <h2 id="registry-title">Signals and workflows, inventory pending.</h2>
          <p>Registry details will surface sanitized, build-time aggregates only—never rows, records, or private workspace links.</p>
        </section>

        <section id="about" className="section section--placeholder" aria-labelledby="about-title">
          <p className="eyebrow">04 / Through-line</p>
          <h2 id="about-title">Data platforms first. GTM systems next.</h2>
          <p>Ryan has built cloud data systems in startup and digital-health settings, including BetterHelp, Cylinder Health, and Optum/AbleTo.</p>
        </section>

        <section id="contact" className="section section--placeholder" aria-labelledby="contact-title">
          <p className="eyebrow">05 / Next system</p>
          <h2 id="contact-title">Building a healthcare GTM data system?</h2>
          <p>
            <a className="text-link" href={`mailto:${portfolio.person.email}`}>
              {portfolio.person.email}
            </a>
          </p>
        </section>
      </main>
    </>
  )
}
