import type { ClaySnapshot, Metric, PortfolioContent } from './types'
import { validatePortfolio } from './validate'

export const hero = {
  eyebrow: 'Ryan Sulapas · Healthcare GTM data systems',
  title: 'Healthcare GTM problems are usually data problems first.',
  lede:
    'I build the signals, models, integrations, and automation that turn fragmented healthcare data into action.',
}

export const portfolio: PortfolioContent = validatePortfolio({
  person: {
    name: 'Ryan Sulapas',
    email: 'ryansulapas@gmail.com',
    linkedIn: 'https://www.linkedin.com/in/ryan-s-75366514/',
  },
  caseStudies: [
    {
      slug: 'multi-signal-account-engine',
      title: 'Multi-Signal Account Engine',
      summary:
        'A reusable account-prioritization system that turns fit, timing, feedback, and risk signals into an observable queue.',
      metrics: [
        { label: 'Scored accounts', value: '60', provenance: 'observed' },
        { label: 'New-hire events', value: '27', provenance: 'observed' },
        { label: 'Sampled action health', value: '9 / 10 succeeded', provenance: 'sampled' },
      ],
      stages: ['Normalize identity', 'Detect signals', 'Tier dimensions', 'Write composite score'],
      buildLog: [
        'Joined company identity with new-hire, job-posting, intent, feedback, and BLS injury-rate data.',
        'Applied AutoTier to each reusable scoring dimension before writing a composite priority.',
      ],
      failures: ['One AutoTier intent action errored in a ten-row health sample.'],
      reflection:
        'Missing-data behavior and action health belong in the scoring contract; a green pipeline can still quietly misprioritize accounts.',
    },
    {
      slug: 'healthcare-market-map',
      title: 'Healthcare Market Map',
      summary:
        'An entity-resolution layer for connecting facilities, health systems, corporate parents, and healthcare-market attributes.',
      metrics: [
        { label: 'CMS facility rows at ingestion', value: '5,419', provenance: 'observed' },
        { label: 'Health-system working rows', value: '922', provenance: 'observed' },
        { label: 'Rows without lookup in sample', value: '2 / 10', provenance: 'sampled' },
      ],
      stages: ['Import facilities', 'Resolve systems', 'Join CHSP attributes', 'Score and segment'],
      buildLog: [
        'Imported CMS facilities and joined health-system and corporate-parent identity.',
        'Matched the working layer against CHSP measures before deriving fit and scale scores.',
      ],
      failures: ['Two CMS rows lacked a health-system lookup in a ten-row sample.'],
      reflection:
        'Facility-to-system ambiguity and duplicate company matches are first-class states, not cleanup details hidden downstream.',
    },
    {
      slug: 'activation-workflows',
      title: 'Activation Workflows',
      summary:
        'Safe routing from scored audiences into repeatable research and prepared activation outputs.',
      metrics: [
        { label: 'Identifier-safe workflow nodes', value: '5', provenance: 'observed' },
        { label: 'Research-to-writing workflow nodes', value: '4', provenance: 'observed' },
        { label: 'Campaigns shipped', value: '0', provenance: 'observed' },
      ],
      stages: ['Select segment', 'Check identifier', 'Research', 'Write', 'Persist'],
      buildLog: [
        'Routed missing company identifiers to an explicit marked state before contact finding.',
        'Saved public-professional research and a contextual message back to the audience record.',
      ],
      failures: ['Campaign execution is intentionally absent: the workspace currently contains zero Campaigns.'],
      reflection:
        'A missing-identifier branch is a product decision. Activation is only honest when incomplete inputs remain visible.',
    },
  ],
})

export const heroMetrics: Metric[] = [
  { label: 'Cloud data engineering', value: '4+ years', provenance: 'observed' },
  { label: 'Healthcare systems', value: '3', provenance: 'observed' },
  { label: 'Campaigns shipped', value: '0 · activation next', provenance: 'observed' },
]

export function snapshotMetrics(snapshot: ClaySnapshot): Metric[] {
  return [
    { label: 'Signals active', value: String(snapshot.aggregates.signalsActive), provenance: 'observed' },
    { label: 'Account engine', value: `${snapshot.aggregates.scoredAccounts} scored`, provenance: 'observed' },
    { label: 'Sampled action health', value: '9 / 10 succeeded', provenance: 'sampled' },
  ]
}
