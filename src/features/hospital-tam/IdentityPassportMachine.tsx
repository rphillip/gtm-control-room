import { useState } from 'react'

const passportStages = [
  {
    name: 'Public data',
    action: 'Intake the source row',
    explanation: 'The machine starts with a public CMS row. It is evidence about a facility—not yet a sales account.',
    field: 'source_table',
    value: 'CMS Hospital General Information',
    kind: 'intake',
  },
  {
    name: 'Facility',
    action: 'Preserve the facility identity',
    explanation: 'The row receives a durable facility key. Leading zeroes and the original source identifier stay intact for lineage.',
    field: 'facility_id',
    value: 'DEMO01',
    kind: 'label',
  },
  {
    name: 'System resolution',
    action: 'Join the facility to a system',
    explanation: 'A documented crosswalk links the facility to its operating health system. An uncertain or conflicting join must stop here.',
    field: 'health_sys_id',
    value: 'SYS001',
    kind: 'join',
  },
  {
    name: 'Company resolution',
    action: 'Resolve the commercial identity',
    explanation: 'The system identity resolves to the company and domain that GTM tools and sellers can recognize.',
    field: 'company_id',
    value: 'CO001',
    kind: 'gear',
  },
  {
    name: 'Account scoring',
    action: 'Apply the commercial thesis',
    explanation: 'Only after resolution does the machine assess system scale, facility mix, and geographic complexity.',
    field: 'fit_tier',
    value: 'INVESTIGATE',
    kind: 'stamp',
  },
  {
    name: 'Buyer evidence',
    action: 'Attach evidence—not certainty',
    explanation: 'Relevant functions suggest where to investigate. A role title does not prove authority, budget, or purchase intent.',
    field: 'buyer_evidence',
    value: 'Managed Care',
    kind: 'clips',
  },
  {
    name: 'Qualified audience',
    action: 'Release one reviewable account',
    explanation: 'The finished passport can enter a GTM audience because its entity lineage and qualification evidence remain inspectable.',
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
          <span><strong>Introduce ambiguity</strong><small>Conflicting system-parent evidence</small></span>
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
        <article className="tam-passport-card" aria-label="Identity passport for Hospital A">
          <header><span>Identity passport · Synthetic</span><strong>Hospital A</strong><small>One record · complete lineage</small></header>
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

        <aside className={`tam-passport-inspector${isHeld ? ' is-review' : ''}`} key={`${step}-${ambiguous}`}>
          <span>{isHeld ? 'Exception 01' : `Station 0${step + 1}`}</span>
          <h3>{isHeld ? 'The machine refuses the match.' : current.action}</h3>
          <p>{isHeld ? 'Two plausible health-system parents claim DEMO01. Forcing either value would corrupt every downstream company, score, buyer, and audience field.' : current.explanation}</p>
          <div><span>Input</span><strong>{step === 0 ? 'Public source row' : passportStages[step - 1].field}</strong><i aria-hidden="true">→</i><span>Output</span><strong>{isHeld ? 'Review queue' : current.field}</strong></div>
          {isHeld ? <small><strong>Safe behavior:</strong> preserve both candidates, confidence, source lineage, and the unresolved state until a human adjudicates it.</small> : null}
        </aside>
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
