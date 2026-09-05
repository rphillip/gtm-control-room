import type { Metric, PortfolioContent, PublicClaySnapshot } from './types'
import { validatePortfolio } from './validate'

export const hero = {
  eyebrow: 'Ryan Sulapas · Healthcare GTM data systems',
  title: 'Healthcare GTM problems are usually data problems first.',
  lede:
    'I build the signals, models, integrations, and automation that turn fragmented healthcare data into qualified accounts and reliable GTM action.',
  proof: 'Data-native GTM engineering, backed by 4+ years building production cloud data systems across startup and digital-health teams.',
}

const caseStudyTitles = [
  'Multi-Signal Account Engine',
  'Healthcare Market Map',
  'Activation Workflows',
] as const

export const portfolio: PortfolioContent = validatePortfolio({
  person: {
    name: 'Ryan Sulapas',
    email: 'ryansulapas@gmail.com',
    linkedIn: 'https://www.linkedin.com/in/ryan-s-75366514/',
  },
  caseStudies: [
    {
      slug: 'multi-signal-account-engine',
      title: caseStudyTitles[0],
      problem: 'A static construction account list could not distinguish durable fit from timely reasons to engage.',
      summary:
        'A reusable prioritization system that combines fit, timing, feedback, and risk signals into an observable account queue.',
      metrics: [
        { label: 'Scored accounts', value: '60', provenance: 'observed' },
        { label: 'New-hire events', value: '27', provenance: 'observed' },
        { label: 'High score tier', value: '11', provenance: 'observed' },
        { label: 'Medium / low score tiers', value: '40 / 9', provenance: 'observed' },
        { label: 'Intent tiers · high / medium / low / without tier', value: '9 / 37 / 7 / 7', provenance: 'observed' },
        { label: 'Injury tiers · high / medium / low', value: '20 / 12 / 28', provenance: 'observed' },
        { label: 'Sampled action health', value: 'Unavailable', provenance: 'unavailable' },
      ],
      stages: ['Normalize identity', 'Detect signals', 'Join BLS + feedback', 'AutoTier dimensions', 'Write composite score'],
      media: {
        kind: 'image',
        src: '/evidence/multi-signal-account-engine.svg',
        alt: 'Sanitized schematic showing public signals normalized, tiered, scored, and routed to an observable account queue with a failure rail.',
        caption: 'Sanitized system schematic—not a workspace screenshot. It shows the observed architecture without source rows, contact data, or private workspace identifiers.',
        width: 960,
        height: 420,
      },
      buildLog: [
        'Made company identity and domain the join contract across account and event sources.',
        'Combined hiring, intent, feedback, and industry-risk evidence instead of relying on a static fit score.',
        'Preserved component tiers and failure states beside the composite priority so an operator could understand the result.',
      ],
      failures: [
        'A missing tier is not neutral: without an explicit null contract, an apparently healthy pipeline can quietly distort prioritization.',
      ],
      reflection:
        'I would make the missing-data contract, retry behavior, and write-time observability explicit. Scoring is only dependable when its failure states travel with the score.',
    },
    {
      slug: 'healthcare-market-map',
      title: caseStudyTitles[1],
      problem: 'Healthcare targeting is an entity-resolution problem before it is an outreach problem.',
      summary:
        'An entity-resolution layer for connecting facilities, health systems, corporate parents, and healthcare-market attributes.',
      metrics: [
        { label: 'CMS facility rows at ingestion', value: '5,419', provenance: 'observed' },
        { label: 'CHSP health-system records', value: '639', provenance: 'observed' },
        { label: 'Health-system working rows', value: '922', provenance: 'observed' },
        { label: 'Mature / immature targets', value: '139 / 196', provenance: 'observed' },
        { label: 'Payer-provider organizations', value: '167', provenance: 'observed' },
        { label: 'Rows without lookup in sample', value: '2 / 10', provenance: 'sampled' },
      ],
      stages: ['Import CMS facilities', 'Resolve system + parent', 'Join CHSP attributes', 'Score fit + scale', 'Keep best company row', 'Segment output'],
      buildLog: [
        'Separated facility, health-system, and corporate-parent identity instead of treating each source row as an account.',
        'Joined CMS and CHSP attributes into a working healthcare-system layer with explicit unresolved states.',
        'Created match keys, detected duplicates, and retained the best company-level row before segmentation.',
      ],
      failures: [
        'Public healthcare records carry parent-identity gaps, duplicate matches, and facility-to-system ambiguity that must remain visible.',
      ],
      reflection:
        'I would preserve match confidence and unresolved-parent states as first-class fields, then give operators a review queue instead of hiding ambiguity behind a single score.',
    },
    {
      slug: 'activation-workflows',
      title: caseStudyTitles[2],
      problem: 'A scored account is not useful until it can be routed into repeatable research and activation with safe missing-data handling.',
      summary:
        'A supporting prototype for routing scored audiences into repeatable research and prepared activation outputs.',
      metrics: [
        { label: 'Immature conditional workflow nodes', value: '5', provenance: 'observed' },
        { label: 'Operator Enrichment linear workflow nodes', value: '4', provenance: 'observed' },
        { label: 'Campaigns in this workspace', value: 'Unavailable', provenance: 'unavailable' },
      ],
      stages: ['Select segment', 'Check identifier', 'Research public activity', 'Write contextual message', 'Persist prepared output'],
      buildLog: [
        'Made identifier availability an explicit branch before research or contact discovery.',
        'Separated research, message preparation, and persistence so each stage could be inspected independently.',
        'Stopped the claim at prepared activation because campaign delivery and business outcomes were not yet represented.',
      ],
      failures: [
        'Campaign execution outcomes are not represented, so the system stops at prepared activation and claims no business outcome.',
      ],
      reflection:
        'I would add owner-visible queues, retry policy, and delivery-state telemetry before calling this an activation system. A branch for incomplete inputs is a product decision, not an edge case.',
    },
  ],
})

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function actionHealthMetric(snapshot?: PublicClaySnapshot): Metric {
  const health = asRecord(snapshot?.aggregates?.sampledActionHealth)
  const sampled = health?.sampled
  const succeeded = health?.succeeded
  const errored = health?.errored
  if (
    isCount(sampled) && isCount(succeeded) && isCount(errored) && succeeded + errored === sampled
  ) {
    return {
      label: 'Sampled action health',
      value: `${succeeded} / ${sampled} succeeded · ${errored} errored`,
      provenance: 'sampled',
    }
  }
  return { label: 'Sampled action health', value: 'Unavailable', provenance: 'unavailable' }
}

function campaignMetric(snapshot?: PublicClaySnapshot): Metric {
  const campaigns = snapshot?.aggregates?.campaigns
  return isCount(campaigns)
    ? { label: 'Campaigns in this workspace', value: String(campaigns), provenance: 'observed' }
    : { label: 'Campaigns in this workspace', value: 'Unavailable', provenance: 'unavailable' }
}

export function portfolioWithSnapshot(snapshot?: PublicClaySnapshot): PortfolioContent {
  const sampledActionHealth = actionHealthMetric(snapshot)
  const campaigns = campaignMetric(snapshot)
  return {
    ...portfolio,
    caseStudies: portfolio.caseStudies.map((study) => ({
      ...study,
      metrics: study.metrics.map((metric) =>
        metric.label === 'Sampled action health' ? sampledActionHealth
          : metric.label === 'Campaigns in this workspace' ? campaigns
            : metric,
      ),
    })),
  }
}

export function snapshotMetrics(snapshot?: PublicClaySnapshot): Metric[] {
  const signalsActive = snapshot?.aggregates?.signalsActive
  const scoredAccounts = snapshot?.aggregates?.scoredAccounts
  const metrics: Metric[] = [
    { label: 'Signals active', value: typeof signalsActive === 'number' ? String(signalsActive) : 'Unavailable', provenance: typeof signalsActive === 'number' ? 'observed' : 'unavailable' },
    { label: 'Account engine', value: typeof scoredAccounts === 'number' ? `${scoredAccounts} scored` : 'Unavailable scored accounts', provenance: typeof scoredAccounts === 'number' ? 'observed' : 'unavailable' },
  ]

  const sampledActionHealth = snapshot?.aggregates?.sampledActionHealth
  if (
    sampledActionHealth &&
    typeof sampledActionHealth === 'object' &&
    typeof sampledActionHealth.sampled === 'number' &&
    typeof sampledActionHealth.succeeded === 'number' &&
    typeof sampledActionHealth.errored === 'number' &&
    sampledActionHealth.succeeded + sampledActionHealth.errored === sampledActionHealth.sampled
  ) {
    metrics.push({
      label: 'Sampled action health',
      value: `${sampledActionHealth.succeeded} / ${sampledActionHealth.sampled} succeeded`,
      provenance: 'sampled',
    })
  }

  return metrics
}
