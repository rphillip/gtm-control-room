import claySnapshot from 'virtual:public-clay-snapshot'
import { useRef } from 'react'
import { ControlRoom } from './components/ControlRoom'
import { DataBallJourney, DataRelay } from './components/DataBallJourney'
import { SelectedSystems } from './components/SelectedSystems'
import { SiteHeader } from './components/SiteHeader'
import { SystemRegistry } from './components/SystemRegistry'
import { hero, portfolio, portfolioWithSnapshot } from './content/portfolio'
import { normalizePublicSnapshot } from './content/publicSnapshot'
import { heroMachineProfile, useMatterMachine } from './hooks/useMatterMachine'
import { useDataWordHighlight } from './hooks/useDataWordHighlight'

export default function App() {
  return <PortfolioPage snapshot={claySnapshot} />
}

export function PortfolioPage({ snapshot }: { snapshot?: unknown }) {
  const atelierRef = useRef<HTMLDivElement>(null)
  useDataWordHighlight()
  useMatterMachine(atelierRef, heroMachineProfile)
  const publicSnapshot = normalizePublicSnapshot(snapshot)
  const content = portfolioWithSnapshot(publicSnapshot)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader />
      <DataBallJourney />
      <main id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <div className="hero__eyebrow-row"><p className="eyebrow">{hero.eyebrow}</p><DataRelay id="hero" variant="intake" label /></div>
            <h1 id="hero-title"><span>Healthcare GTM problems</span> <em>are usually</em> <span><span className="hero__accent-word">data</span> problems first.</span></h1>
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
          <div ref={atelierRef} className="hero__system" aria-label="An illustrated GTM data atelier" data-physics-engine="matter-js">
            <p className="hero__system-label">Atelier de données · Houston</p>
            <svg className="hero__atelier" viewBox="0 0 620 400" role="img" aria-label="A clear line drawing of a healthcare GTM data workshop">
              <g className="hero__atelier-lines">
                <path d="M65 87h490v234H65zM65 128h490"/>
                <path d="M101 235h95l32 35h124l31-35h135"/>
                <circle cx="228" cy="270" r="12"/><circle cx="383" cy="235" r="12"/>
                <path d="M216 270h24m131-35h24"/>
                <path d="M84 335h452M107 349h80m245 0h80"/>
              </g>
              <g className="hero__atelier-station hero__atelier-station--signals" data-atelier-part="signals">
                <path d="M101 207v55h95v-55z"/><path d="m101 207 47-24 48 24-48 23z"/>
                <path className="hero__atelier-antenna" d="M148 183v-27m-13 0h26"/>
              </g>
              <g className="hero__atelier-station hero__atelier-station--join" data-atelier-part="join">
                <path d="M263 195v88h88v-88z"/><path d="m263 195 44-23 44 23-44 23z"/>
                <g className="hero__atelier-rotor"><path d="M307 172v-34m-14 0h28M307 138l17-17m-17 17-17-17"/></g>
              </g>
              <g className="hero__atelier-station hero__atelier-station--route" data-atelier-part="route">
                <path d="M423 207v55h95v-55z"/><path className="hero__atelier-route-lid" d="m423 207 47-24 48 24-48 23z"/>
                <path d="M470 183v-27m-13 0h26"/>
              </g>
              <g className="hero__atelier-accent"><circle cx="228" cy="270" r="5"/><path d="M101 235h34"/></g>
              <g className="hero__atelier-blue"><path d="M484 235h34"/><circle cx="383" cy="235" r="5"/></g>
              <path className="hero__atelier-return" d="M518 235h30V82H82v146h26" />
              <g className="physics-launcher" data-physics-launcher transform="translate(548 235)">
                <path className="physics-launcher__cup" d="M-13-12v24M-13-12h10M-13 12h10" />
                <path className="physics-launcher__spring" d="M-3-9 5-5-3-1 5 3-3 7 5 11" />
                <path d="M7-15v30" />
              </g>
              <circle className="hero__atelier-ball" data-atelier-ball data-physics-ball aria-hidden="true" cx="108" cy="228" r="9" />
              <path className="physics-ball__seam" data-physics-spin aria-hidden="true" d="M -4.5 -2 L 4.5 2" transform="translate(108 228)" />
              <text x="112" y="305">SIGNALS</text><text x="285" y="305">JOIN</text><text x="445" y="305">ROUTE</text>
            </svg>
            <p className="hero__system-note">The small red pulley is failure visibility. Remove it and the whole thing becomes “just automation.”</p>
          </div>
        </section>

        <ControlRoom snapshot={publicSnapshot} />

        <SelectedSystems studies={content.caseStudies} />

        <SystemRegistry snapshot={publicSnapshot} />

        <section id="about" className="section career" aria-labelledby="about-title">
          <div className="journey-heading"><div><p className="eyebrow">04 / Le parcours</p><h2 id="about-title">Data platforms first. Healthcare GTM systems next.</h2></div><DataRelay id="about" variant="elevator" /></div>
          <p className="career__lead">4+ years building cloud data platforms across startup and digital-health environments.</p>
          <div className="career__evidence">
            <details><summary><span><strong>BetterHelp</strong>Lifecycle systems built on dependable data contracts.</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><p>Connected Snowflake, dbt, and Fivetran models to AWS-backed operational views in Looker, Python, and Google Sheets—giving Iterable lifecycle segmentation a dependable data contract.</p></details>
            <details><summary><span><strong>Cylinder Health</strong>Claims, membership, product, and billing made usable together.</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><p>Designed GCP pipelines across BigQuery, Composer/Airflow, Dataflow, Cloud Functions, GKE, GCS, and Terraform to make claims, membership, product, billing, and reporting states usable together.</p></details>
            <details><summary><span><strong>Optum / AbleTo</strong>Healthcare member data made operational at scale.</span><span className="disclosure-plus" aria-hidden="true">+</span></summary><p>Built ETL/ELT and BigQuery data marts that made healthcare member data usable by analytical and operational teams at scale.</p></details>
          </div>
          <p className="career__footnote">Earlier, two years of oil-and-gas data consulting supplied one durable lesson: an automation reduced a multiweek process to 10 minutes. It is supporting proof for the same instinct—make repetitive, high-stakes data work observable and repeatable.</p>
        </section>

        <section id="contact" className="section contact" aria-labelledby="contact-title">
          <div className="journey-heading"><div><p className="eyebrow">05 / Next system</p><h2 id="contact-title">Building a healthcare GTM data system?</h2></div><DataRelay id="contact" variant="dispatch" /></div>
          <p>Let’s talk about the source data, signal contracts, routing, and reliability work that makes an activation layer useful.</p>
          <div className="contact__links"><a className="button" href={`mailto:${portfolio.person.email}`}>Email Ryan</a><a className="text-link" href={portfolio.person.linkedIn} target="_blank" rel="noreferrer">Professional profile</a></div>
        </section>
      </main>
    </>
  )
}
