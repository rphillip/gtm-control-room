import type { Metric } from '../content/types'

export function EvidenceMobile({ title, metrics }: { title: string; metrics: Metric[] }) {
  return (
    <figure className="evidence-mobile" aria-label={`${title} evidence mobile`}>
      <figcaption>Observed aggregate evidence; samples are labeled.</figcaption>
      <div className="evidence-mobile__sculpture">
        <span className="evidence-mobile__ceiling" aria-hidden="true" />
        <span className="evidence-mobile__stem" aria-hidden="true" />
        <span className="evidence-mobile__beam evidence-mobile__beam--main" aria-hidden="true" />
        <span className="evidence-mobile__beam evidence-mobile__beam--left" aria-hidden="true" />
        <span className="evidence-mobile__beam evidence-mobile__beam--right" aria-hidden="true" />
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
