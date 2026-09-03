export type MetricProvenance = 'observed' | 'sampled' | 'unavailable'

export interface Metric {
  label: string
  value: string
  provenance: MetricProvenance
}

export interface EvidenceMedia {
  kind: 'image'
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export interface CaseStudyContent {
  slug: string
  title: string
  problem: string
  summary: string
  metrics: Metric[]
  stages: string[]
  buildLog: string[]
  failures: string[]
  reflection: string
  media?: EvidenceMedia
}

export interface PortfolioContent {
  person: { name: string; email: string; linkedIn: string }
  caseStudies: CaseStudyContent[]
}

export interface ClaySnapshot {
  generatedAt: string
  signals: {
    name: string
    type: string
    status: 'Active' | 'Errored'
    cadence: string
    inputKind: 'table' | 'audience'
  }[]
  function: { name: 'AutoTier'; contract: string }
  workflows: { name: string; nodes: { name: string; type: string }[]; edges: [number, number][] }[]
  aggregates: Record<string, number | Record<string, number>>
}

export interface PublicClaySnapshot {
  signals?: ClaySnapshot['signals']
  function?: ClaySnapshot['function']
  workflows?: ClaySnapshot['workflows']
  aggregates?: ClaySnapshot['aggregates']
}
