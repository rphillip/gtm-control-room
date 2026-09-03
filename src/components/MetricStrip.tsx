import type { Metric } from '../content/types'

export function MetricStrip({ metrics }: { metrics: Metric[] }) {
  return (
    <ul className="metric-strip" aria-label="Selected system evidence">
      {metrics.map((metric) => (
        <li key={`${metric.label}-${metric.value}`} className="metric-strip__item">
          <span className="metric-strip__value">{metric.value}</span>
          <span className="metric-strip__label">{metric.label}</span>
          {metric.provenance === 'sampled' && <span className="provenance">Sampled</span>}
        </li>
      ))}
    </ul>
  )
}
