import { describe, expect, it } from 'vitest'

import { parseTierCounts, resolveExactName } from './sync-clay.mjs'

describe('resolveExactName', () => {
  it('selects only the exact display name', () => {
    const selected = resolveExactName(
      [{ name: 'Week 2 archive' }, { name: 'Week 2' }],
      'Week 2',
      'workbook',
    )

    expect(selected).toEqual({ name: 'Week 2' })
  })

  it('rejects missing and ambiguous display names', () => {
    expect(() => resolveExactName([], 'Week 3', 'workbook')).toThrow(/exactly one workbook/i)
    expect(() =>
      resolveExactName([{ name: 'Week 3' }, { name: 'Week 3' }], 'Week 3', 'workbook'),
    ).toThrow(/exactly one workbook/i)
  })
})

describe('parseTierCounts', () => {
  it('maps a null tier to the public Unclassified bucket', () => {
    expect(
      parseTierCounts(
        {
          results: [
            { tier: 'High', count: '9' },
            { tier: 'Medium', count: '37' },
            { tier: 'Low', count: '7' },
            { tier: null, count: '7' },
          ],
        },
        ['High', 'Medium', 'Low', 'Unclassified'],
      ),
    ).toEqual({ High: 9, Medium: 37, Low: 7, Unclassified: 7 })
  })

  it('rejects unknown tiers and malformed counts', () => {
    expect(() =>
      parseTierCounts({ results: [{ tier: 'Critical', count: '1' }] }, ['High', 'Low']),
    ).toThrow(/tier aggregate/i)
    expect(() =>
      parseTierCounts({ results: [{ tier: 'High', count: '-1' }] }, ['High']),
    ).toThrow(/tier aggregate/i)
  })
})
