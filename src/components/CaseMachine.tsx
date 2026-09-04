import type { CaseStudyContent } from '../content/types'
import { useRef } from 'react'
import { caseMachineProfiles, useMatterMachine } from '../hooks/useMatterMachine'

function AccountMachine() {
  return (
    <svg className="case-machine__diagram" viewBox="0 0 900 300" aria-hidden="true">
      <g className="case-machine__ink">
        <path d="M55 82h128l44 47h108l49 75h135l55-104h127l45 52h118" />
        <path d="M54 100h102l42 48m146 56v52h161v-52m137-104v106h150" />
        <path d="M202 80h82l-28 53v48l-26 15v-63z" />
        <g className="case-machine__account-scale">
          <path d="M428 139v92m-52-64h104M394 167l-25 45h50zm68 0-25 45h50zM401 235h54" />
        </g>
        <g className="case-machine__account-queue">
          <rect x="625" y="104" width="132" height="102" />
          <path d="M641 129h91m-91 26h73m-73 26h101" />
        </g>
        <path d="M92 61v42m22-42v42m22-42v42" />
      </g>
      <g className="case-machine__red"><circle cx="92" cy="61" r="7"/><circle cx="114" cy="61" r="7"/><circle cx="136" cy="61" r="7"/></g>
      <g className="case-machine__blue"><path d="M641 129h91"/><path d="M230 133h26"/></g>
      <circle className="case-machine__ball" data-case-ball data-physics-ball aria-hidden="true" cx="55" cy="100" r="10" />
      <text x="64" y="270">SIGNALS</text><text x="205" y="270">NORMALIZE</text><text x="390" y="270">WEIGH</text><text x="638" y="270">QUEUE</text>
    </svg>
  )
}

function MarketMachine() {
  return (
    <svg className="case-machine__diagram" viewBox="0 0 900 300" aria-hidden="true">
      <g className="case-machine__ink">
        <path d="M48 151h140l62-73h117l76 73h123l56-62h140l79 62h61" />
        <path d="M83 110v82m34-108v108m34-57v57" />
        <g className="case-machine__market-join">
          <circle cx="307" cy="151" r="57"/><path d="M277 122l60 58m0-58-60 58"/><circle cx="307" cy="151" r="15"/>
        </g>
        <g className="case-machine__market-system">
          <path d="M510 127v66m-34-43h68m-58-24 24-20 24 20" />
          <circle cx="476" cy="210" r="10"/><circle cx="510" cy="210" r="10"/><circle cx="544" cy="210" r="10"/>
        </g>
        <g className="case-machine__market-map">
          <rect x="650" y="104" width="128" height="100"/><path d="M674 125l35 18 40-22m-75 58 35-36 40 41"/>
        </g>
      </g>
      <g className="case-machine__red"><circle cx="83" cy="110" r="7"/><circle cx="117" cy="84" r="7"/><circle cx="151" cy="135" r="7"/></g>
      <g className="case-machine__blue"><circle cx="307" cy="151" r="8"/><path d="M674 125l35 18 40-22"/></g>
      <circle className="case-machine__ball" data-case-ball data-physics-ball aria-hidden="true" cx="48" cy="151" r="10" />
      <text x="65" y="260">FACILITIES</text><text x="274" y="260">RESOLVE</text><text x="468" y="260">PARENT</text><text x="674" y="260">MAP</text>
    </svg>
  )
}

function ActivationMachine() {
  return (
    <svg className="case-machine__diagram" viewBox="0 0 900 300" aria-hidden="true">
      <g className="case-machine__ink">
        <path d="M50 150h170l75-62h135l64 62h102m0 0 73-65h92m-165 65 73 65h92m0-130h91m-91 130h91" />
        <g className="case-machine__activation-score"><rect x="78" y="103" width="105" height="94"/><path d="M96 126h69m-69 24h50m-50 24h61"/></g>
        <g className="case-machine__activation-switch"><circle cx="430" cy="150" r="42"/><path d="M403 150h29l24-24m-24 24 24 24"/></g>
        <g className="case-machine__activation-envelope"><rect x="690" y="49" width="105" height="72"/><path d="m692 52 50 39 51-39"/></g>
        <g className="case-machine__activation-bin"><rect x="690" y="185" width="105" height="67"/><path d="M677 185h131m-97-21h63"/></g>
      </g>
      <g className="case-machine__red"><path d="M96 126h69"/><circle cx="430" cy="150" r="8"/></g>
      <g className="case-machine__blue"><path d="M692 52l50 39 51-39"/><path d="M677 185h131"/></g>
      <circle className="case-machine__ball" data-case-ball data-physics-ball aria-hidden="true" cx="50" cy="150" r="10" />
      <text x="92" y="270">SEGMENT</text><text x="390" y="270">CHECK ID</text><text x="692" y="145">PREPARE</text><text x="699" y="278">REVIEW</text>
    </svg>
  )
}

const machineBySlug = {
  'multi-signal-account-engine': AccountMachine,
  'healthcare-market-map': MarketMachine,
  'activation-workflows': ActivationMachine,
} as const

export function CaseMachine({ study }: { study: CaseStudyContent }) {
  const machineRef = useRef<HTMLElement>(null)
  const Machine = machineBySlug[study.slug as keyof typeof machineBySlug] ?? AccountMachine
  const physicsProfile = caseMachineProfiles[study.slug] ?? caseMachineProfiles['multi-signal-account-engine']
  useMatterMachine(machineRef, physicsProfile)

  return (
    <figure ref={machineRef} className={`case-machine case-machine--${study.slug}`} aria-label={`${study.title} animated system machine`} data-machine={study.slug} data-physics-engine="matter-js">
      <div className="case-machine__canvas">
        <Machine />
        <div className="case-machine__hotspots">
          {study.metrics.map((metric, index) => {
            const descriptionId = `${study.slug}-metric-${index}`
            return (
              <button
                key={metric.label}
                className="case-machine__hotspot"
                type="button"
                aria-label={`Evidence: ${metric.value} ${metric.label}`}
                aria-describedby={descriptionId}
              >
                <span aria-hidden="true">{index + 1}</span>
                <span className="case-machine__tooltip" id={descriptionId}>
                  <strong>{metric.value}</strong>{metric.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <figcaption className="case-machine__caption">
        <p className="eyebrow">Observed aggregate evidence · samples are labeled</p>
        <dl>
          {study.metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
              <span className="provenance">{metric.provenance}</span>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  )
}
