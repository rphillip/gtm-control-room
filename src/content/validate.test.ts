import { describe, expect, it } from 'vitest'
import { validatePortfolio } from './validate'

describe('validatePortfolio', () => {
  it('accepts projects with observed metrics and a labeled sample', () => {
    const content = validatePortfolio({
      person: {
        name: 'Ryan Sulapas',
        email: 'ryansulapas@gmail.com',
        linkedIn: 'https://www.linkedin.com/in/ryan-s-75366514/',
      },
      caseStudies: [
        {
          slug: 'signal-engine',
          title: 'Multi-Signal Account Engine',
          summary: 'Turns heterogeneous signals into a ranked account queue.',
          metrics: [{ label: 'High priority', value: '11', provenance: 'observed' }],
          stages: ['Detect', 'Normalize', 'Score'],
          buildLog: ['Joined BLS risk data to account-level intent.'],
          failures: ['1 of 10 sampled AutoTier intent actions errored.'],
          reflection: 'Missing-data behavior belongs in the scoring contract.',
        },
        {
          slug: 'territory-map',
          title: 'Territory Signal Map',
          summary: 'Maps healthcare-market signals to territory priorities.',
          metrics: [{ label: 'Accounts reviewed', value: '8', provenance: 'sampled' }],
          stages: ['Collect', 'Classify', 'Prioritize'],
          buildLog: ['Grouped observed public-market signals by territory.'],
          failures: ['One sampled source needed manual normalization.'],
          reflection: 'Clear source definitions make handoffs reliable.',
        },
      ],
    })

    expect(content.caseStudies[0].metrics[0].provenance).toBe('observed')
  })

  it('rejects private Clay identifiers in public content', () => {
    expect(() => validatePortfolio({ person: {}, caseStudies: [{ slug: 'wf_123' }] })).toThrow(/private identifier/i)
  })
})
