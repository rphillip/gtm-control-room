import { useState } from 'react'
import {
  facilitiesForSystem,
  syntheticCompanies,
  syntheticFacilities,
  syntheticSystems,
  systemsForCompany,
  walkthroughSteps,
} from './model'

function FacilityRows() {
  return (
    <div className="tam-facility-grid">
      {syntheticFacilities.map((facility) => (
        <article key={facility.facilityId}>
          <span>CMS facility · Synthetic</span>
          <strong>{facility.name}</strong>
          <dl><div><dt>Demo CCN</dt><dd>{facility.facilityId}</dd></div><div><dt>City</dt><dd>{facility.city}</dd></div><div><dt>Type</dt><dd>{facility.type}</dd></div></dl>
        </article>
      ))}
    </div>
  )
}

function SystemGroups() {
  return (
    <div className="tam-entity-groups tam-entity-groups--systems">
      {syntheticSystems.map((system) => {
        const facilities = facilitiesForSystem(system.systemId)
        return (
          <article key={system.systemId}>
            <header><span>{system.systemId}</span><strong>{system.name}</strong><small>{facilities.length} facilities resolve here</small></header>
            <ul>{facilities.map((facility) => <li key={facility.facilityId}><span>{facility.facilityId}</span>{facility.name}</li>)}</ul>
          </article>
        )
      })}
    </div>
  )
}

function CompanyGroups() {
  return (
    <div className="tam-entity-groups tam-entity-groups--companies">
      {syntheticCompanies.map((company) => {
        const systems = systemsForCompany(company.companyId)
        return (
          <article key={company.companyId}>
            <header><span>GTM company · Synthetic</span><strong>{company.name}</strong><small>{company.domain}</small></header>
            <ul>{systems.map((system) => <li key={system.systemId}><span>{system.systemId}</span>{system.name}</li>)}</ul>
          </article>
        )
      })}
    </div>
  )
}

function FinalCount() {
  return (
    <div className="tam-final-count">
      <div><strong>{syntheticFacilities.length}</strong><span>Raw facility rows</span></div>
      <i aria-hidden="true">→</i>
      <div><strong>{syntheticSystems.length}</strong><span>Health systems</span></div>
      <i aria-hidden="true">→</i>
      <div className="is-final"><strong>{syntheticCompanies.length}</strong><span>GTM accounts</span></div>
      <p>If I treated every hospital as a prospect, I would overcount the market and could send multiple reps after the same buying organization.</p>
      <small><strong>Clean demo result:</strong> 0 unresolved. Production should preserve unmatched, ambiguous, stale, acquired, and conflicting records in a review queue—not force them into the funnel.</small>
    </div>
  )
}

const stepPanels = [<FacilityRows />, <SystemGroups />, <CompanyGroups />, <FinalCount />]
const machineCaptions = [
  'The hopper feeds ten hospital records onto the rail, one record at a time.',
  'The two jaws close when a hospital record finds the health system it belongs to.',
  'The paired rollers pull system names together under the same parent company.',
  'The ball taps 1, 2, 3—counting final sales accounts—then the spring sends it back.',
] as const

export function HospitalTamWalkthrough() {
  const [step, setStep] = useState(0)
  const current = walkthroughSteps[step]

  return (
    <section id="walkthrough" className="tam-walkthrough" aria-labelledby="walkthrough-title">
      <header>
        <div><p className="eyebrow">01 / Le collapseur</p><h2 id="walkthrough-title">Watch ten rows become three accounts.</h2></div>
        <p><strong>Demo / synthetic data.</strong> Every name, identifier, relationship, and domain in this walkthrough is invented.</p>
      </header>

      <nav className="tam-step-nav" aria-label="Entity-resolution walkthrough">
        {walkthroughSteps.map((item, index) => (
          <button key={item.title} type="button" aria-current={step === index ? 'step' : undefined} onClick={() => setStep(index)}>
            <span>0{index + 1}</span><strong>{item.title}</strong><small>{item.shortLabel}</small>
          </button>
        ))}
      </nav>

      <div className="tam-collapse-gauge" data-step={step + 1} aria-hidden="true">
        <span className="tam-collapse-gauge__rail" />
        <i className="tam-collapse-gauge__hopper">10</i>
        <i className="tam-collapse-gauge__join"><span /><span /><em>join</em></i>
        <i className="tam-collapse-gauge__rollers">4</i>
        <i className="tam-collapse-gauge__spring"><span>1</span><span>2</span><span>3</span></i>
        <b className="tam-collapse-gauge__ball" data-artifact-data-ball />
      </div>
      <p className="tam-machine-caption" aria-live="polite"><strong>The red ball is data.</strong> {machineCaptions[step]}</p>

      <div className="tam-walkthrough__stage" role="region" aria-labelledby="current-step-title" key={step}>
        <header><span>Step {step + 1} of 4</span><h3 id="current-step-title">{current.title}</h3></header>
        {stepPanels[step]}
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">Step {step + 1} of 4: {current.title}. {current.shortLabel}.</p>
      <div className="tam-walkthrough__controls">
        <button type="button" disabled={step === 0} onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}>← Previous layer</button>
        <button type="button" disabled={step === walkthroughSteps.length - 1} onClick={() => setStep((currentStep) => Math.min(walkthroughSteps.length - 1, currentStep + 1))}>Next layer →</button>
      </div>
    </section>
  )
}
