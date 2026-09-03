import type { MetricProvenance, PortfolioContent } from './types'

const privateId = /\b(?:wf_|wfn_|td_|sig_|t_|f_|wb_|rec_)[A-Za-z0-9_-]+\b/

export function validatePortfolio(value: unknown): PortfolioContent {
  const serialized = JSON.stringify(value)
  if (privateId.test(serialized)) throw new Error('Public content contains a private identifier')
  if (!value || typeof value !== 'object') throw new Error('Portfolio content must be an object')

  const candidate = value as Partial<PortfolioContent>
  if (!candidate.person?.name || !candidate.person.email || !candidate.person.linkedIn) {
    throw new Error('Public identity is incomplete')
  }
  if (!Array.isArray(candidate.caseStudies) || candidate.caseStudies.length < 2) {
    throw new Error('At least two case studies are required')
  }

  for (const study of candidate.caseStudies) {
    if (!study.slug || !study.title || !study.problem || !study.summary || !study.reflection) {
      throw new Error('Case study copy is incomplete')
    }
    if (
      !Array.isArray(study.metrics) ||
      !Array.isArray(study.stages) ||
      !Array.isArray(study.buildLog) ||
      !Array.isArray(study.failures) ||
      study.metrics.length === 0 || study.stages.length === 0 || study.buildLog.length === 0 || study.failures.length === 0
    ) {
      throw new Error('Case study collections are invalid')
    }
    if (!study.metrics.every((metric) => metric && typeof metric.label === 'string' && typeof metric.value === 'string' && (['observed', 'sampled'] as MetricProvenance[]).includes(metric.provenance))) {
      throw new Error('Case study metric provenance is invalid')
    }
    if (study.media && (
      study.media.kind !== 'image' || !/^\/(?!\/)/.test(study.media.src) || study.media.src.includes('..') ||
      !study.media.alt || !study.media.caption ||
      !Number.isInteger(study.media.width) || study.media.width <= 0 ||
      !Number.isInteger(study.media.height) || study.media.height <= 0
    )) throw new Error('Case study media is invalid')
  }

  return candidate as PortfolioContent
}
