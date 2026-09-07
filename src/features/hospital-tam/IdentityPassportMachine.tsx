import { useState } from 'react'

const passportStages = [
  {
    name: 'Hospital record',
    action: 'Start with one public hospital listing',
    explanation: 'The public file describes a physical hospital location. It does not yet tell us which organization a seller should approach.',
    field: 'source_table',
    value: 'CMS Hospital General Information',
    kind: 'intake',
  },
  {
    name: 'Physical facility',
    action: 'Give the location a stable identity',
    explanation: 'The machine preserves the hospital’s original identifier so every later decision can be traced back to the source.',
    field: 'facility_id',
    value: 'DEMO01',
    kind: 'label',
  },
  {
    name: 'Operating system',
    action: 'Find the health system that operates it',
    explanation: 'A documented reference connects the hospital location to its operating health system. If reliable sources disagree, the record stops here for review.',
    field: 'health_sys_id',
    value: 'SYS001',
    kind: 'join',
  },
  {
    name: 'Sales company',
    action: 'Find the company a seller recognizes',
    explanation: 'The operating system is connected to the commercial company name and website used by sales tools.',
    field: 'company_id',
    value: 'CO001',
    kind: 'gear',
  },
  {
    name: 'Product fit',
    action: 'Ask whether the account fits this product',
    explanation: 'Only after the organization is stable does the machine consider its size, hospital mix, and operating footprint.',
    field: 'fit_tier',
    value: 'INVESTIGATE',
    kind: 'stamp',
  },
  {
    name: 'Buyer clues',
    action: 'Attach clues about the likely buying team',
    explanation: 'Relevant departments suggest where a seller should investigate. A job title alone does not prove authority, budget, or purchase intent.',
    field: 'buyer_evidence',
    value: 'Managed Care',
    kind: 'clips',
  },
  {
    name: 'Reviewable account',
    action: 'Release one account for investigation',
    explanation: 'The finished record can enter a sales research list because the organization, evidence, and unresolved questions remain inspectable.',
    field: 'audience_status',
    value: 'QUALIFIED FOR REVIEW',
    kind: 'outbox',
  },
] as const

export function IdentityPassportMachine() {
  const [step, setStep] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const [ambiguous, setAmbiguous] = useState(false)
  const current = passportStages[step]
  const isHeld = ambiguous && step === 2

  const moveTo = (nextStep: number) => {
    if (ambiguous && nextStep > 2) return
    setStep(nextStep)
    setFurthestStep((currentFurthest) => Math.max(currentFurthest, nextStep))
  }

  const toggleAmbiguity = (enabled: boolean) => {
    setAmbiguous(enabled)
    if (enabled && step > 2) setStep(2)
  }

  const reset = () => {
    setStep(0)
    setFurthestStep(0)
    setAmbiguous(false)
  }

  return (
    <div className={`tam-passport-machine${isHeld ? ' is-held' : ''}`} data-step={step}>
      <header className="tam-passport-machine__header">
        <div><span>Trace one synthetic record</span><strong>Hospital A · DEMO01</strong></div>
        <label className="tam-ambiguity-switch">
          <span><strong>Simulate a disputed match</strong><small>Two sources name different parent systems</small></span>
          <input type="checkbox" role="switch" checked={ambiguous} onChange={(event) => toggleAmbiguity(event.target.checked)} />
          <i aria-hidden="true" />
        </label>
      </header>

      <nav className="tam-passport-track" aria-label="Identity passport stations">
        <span className="tam-passport-track__rail" aria-hidden="true" />
        <i className="tam-passport-track__ball" aria-hidden="true" />
        {passportStages.map((stage, index) => (
          <button
            key={stage.name}
            type="button"
            data-kind={stage.kind}
            disabled={index > furthestStep || (ambiguous && index > 2)}
            aria-current={index === step ? 'step' : undefined}
            onClick={() => moveTo(index)}
          >
            <span>0{index + 1}</span>
            <i className="tam-passport-track__mechanism" aria-hidden="true" />
            <strong>{stage.name}</strong>
          </button>
        ))}
        <span className="tam-passport-track__trapdoor" aria-hidden="true" />
        <span className="tam-passport-track__review-chute" aria-hidden="true">Review</span>
      </nav>

      <div className="tam-passport-workbench">
        <aside className={`tam-passport-inspector${isHeld ? ' is-review' : ''}`} key={`${step}-${ambiguous}`}>
          <span>{isHeld ? 'Exception 01' : `Station 0${step + 1}`}</span>
          <h3>{isHeld ? 'The machine refuses the match.' : current.action}</h3>
          <p>{isHeld ? 'Two plausible health-system parents claim DEMO01. Forcing either value would corrupt every downstream company, score, buyer, and audience field.' : current.explanation}</p>
          <div><span>Before</span><strong>{step === 0 ? 'One hospital listing' : passportStages[step - 1].name}</strong><i aria-hidden="true">→</i><span>After</span><strong>{isHeld ? 'Human review queue' : current.name}</strong></div>
          {isHeld ? <small><strong>Safe behavior:</strong> keep both possible parents, the supporting sources, and the unresolved state until a person reviews the disagreement.</small> : null}
        </aside>

        <details className="tam-passport-receipt">
          <summary>View the technical data receipt</summary>
          <article className="tam-passport-card" aria-label="Identity passport for Hospital A">
            <header><span>Technical data receipt · Synthetic</span><strong>Hospital A</strong><small>One record · traceable source history</small></header>
            <dl>
              {passportStages.map((stage, index) => {
                const acquired = index <= step && !(isHeld && index > 2)
                const conflict = isHeld && index === 2
                return (
                  <div key={stage.field} className={acquired ? 'is-acquired' : ''}>
                    <dt>{stage.field}</dt>
                    <dd>{conflict ? 'CONFLICT' : acquired ? stage.value : 'Pending'}</dd>
                  </div>
                )
              })}
            </dl>
            <footer><span>Resolution status</span><strong>{isHeld ? 'HUMAN REVIEW' : step === passportStages.length - 1 ? 'READY' : 'IN PROCESS'}</strong></footer>
          </article>
        </details>
      </div>

      <div className="tam-passport-controls">
        <button type="button" disabled={step === 0} onClick={() => moveTo(step - 1)}>← Previous stamp</button>
        <button type="button" onClick={reset}>Reset passport</button>
        <button type="button" disabled={step === passportStages.length - 1 || isHeld} onClick={() => moveTo(step + 1)}>{isHeld ? 'Held for human review' : step === passportStages.length - 1 ? 'Passport complete' : 'Advance record →'}</button>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">{isHeld ? 'Hospital A is held for human review because its system identity is ambiguous.' : `Identity station ${step + 1} of 7: ${current.name}. ${current.field} is ${current.value}.`}</p>
    </div>
  )
}
