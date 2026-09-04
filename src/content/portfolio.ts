import type { Metric, PortfolioContent, PublicClaySnapshot } from './types'
import { validatePortfolio } from './validate'

export const hero = {
  eyebrow: 'Ryan Sulapas · Healthcare GTM data systems',
  title: 'Healthcare GTM problems are usually data problems first.',
  lede:
    'I build the signals, models, integrations, and automation that turn fragmented healthcare data into action.',
  proof: '4+ years building production cloud data systems across startup and digital-health teams.',
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
        'A reusable account-prioritization system that turns fit, timing, feedback, and risk signals into an observable queue.',
      metrics: [
        { label: 'High score tier', value: '11', provenance: 'observed' },
        { label: 'Medium / low score tiers', value: '40 / 9', provenance: 'observed' },
        { label: 'Intent tiers · high / medium / low / without tier', value: '9 / 37 / 7 / 7', provenance: 'observed' },
        { label: 'Injury tiers · high / medium / low', value: '20 / 12 / 28', provenance: 'observed' },
        { label: 'Scored accounts', value: '60', provenance: 'observed' },
        { label: 'New-hire events', value: '27', provenance: 'observed' },
        { label: 'Sampled action health', value: '9 / 10 succeeded', provenance: 'sampled' },
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
        'Normalized company identity and domain so account and event sources could be joined without treating inconsistent names as different businesses.',
        'Detected new-hire, job-posting, and company-topic-intent events; then added qualitative Tally feedback alongside the account context.',
        'Joined BLS industry injury-rate data and normalized every scoring dimension into a reusable input for AutoTier.',
        'Applied AutoTier before composing the score, then wrote the resulting priority and its component tiers downstream.',
      ],
      failures: [
        'In a ten-row sampled health check, one AutoTier intent action errored while the other sampled scoring and write stages succeeded. This is a sample, not a workspace-wide error rate.',
        'A missing tier is not neutral: without an explicit null contract, an otherwise green pipeline can quietly distort prioritization.',
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
        'Imported 5,419 CMS facility records from an HTTP source and started a separate health-system and corporate-parent identity lookup.',
        'Sent matched facilities to a 922-row Turquoise Health Systems working layer and joined the 639-record CHSP health-system dataset.',
        'Derived scale, geography, facility, fit, executive-density, role-density, and total scores from the integrated attributes.',
        'Enriched company identity, generated a match key, detected duplicates, and retained the Is Best Row / maximum-score-per-company result before segmentation.',
      ],
      failures: [
        'In a ten-row CMS sample, two rows lacked a health-system lookup and therefore also lacked the downstream send step. This is indicative sample health, not a global match-rate claim.',
        'Public healthcare records carry parent-identity gaps, duplicate company matches, and facility-to-system ambiguity that must remain visible.',
      ],
      reflection:
        'I would preserve match confidence and unresolved-parent states as first-class fields, then give operators a review queue instead of hiding ambiguity behind a single score.',
    },
    {
      slug: 'activation-workflows',
      title: caseStudyTitles[2],
      problem: 'A scored account is not useful until it can be routed into repeatable research and activation with safe missing-data handling.',
      summary:
        'Safe routing from scored audiences into repeatable research and prepared activation outputs.',
      metrics: [
        { label: 'Immature conditional workflow nodes', value: '5', provenance: 'observed' },
        { label: 'Operator Enrichment linear workflow nodes', value: '4', provenance: 'observed' },
        { label: 'Campaigns in this workspace', value: '0', provenance: 'observed' },
      ],
      stages: ['Select segment', 'Check identifier', 'Research public activity', 'Write contextual message', 'Persist prepared output'],
      buildLog: [
        'Built Turquoise Immature as a five-node conditional: start from an audience, test the company identifier, mark missing identifiers, or find contacts and save them to Clay Audiences.',
        'Built Turquoise Operator Enrichment as a four-node linear flow: start from an audience, research public professional activity, draft a contextual LinkedIn message, and save the prepared output.',
      ],
      failures: [
        'The missing-identifier branch is deliberately visible rather than an exception to hide.',
        'Campaign execution is not yet shipped: this workspace contains zero Campaigns, so the system stops at prepared activation output and claims no business outcome.',
      ],
      reflection:
        'I would add owner-visible queues, retry policy, and delivery-state telemetry before calling this an activation system. A branch for incomplete inputs is a product decision, not an edge case.',
    },
  ],
})

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
    typeof sampledActionHealth.succeeded === 'number'
  ) {
    metrics.push({
      label: 'Sampled action health',
      value: `${sampledActionHealth.succeeded} / ${sampledActionHealth.sampled} succeeded`,
      provenance: 'sampled',
    })
  }

  return metrics
}
