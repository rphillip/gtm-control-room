import { describe, expect, it } from 'vitest'
import { calculatePriorityScore, playgroundSignals, priorityByCount, signalStory, type SignalKey } from './model'

const combinations: Record<SignalKey, boolean>[] = Array.from({ length: 8 }, (_, mask) => ({
  intent: Boolean(mask & 1),
  job: Boolean(mask & 2),
  hire: Boolean(mask & 4),
}))

describe('signal convergence model', () => {
  it.each(combinations)('provides an honest hypothesis for %#', (active) => {
    const count = Object.values(active).filter(Boolean).length
    const story = signalStory(active)

    expect(priorityByCount[count]).toBeTruthy()
    expect(story.length).toBeGreaterThan(40)
    expect(`${priorityByCount[count]} ${story}`).not.toMatch(/ready to buy|high purchase intent|will convert/i)
  })

  it('keeps illustrative weights transparent and normalized', () => {
    expect(playgroundSignals.map(({ defaultWeight }) => defaultWeight)).toEqual([35, 30, 35])
    expect(playgroundSignals.reduce((total, { defaultWeight }) => total + defaultWeight, 0)).toBe(100)
  })

  it('never turns one isolated custom signal into a 100-point result', () => {
    expect(calculatePriorityScore(
      { intent: true, job: false, hire: false },
      { intent: 60, job: 0, hire: 0 },
    )).toBe(60)
    expect(calculatePriorityScore(
      { intent: true, job: true, hire: true },
      { intent: 0, job: 0, hire: 0 },
    )).toBe(0)
  })
})
