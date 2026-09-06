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
  { value: 'observed', label: 'Observed' },
  { value: 'missing', label: 'Missing' },
  { value: 'conflicting', label: 'Conflicting' },
]

const outcomeLabels: Record<Outcome, string> = {
  include: 'Include in this audience',
  review: 'Hold for review',
  outside: 'Outside this thesis',
}

function classifyAccount(thesis: Thesis, facility: FacilityType, ownership: Ownership, evidence: Evidence): { outcome: Outcome; reason: string } {
  if (evidence === 'conflicting') return {
    outcome: 'review',
    reason: 'The evidence conflicts. Preserve both claims and send the account to review instead of forcing a commercial decision.',
  }
  if (evidence === 'missing') return {
    outcome: 'review',
    reason: 'The thesis-relevant evidence is missing. Missing evidence is a research task—not proof that the account is a poor fit.',
  }
  if (ownership === 'federal') return thesis === 'payer'
    ? { outcome: 'outside', reason: 'Federal procurement sits outside this commercial-payer motion. The account may be valid, but not for this thesis.' }
    : { outcome: 'review', reason: 'The facility matches the rural-care context, but federal ownership requires a separate procurement review.' }
  if (thesis === 'payer') return facility === 'acute' || facility === 'psychiatric'
    ? { outcome: 'include', reason: 'The resolved account has a relevant facility profile and observed commercial-payer complexity for this motion.' }
    : { outcome: 'review', reason: 'The account may fit, but its facility profile needs validation before entering this commercial-payer audience.' }
  return facility === 'critical' || facility === 'rural'
    ? { outcome: 'include', reason: 'The facility profile and observed rural-care operating evidence align with this motion.' }
    : { outcome: 'outside', reason: 'This account does not match the rural-care operating thesis. That does not make it a universally bad account.' }
}

export function ThesisCalibrationMachine() {
  const [thesis, setThesis] = useState<Thesis>('payer')
  const [facility, setFacility] = useState<FacilityType>('acute')
  const [ownership, setOwnership] = useState<Ownership>('nonprofit')
  const [evidence, setEvidence] = useState<Evidence>('observed')
  const [revision, setRevision] = useState(0)
  const decision = classifyAccount(thesis, facility, ownership, evidence)
  const evidenceLabel = thesis === 'payer' ? 'Commercial-payer complexity' : 'Rural-care operating evidence'

  const rerun = (update: () => void) => {
    update()
    setRevision((current) => current + 1)
  }

  return (
    <div className="tam-thesis-machine" data-outcome={decision.outcome}>
      <header className="tam-thesis-machine__header">
        <div><span>Resolved account · Synthetic</span><strong>Example Health</strong></div>
        <label className="tam-thesis-switch">
          <span><small>Commercial thesis</small><strong>{thesis === 'payer' ? 'Pricing + payer contracting' : 'Rural-care operations'}</strong></span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Change commercial thesis"
            checked={thesis === 'rural'}
            onChange={(event) => rerun(() => setThesis(event.target.checked ? 'rural' : 'payer'))}
          />
          <i aria-hidden="true"><b>P</b><b>R</b></i>
        </label>
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

        <div className="tam-thesis-gate tam-thesis-gate--facility"><span>01</span><strong>Facility type</strong><i><b /><b /><b /><b /></i><small>{facilityOptions.find((option) => option.value === facility)?.label}</small></div>
        <div className="tam-thesis-gate tam-thesis-gate--ownership"><span>02</span><strong>Ownership</strong><i><b /></i><small>{ownershipOptions.find((option) => option.value === ownership)?.label}</small></div>
        <div className="tam-thesis-gate tam-thesis-gate--evidence"><span>03</span><strong>Evidence</strong><i><b /></i><small>{evidenceOptions.find((option) => option.value === evidence)?.label}</small></div>

        <div className="tam-thesis-trays">
          <span className={decision.outcome === 'include' ? 'is-active' : ''}>Include</span>
          <span className={decision.outcome === 'review' ? 'is-active' : ''}>Review</span>
          <span className={decision.outcome === 'outside' ? 'is-active' : ''}>Outside</span>
        </div>
      </div>

      <div className="tam-thesis-controls">
        <fieldset><legend>Facility type gate</legend><select aria-label="Facility type" value={facility} onChange={(event) => rerun(() => setFacility(event.target.value as FacilityType))}>{facilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>What kind of care setting anchors the account?</small></fieldset>
        <fieldset><legend>Ownership lever</legend><select aria-label="Ownership" value={ownership} onChange={(event) => rerun(() => setOwnership(event.target.value as Ownership))}>{ownershipOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>What procurement context changes the motion?</small></fieldset>
        <fieldset><legend>Evidence gauge</legend><select aria-label={evidenceLabel} value={evidence} onChange={(event) => rerun(() => setEvidence(event.target.value as Evidence))}>{evidenceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>{evidenceLabel}</small></fieldset>
      </div>

      <aside className="tam-thesis-result" key={`${revision}-${decision.outcome}`}>
        <span>Routing result · illustrative policy</span>
        <h3>{outcomeLabels[decision.outcome]}</h3>
        <p>{decision.reason}</p>
        <small><strong>Why this matters:</strong> the account did not change. The commercial thesis and available evidence determined its route.</small>
      </aside>

      <p className="visually-hidden" role="status" aria-live="polite">Example Health is routed to {outcomeLabels[decision.outcome].toLowerCase()}. {decision.reason}</p>
    </div>
  )
}
