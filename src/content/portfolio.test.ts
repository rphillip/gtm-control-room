import { describe, expect, it } from 'vitest'

import { portfolioWithSnapshot } from './portfolio'

describe('portfolioWithSnapshot', () => {
  it('derives sampled action and campaign case-study telemetry from consistent snapshot counts', () => {
    const content = portfolioWithSnapshot({
      aggregates: {
        sampledActionHealth: { sampled: 10, succeeded: 8, errored: 2 },
        campaigns: 3,
      },
    })

    expect(content.caseStudies[0].metrics.find((metric) => metric.label === 'Sampled action health')).toEqual({
      label: 'Sampled action health', value: '8 / 10 succeeded · 2 errored', provenance: 'sampled',
    })
    expect(content.caseStudies[2].metrics.find((metric) => metric.label === 'Campaigns in this workspace')).toEqual({
      label: 'Campaigns in this workspace', value: '3', provenance: 'observed',
    })
  })

  it('marks malformed or absent dynamic case-study telemetry unavailable', () => {
    const content = portfolioWithSnapshot({
      aggregates: {
        sampledActionHealth: { sampled: 10, succeeded: 9, errored: 2 },
      },
    })

    expect(content.caseStudies[0].metrics.find((metric) => metric.label === 'Sampled action health')?.provenance).toBe('unavailable')
    expect(content.caseStudies[2].metrics.find((metric) => metric.label === 'Campaigns in this workspace')?.provenance).toBe('unavailable')
  })
})
