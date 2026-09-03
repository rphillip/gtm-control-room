import { describe, expect, it } from 'vitest'

import { runClay } from './commands.mjs'

describe('runClay', () => {
  it('rejects a Clay write command before invoking the executable', async () => {
    await expect(runClay(['tables', 'create', '--name', 'unsafe'])).rejects.toThrow(
      /not read-only allowlisted/i,
    )
  })

  it('rejects non-string arguments at the command boundary', async () => {
    await expect(runClay(['tables', 'get', 123])).rejects.toThrow(/arguments/i)
  })
})
