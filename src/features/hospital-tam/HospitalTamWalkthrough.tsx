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
  const [showAll, setShowAll] = useState(false)
  const visibleFacilities = showAll ? syntheticFacilities : syntheticFacilities.slice(0, 3)

  return (
    <>
      <p className="tam-stage-explainer">Each card is one hospital location—not necessarily one independent customer. Here are 3 representative records from the 10-row example.</p>
      <div className="tam-facility-grid">
        {visibleFacilities.map((facility) => (
          <article key={facility.facilityId}>
            <span>Hospital location · Synthetic</span>
            <strong>{facility.name}</strong>
            <dl><div><dt>Demo ID</dt><dd>{facility.facilityId}</dd></div><div><dt>City</dt><dd>{facility.city}</dd></div><div><dt>Type</dt><dd>{facility.type}</dd></div></dl>
          </article>
        ))}
      </div>
      <button className="tam-record-disclosure" type="button" aria-expanded={showAll} onClick={() => setShowAll((current) => !current)}>{showAll ? 'Show 3 representative records' : 'Inspect all 10 records'}</button>
    </>
  )
}

function SystemGroups() {
  return (
    <><p className="tam-stage-explainer">Hospitals that share an operating organization are grouped together. Ten separate locations now become 4 health systems.</p><div className="tam-entity-groups tam-entity-groups--systems">
      {syntheticSystems.map((system) => {
        const facilities = facilitiesForSystem(system.systemId)
        return (
          <article key={system.systemId}>
            <header><span>{system.systemId}</span><strong>{system.name}</strong><small>{facilities.length} facilities resolve here</small></header>
            <ul>{facilities.map((facility) => <li key={facility.facilityId}><span>{facility.facilityId}</span>{facility.name}</li>)}</ul>
          </article>
        )
      })}
    </div></>
  )
}

function CompanyGroups() {
  return (
    <><p className="tam-stage-explainer">A health system can still share a commercial parent with another system. Example Health System and Metro Surgical Network both belong to Example Health, so sales should treat them as one account.</p><div className="tam-entity-groups tam-entity-groups--companies">
      {syntheticCompanies.map((company) => {
        const systems = systemsForCompany(company.companyId)
        return (
          <article key={company.companyId}>
            <header><span>GTM company · Synthetic</span><strong>{company.name}</strong><small>{company.domain}</small></header>
            <ul>{systems.map((system) => <li key={system.systemId}><span>{system.systemId}</span>{system.name}</li>)}</ul>
          </article>
        )
      })}
    </div></>
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
      <p>Treating every hospital location as a separate prospect would overcount the market and could send several sellers after the same organization.</p>
      <small><strong>Clean demo result:</strong> 0 unresolved. Production should preserve unmatched, ambiguous, stale, acquired, and conflicting records in a review queue—not force them into the funnel.</small>
    </div>
  )
}

const stepPanels = [<FacilityRows />, <SystemGroups />, <CompanyGroups />, <FinalCount />]
const machineCaptions = [
  'Ten hospital-location records enter the feeder as 10 separate inputs.',
  'The resolver groups locations that share an operator, producing 4 health systems.',
  'Example Health System and Metro Surgical Network share one commercial parent. Four systems therefore become 3 potential customers.',
  'Three account balls strike the counter. The machine stops at 03—the organizations a seller can investigate.',
] as const

const facilityBallIds = Array.from({ length: syntheticFacilities.length }, (_, index) => index + 1)
const systemBallIds = Array.from({ length: syntheticSystems.length }, (_, index) => index + 1)
const companyBallIds = Array.from({ length: syntheticCompanies.length }, (_, index) => index + 1)

export function HospitalTamWalkthrough() {
  const [step, setStep] = useState(0)
  const current = walkthroughSteps[step]

  return (
    <section id="walkthrough" className="tam-walkthrough" aria-labelledby="walkthrough-title">
      <header>
        <div><p className="eyebrow">01 / Le collapseur</p><h2 id="walkthrough-title">Watch 10 hospital records become 3 potential customers.</h2></div>
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
        <span className="tam-collapse-gauge__pipe" />

        <div className="tam-collapse-stage tam-collapse-stage--feed">
          <span className="tam-collapse-stage__number">01</span>
          <span className="tam-collapse-stage__label">10 facility rows</span>
          <div className="tam-collapse-feeder">
            <span className="tam-collapse-feeder__rack">
              {facilityBallIds.map((id) => <i key={id} data-artifact-data-ball={id === 1 ? '' : undefined} />)}
            </span>
            <span className="tam-collapse-feeder__drum" />
            <span className="tam-collapse-feeder__chute" />
          </div>
        </div>

        <span className="tam-collapse-transfer tam-collapse-transfer--systems"><i /><i /><i /><i /></span>

        <div className="tam-collapse-stage tam-collapse-stage--systems">
          <span className="tam-collapse-stage__number">02</span>
          <span className="tam-collapse-stage__label">4 health systems</span>
          <div className="tam-system-resolver">
            <span className="tam-system-resolver__press" />
            <span className="tam-system-resolver__cups"><i /><i /><i /><i /></span>
            <span className="tam-system-resolver__balls">{systemBallIds.map((id) => <b key={id}>{id}</b>)}</span>
          </div>
        </div>

        <span className="tam-collapse-transfer tam-collapse-transfer--companies"><i /><i /><i /></span>

        <div className="tam-collapse-stage tam-collapse-stage--companies">
          <span className="tam-collapse-stage__number">03</span>
          <span className="tam-collapse-stage__label">3 GTM companies</span>
          <div className="tam-company-resolver">
            <span className="tam-company-resolver__inputs">{systemBallIds.map((id) => <i key={id} />)}</span>
            <span className="tam-company-resolver__gear tam-company-resolver__gear--a" />
            <span className="tam-company-resolver__gear tam-company-resolver__gear--b" />
            <span className="tam-company-resolver__outputs">{companyBallIds.map((id) => <b key={id}>{id}</b>)}</span>
          </div>
        </div>

        <span className="tam-collapse-transfer tam-collapse-transfer--counter"><i /><i /><i /></span>

        <div className="tam-collapse-stage tam-collapse-stage--counter">
          <span className="tam-collapse-stage__number">04</span>
          <span className="tam-collapse-stage__label">3 GTM accounts</span>
          <div className="tam-account-counter">
            <span className="tam-account-counter__balls">{companyBallIds.map((id) => <i key={id} />)}</span>
            <span className="tam-account-counter__paddles"><b /><b /><b /></span>
            <span className="tam-account-counter__counted">{companyBallIds.map((id) => <b key={id} />)}</span>
            <span className="tam-account-counter__display"><i>00</i><i>01</i><i>02</i><i>03</i></span>
          </div>
        </div>
      </div>
      <p className="tam-machine-caption" aria-live="polite"><strong>The red ball is data.</strong> {machineCaptions[step]} <span>Use “Next layer” to follow the grouping.</span></p>

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
