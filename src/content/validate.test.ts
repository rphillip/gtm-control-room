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
          problem: 'The signal mix could not be ranked reliably.',
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
          problem: 'Healthcare market signals did not share a stable entity key.',
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

  it('rejects incomplete case studies, invalid metric provenance, and unsafe media paths', () => {
    const base = {
      person: { name: 'Ryan', email: 'ryan@example.com', linkedIn: 'https://www.linkedin.com/in/ryan' },
      caseStudies: [
        { slug: 'one', title: 'One', problem: 'Problem', summary: 'Summary', metrics: [{ label: 'Metric', value: '1', provenance: 'observed' }], stages: ['Stage'], buildLog: ['Build'], failures: ['Failure'], reflection: 'Reflection' },
        { slug: 'two', title: 'Two', problem: 'Problem', summary: 'Summary', metrics: [{ label: 'Metric', value: '1', provenance: 'observed' }], stages: ['Stage'], buildLog: ['Build'], failures: ['Failure'], reflection: 'Reflection' },
      ],
    }

    expect(() => validatePortfolio({ ...base, caseStudies: [{ ...base.caseStudies[0], problem: '' }, base.caseStudies[1]] })).toThrow(/incomplete/i)
    expect(() => validatePortfolio({ ...base, caseStudies: [{ ...base.caseStudies[0], metrics: [{ label: 'Metric', value: '1', provenance: 'estimated' }] }, base.caseStudies[1]] })).toThrow(/metric/i)
    expect(() => validatePortfolio({ ...base, caseStudies: [{ ...base.caseStudies[0], media: { kind: 'image', src: 'https://example.com/evidence.png', alt: 'Evidence', caption: 'Caption' } }, base.caseStudies[1]] })).toThrow(/media/i)
  })
})
