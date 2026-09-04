import type { Metric } from '../content/types'

export function MetricStrip({ metrics, showProvenanceNote = true }: { metrics: Metric[]; showProvenanceNote?: boolean }) {
  const hasUnavailable = metrics.some((metric) => metric.provenance === 'unavailable')
  return (
    <ul className="metric-strip" aria-label="Selected system evidence">
      {showProvenanceNote && <li className="metric-strip__provenance-note">{hasUnavailable ? 'Unavailable means the sanitized snapshot did not provide this dynamic field.' : 'Observed aggregate evidence; samples are labeled.'}</li>}
      {metrics.map((metric) => (
        <li key={`${metric.label}-${metric.value}`} className="metric-strip__item">
          <span className="metric-strip__value">{metric.value}</span>
          <span className="metric-strip__label">{metric.label}</span>
          {metric.provenance !== 'observed' && <span className="provenance">{metric.provenance}</span>}
        </li>
      ))}
    </ul>
  )
}
