import { useState } from 'react'

const dimensions = [
  ['Organization size', 'Count hospital locations'],
  ['Operating footprint', 'Count states'],
  ['Hospital mix', 'Count relevant hospital types'],
  ['Buyer clues', 'Find relevant departments'],
] as const

const sizeOptions = ['1–2 hospitals', '3–9 hospitals', '10+ hospitals'] as const
const stateOptions = ['TX', 'LA', 'OK'] as const
const functionOptions = ['Managed Care', 'Payer Contracting', 'Revenue Cycle', 'Pricing Strategy'] as const

export function ScoreSystemBuilder() {
  const [step, setStep] = useState(0)
  const [systemSize, setSystemSize] = useState<(typeof sizeOptions)[number]>('3–9 hospitals')
  const [states, setStates] = useState<Array<(typeof stateOptions)[number]>>(['TX', 'LA'])
  const [acuteCount, setAcuteCount] = useState(4)
  const [functions, setFunctions] = useState<Array<(typeof functionOptions)[number]>>(['Managed Care'])
  const recommendation = functions.length === 0
    ? { title: 'Research the likely buying team.', detail: 'The organization is resolved, but no relevant department evidence has been selected yet.' }
    : acuteCount === 0
      ? { title: 'Review product fit before outreach.', detail: 'The organization is resolved, but this example has no acute-care hospitals supporting the selected product strategy.' }
      : { title: 'Investigate the account.', detail: 'Validate the buying organization, confirm who owns the problem, and preserve any unresolved evidence.' }

  const toggleState = (state: (typeof stateOptions)[number]) => {
    setStates((current) => current.includes(state) ? current.filter((item) => item !== state) : [...current, state])
  }
  const toggleFunction = (name: (typeof functionOptions)[number]) => {
    setFunctions((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }
  const reset = () => {
    setSystemSize('3–9 hospitals')
    setStates(['TX', 'LA'])
    setAcuteCount(4)
    setFunctions(['Managed Care'])
    setStep(0)
  }

  return (
    <div className="tam-score-builder" data-step={step}>
      <nav className="tam-score-builder__track" aria-label="Account brief stations">
        <span className="tam-score-builder__track-line" aria-hidden="true" />
        <span className="tam-score-builder__data-ball" aria-hidden="true" />
        {dimensions.map(([name, instruction], index) => (
          <button
            key={name}
            type="button"
            disabled={index > step}
            aria-current={index === step ? 'step' : undefined}
            onClick={() => setStep(index)}
          >
            <span>0{index + 1}</span><strong>{name}</strong><small>{instruction}</small>
          </button>
        ))}
        <span className="tam-score-builder__printer" aria-hidden="true">Brief</span>
      </nav>

      {step === 0 ? (
        <section className="tam-score-station" aria-labelledby="score-size-title">
          <header><span>Station 01</span><h3 id="score-size-title">How large is the resolved organization?</h3><p>Count hospital locations only after confirming that they belong to the same organization.</p></header>
          <div className="tam-score-station__body">
            <fieldset className="tam-score-choices"><legend>Choose a hospital-count tier</legend>{sizeOptions.map((option) => <label key={option}><input type="radio" name="system-size" checked={systemSize === option} onChange={() => setSystemSize(option)} /><span>{option}</span></label>)}</fieldset>
            <div className={`tam-builder-machine tam-builder-machine--size tam-builder-machine--size-${sizeOptions.indexOf(systemSize) + 1}`} key={systemSize} aria-hidden="true">
              <span className="tam-builder-machine__rail" /><i className="tam-builder-machine__ball" />
              {sizeOptions.map((option) => <b className={systemSize === option ? 'is-selected' : ''} key={option}>{option.replace(' hospitals', '')}</b>)}
              <small>The ball climbs to the selected system-size tier.</small>
            </div>
          </div>
          <button className="tam-score-station__advance" type="button" onClick={() => setStep(1)}>Set organization size and roll onward →</button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="tam-score-station" aria-labelledby="score-geography-title">
          <header><span>Station 02</span><h3 id="score-geography-title">How many states does this organization operate in?</h3><p>Operating across more states can create additional contracting, regulatory, and organizational complexity.</p></header>
          <div className="tam-score-station__body">
            <fieldset className="tam-score-choices"><legend>Select the states in this synthetic system</legend>{stateOptions.map((state) => <label key={state}><input type="checkbox" checked={states.includes(state)} onChange={() => toggleState(state)} /><span>{state}</span></label>)}</fieldset>
            <div className={`tam-builder-machine tam-builder-machine--geography tam-builder-machine--states-${states.length}`} key={states.join('-')} aria-hidden="true">
              <span className="tam-builder-machine__rail" /><i className="tam-builder-machine__ball" />
              {stateOptions.map((state) => <b className={states.includes(state) ? 'is-selected' : ''} key={state}>{state}</b>)}
              <small>Each selected state extends another bridge.</small>
            </div>
          </div>
          <button className="tam-score-station__advance" type="button" disabled={states.length === 0} onClick={() => setStep(2)}>Set operating footprint and roll onward →</button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="tam-score-station" aria-labelledby="score-facility-title">
          <header><span>Station 03</span><h3 id="score-facility-title">How many acute-care hospitals support this product strategy?</h3><p>This example counts the hospital type relevant to the product while preserving other types for review.</p></header>
          <div className="tam-score-station__body">
            <label className="tam-score-range"><span>Acute-care hospital count <strong>{acuteCount}</strong></span><input type="range" min="0" max="10" value={acuteCount} onChange={(event) => setAcuteCount(Number(event.target.value))} /></label>
            <div className="tam-builder-machine tam-builder-machine--facility" key={acuteCount} aria-hidden="true">
              <span className="tam-builder-machine__rail" /><i className="tam-builder-machine__ball" />
              <b>Acute</b><span className="tam-builder-machine__count">+{acuteCount}</span><span className="tam-builder-machine__review">Other<br />review</span>
              <small>The gate routes acute care to the count and preserves other types for review.</small>
            </div>
          </div>
          <button className="tam-score-station__advance" type="button" onClick={() => setStep(3)}>Set hospital mix and roll onward →</button>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="tam-score-station" aria-labelledby="score-function-title">
          <header><span>Station 04</span><h3 id="score-function-title">Which departments offer clues about the buying team?</h3><p>Observed roles suggest where to investigate. They do not prove authority, budget, or an intention to buy.</p></header>
          <div className="tam-score-station__body">
            <fieldset className="tam-score-choices tam-score-choices--functions"><legend>Select the evidence found</legend>{functionOptions.map((name) => <label key={name}><input type="checkbox" checked={functions.includes(name)} onChange={() => toggleFunction(name)} /><span>{name}</span></label>)}</fieldset>
            <div className="tam-builder-machine tam-builder-machine--function" key={functions.join('-')} aria-hidden="true">
              <span className="tam-builder-machine__rail" /><i className="tam-builder-machine__ball" />
              {functionOptions.map((name) => <b className={functions.includes(name) ? 'is-selected' : ''} key={name}>{name.split(' ').map((word) => word[0]).join('')}</b>)}
              <small>Selected evidence tabs attach to the account profile.</small>
            </div>
          </div>
          <button className="tam-score-station__advance" type="button" onClick={() => setStep(4)}>Print the account brief →</button>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="tam-score-result" aria-labelledby="score-result-title">
          <div><span>Synthetic account brief</span><h3 id="score-result-title">Example Health</h3><small>Research summary · not a purchase prediction</small></div>
          <dl>
            <div><dt>Organization size</dt><dd>{systemSize}</dd></div>
            <div><dt>Operating footprint</dt><dd>{states.length} {states.length === 1 ? 'state' : 'states'} · {states.join(' · ') || 'None selected'}</dd></div>
            <div><dt>Hospital mix</dt><dd>{acuteCount} acute-care {acuteCount === 1 ? 'hospital' : 'hospitals'}</dd></div>
            <div><dt>Buyer clues</dt><dd>{functions.length > 0 ? functions.join(' · ') : 'No department evidence selected'}</dd></div>
          </dl>
          <p><strong>Recommended next step: {recommendation.title}</strong> {recommendation.detail}</p>
          <button type="button" onClick={reset}>Reset the machine</button>
        </section>
      ) : null}

      <p className="visually-hidden" role="status" aria-live="polite">{step < 4 ? `Account brief station ${step + 1} of 4: ${dimensions[step][0]}.` : `Account brief ready. Recommended next step: ${recommendation.title}`}</p>
    </div>
  )
}
