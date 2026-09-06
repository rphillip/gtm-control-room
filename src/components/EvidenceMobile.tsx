import type { Metric } from '../content/types'

export type EvidenceMobileVariant = 'multi-signal-account-engine' | 'healthcare-market-map' | 'activation-workflows'

const behaviorLabels: Record<EvidenceMobileVariant, string> = {
  'multi-signal-account-engine': 'Evidence in balance: fit, timing, and priority reweight one another.',
  'healthcare-market-map': 'Evidence in orbit: facilities resolve into systems and corporate parents.',
  'activation-workflows': 'Evidence at the switch: qualified work follows an explicit branch.',
}

export function EvidenceMobile({ title, metrics, variant = 'multi-signal-account-engine' }: {
  title: string
  metrics: Metric[]
  variant?: EvidenceMobileVariant
}) {
  return (
    <figure className="evidence-mobile" data-mobile-variant={variant} aria-label={`${title} evidence mobile`}>
      <figcaption>{behaviorLabels[variant]}</figcaption>
      <div className="evidence-mobile__sculpture">
        <span className="evidence-mobile__ceiling" aria-hidden="true" />
        <span className="evidence-mobile__stem" aria-hidden="true" />
        <span className="evidence-mobile__beam evidence-mobile__beam--main" aria-hidden="true" />
        <span className="evidence-mobile__beam evidence-mobile__beam--left" aria-hidden="true" />
        <span className="evidence-mobile__beam evidence-mobile__beam--right" aria-hidden="true" />
        <span className="evidence-mobile__orbit" aria-hidden="true" />
        <span className="evidence-mobile__switch-pin" aria-hidden="true" />
        <ul>
          {metrics.map((metric, index) => (
            <li className={`evidence-mobile__node evidence-mobile__node--${index + 1}`} data-mobile-node key={metric.label}>
              <span className="evidence-mobile__wire" aria-hidden="true" />
              <span className="evidence-mobile__counterweight" aria-hidden="true" />
              <span className="evidence-mobile__plaque">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.provenance}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
