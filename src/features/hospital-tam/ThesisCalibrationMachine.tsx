import { useState } from 'react'

type Thesis = 'payer' | 'rural'
type FacilityType = 'acute' | 'critical' | 'psychiatric' | 'rural'
type Ownership = 'nonprofit' | 'proprietary' | 'government' | 'federal'
type Evidence = 'observed' | 'missing' | 'conflicting'
type Outcome = 'include' | 'review' | 'outside'

const facilityOptions: Array<{ value: FacilityType; label: string }> = [
  { value: 'acute', label: 'Acute care' },
  { value: 'critical', label: 'Critical access' },
  { value: 'psychiatric', label: 'Psychiatric' },
  { value: 'rural', label: 'Rural emergency' },
]

const ownershipOptions: Array<{ value: Ownership; label: string }> = [
  { value: 'nonprofit', label: 'Voluntary nonprofit' },
  { value: 'proprietary', label: 'Proprietary' },
  { value: 'government', label: 'District / government' },
  { value: 'federal', label: 'Federal / VA / military' },
]

const evidenceOptions: Array<{ value: Evidence; label: string }> = [
  { value: 'observed', label: 'Observed — a source supports it' },
  { value: 'missing', label: 'Missing — no reliable source found' },
  { value: 'conflicting', label: 'Conflicting — sources disagree' },
]

const outcomeLabels: Record<Outcome, string> = {
  include: 'Include for investigation',
  review: 'Needs human review',
  outside: 'Not a fit for this product strategy',
}

function classifyAccount(thesis: Thesis, facility: FacilityType, ownership: Ownership, evidence: Evidence): { outcome: Outcome; reason: string } {
  if (evidence === 'conflicting') return {
    outcome: 'review',
    reason: 'Reliable sources disagree. Keep both claims and send the account to a person instead of forcing a commercial decision.',
  }
  if (evidence === 'missing') return {
    outcome: 'review',
    reason: 'The product-relevant evidence is missing. Missing information creates a research task—not proof that the account is a poor fit.',
  }
  if (ownership === 'federal') return thesis === 'payer'
    ? { outcome: 'outside', reason: 'Federal purchasing follows a different process from this commercial-insurance strategy. The account may be valid, but not for this product approach.' }
    : { outcome: 'review', reason: 'The hospital matches the rural-care context, but federal ownership requires a separate purchasing review.' }
  if (thesis === 'payer') return facility === 'acute' || facility === 'psychiatric'
    ? { outcome: 'include', reason: 'The organization has a relevant hospital profile and a reliable source supports the insurance-contracting evidence.' }
    : { outcome: 'review', reason: 'The organization may fit, but its hospital profile needs validation before a seller investigates it.' }
  return facility === 'critical' || facility === 'rural'
    ? { outcome: 'include', reason: 'The hospital profile and supported rural-care evidence fit this product strategy.' }
    : { outcome: 'outside', reason: 'This organization does not match the rural-care product strategy. That does not make it a universally bad account.' }
}

export function ThesisCalibrationMachine() {
  const [thesis, setThesis] = useState<Thesis>('payer')
  const [facility, setFacility] = useState<FacilityType>('acute')
  const [ownership, setOwnership] = useState<Ownership>('nonprofit')
  const [evidence, setEvidence] = useState<Evidence>('observed')
  const [revision, setRevision] = useState(0)
  const decision = classifyAccount(thesis, facility, ownership, evidence)
  const evidenceLabel = thesis === 'payer' ? 'Insurance-contracting complexity' : 'Rural-care operating evidence'

  const rerun = (update: () => void) => {
    update()
    setRevision((current) => current + 1)
  }

  return (
    <div className="tam-thesis-machine" data-outcome={decision.outcome}>
      <header className="tam-thesis-machine__header">
        <div><span>Resolved account · Synthetic</span><strong>Example Health</strong></div>
        <fieldset className="tam-thesis-selector">
          <legend>GTM thesis</legend>
          <label className={thesis === 'payer' ? 'is-selected' : ''}>
            <input type="radio" name="gtm-thesis" value="payer" checked={thesis === 'payer'} onChange={() => rerun(() => setThesis('payer'))} />
            <span><strong>Pricing + insurance contracting</strong><small>Prioritize organizations managing complex insurer relationships</small></span>
          </label>
          <label className={thesis === 'rural' ? 'is-selected' : ''}>
            <input type="radio" name="gtm-thesis" value="rural" checked={thesis === 'rural'} onChange={() => rerun(() => setThesis('rural'))} />
            <span><strong>Rural-care operations</strong><small>Compare an alternate product strategy focused on rural delivery</small></span>
          </label>
        </fieldset>
      </header>

      <div
        className="tam-thesis-machine__run"
        key={revision}
        data-facility={facility}
        data-ownership={ownership}
        data-evidence={evidence}
        aria-hidden="true"
      >
        <span className="tam-thesis-machine__rail" />
        <i className="tam-thesis-machine__ball" />

        <div className="tam-thesis-gate tam-thesis-gate--facility"><span>01</span><strong>Hospital type</strong><i><b /><b /><b /><b /></i><small>{facilityOptions.find((option) => option.value === facility)?.label}</small></div>
        <div className="tam-thesis-gate tam-thesis-gate--ownership"><span>02</span><strong>Ownership context</strong><i><b /></i><small>{ownershipOptions.find((option) => option.value === ownership)?.label}</small></div>
        <div className="tam-thesis-gate tam-thesis-gate--evidence"><span>03</span><strong>Supporting evidence</strong><i><b /></i><small>{evidenceOptions.find((option) => option.value === evidence)?.label}</small></div>

        <div className="tam-thesis-trays">
          <span className={decision.outcome === 'include' ? 'is-active' : ''}>Include</span>
          <span className={decision.outcome === 'review' ? 'is-active' : ''}>Review</span>
          <span className={decision.outcome === 'outside' ? 'is-active' : ''}>Outside</span>
        </div>
      </div>

      <div className="tam-thesis-controls">
        <fieldset><legend>Hospital type gate</legend><select aria-label="Hospital type" value={facility} onChange={(event) => rerun(() => setFacility(event.target.value as FacilityType))}>{facilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>What kind of care does this hospital provide?</small></fieldset>
        <fieldset><legend>Ownership lever</legend><select aria-label="Ownership context" value={ownership} onChange={(event) => rerun(() => setOwnership(event.target.value as Ownership))}>{ownershipOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>Who owns it, and what purchasing process could that create?</small></fieldset>
        <fieldset><legend>Evidence gauge</legend><select aria-label={evidenceLabel} value={evidence} onChange={(event) => rerun(() => setEvidence(event.target.value as Evidence))}>{evidenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>Do reliable sources support the product-relevant claim?</small></fieldset>
      </div>

      <aside className="tam-thesis-result" key={`${revision}-${decision.outcome}`}>
        <span>Routing result · illustrative policy</span>
        <h3>{outcomeLabels[decision.outcome]}</h3>
        <p>{decision.reason}</p>
        <small><strong>Why this matters:</strong> the organization did not change. The product strategy and available evidence determined what a seller should do next.</small>
      </aside>

      <p className="visually-hidden" role="status" aria-live="polite">Example Health is routed to {outcomeLabels[decision.outcome].toLowerCase()}. {decision.reason}</p>
    </div>
  )
}
