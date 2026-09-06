export type SignalKey = 'intent' | 'job' | 'hire'

export interface PlaygroundSignal {
  key: SignalKey
  shortLabel: string
  name: string
  description: string
  evidence: string
  interpretation: string
  limitation: string
  defaultWeight: number
}

export const playgroundSignals: PlaygroundSignal[] = [
  {
    key: 'intent',
    shortLabel: 'Looking',
    name: 'Injury / MSK Topic Intent',
    description: 'Behavioral evidence around injury and MSK topics.',
    evidence: 'Recent increase in research activity around workplace injury prevention.',
    interpretation: 'They may be looking.',
    limitation: 'Research activity does not reveal who searched, why, or whether a project exists.',
    defaultWeight: 35,
  },
  {
    key: 'job',
    shortLabel: 'Investing',
    name: 'Benefits Job Posting',
    description: 'A relevant open role in benefits or Total Rewards.',
    evidence: 'Hiring: Director of Employee Benefits.',
    interpretation: 'They may be investing.',
    limitation: 'A job opening can reflect replacement hiring or unrelated priorities.',
    defaultWeight: 30,
  },
  {
    key: 'hire',
    shortLabel: 'Changing',
    name: 'New Benefits Leader',
    description: 'A recent leader joining the benefits organization.',
    evidence: 'VP of Total Rewards joined 43 days ago.',
    interpretation: 'Someone may have a new mandate to change things.',
    limitation: 'A new leader may not own MSK strategy or plan an immediate change.',
    defaultWeight: 35,
  },
]

export const priorityByCount = [
  'Baseline — no current reason to prioritize',
  'Interesting, but potentially noise',
  'Worth investigating',
  'Strong convergence — investigate now',
] as const

const stories: Record<string, string> = {
  '': 'No active evidence currently distinguishes this account from the rest of the addressable market.',
  intent: "They may be researching the problem, but one behavioral signal isn't enough to know why.",
  job: "They appear to be investing in the benefits function, but that doesn't necessarily mean they're evaluating an MSK solution.",
  hire: "A new leader may have a mandate to make changes, but we don't yet know what they care about.",
  'intent+job': 'They may be researching the problem while simultaneously investing in the team responsible for it.',
  'intent+hire': 'They may be researching the problem while a new benefits leader could be deciding what to change.',
  'job+hire': "They're strengthening the benefits organization and someone new may have a mandate to change how it operates.",
  'intent+job+hire': 'They may be researching the problem, investing in the function, and have a new leader with a potential mandate for change. None of these proves buying intent, but together they create a much stronger reason to investigate the account now.',
}

export function signalStory(active: Record<SignalKey, boolean>) {
  const key = playgroundSignals.filter(({ key: signalKey }) => active[signalKey]).map(({ key: signalKey }) => signalKey).join('+')
  return stories[key]
}

export function calculatePriorityScore(
  active: Record<SignalKey, boolean>,
  weights: Record<SignalKey, number>,
) {
  const safeWeights = playgroundSignals.map(({ key }) => ({
    key,
    weight: Number.isFinite(weights[key]) ? Math.min(100, Math.max(0, weights[key])) : 0,
  }))
  const configuredWeight = safeWeights.reduce((total, { weight }) => total + weight, 0)
  const selectedWeight = safeWeights.reduce((total, { key, weight }) => total + (active[key] ? weight : 0), 0)

  return Math.min(100, Math.round((selectedWeight / Math.max(100, configuredWeight)) * 100))
}
