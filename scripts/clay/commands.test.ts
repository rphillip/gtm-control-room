import { describe, expect, it } from 'vitest'

import { createClayRunner, runClay } from './commands.mjs'

describe('runClay', () => {
  it('rejects a Clay write command before invoking the executable', async () => {
    let failure: unknown
    try {
      await runClay(['tables', 'create', 't_private_record', '--name', 'private@example.com'])
    } catch (error) {
      failure = error
    }

    const serialized = JSON.stringify({
      message: failure instanceof Error ? failure.message : failure,
      stack: failure instanceof Error ? failure.stack : undefined,
    })
    expect(serialized).toMatch(/not read-only allowlisted/i)
    expect(serialized).not.toMatch(/t_private_record|private@example\.com/)
  })

  it('rejects non-string arguments at the command boundary', async () => {
    await expect(runClay(['tables', 'get', 123])).rejects.toThrow(/arguments/i)
  })

  it('redacts child-process arguments and stderr from read failures', async () => {
    const runFailingClay = createClayRunner(async () => {
      throw Object.assign(new Error('request failed for t_private_record'), {
        stderr: 'Bearer private-token; raw row private@example.com',
      })
    })

    let failure: unknown
    try {
      await runFailingClay(['tables', 'get', 't_private_record'])
    } catch (error) {
      failure = error
    }

    const serialized = JSON.stringify({
      message: failure instanceof Error ? failure.message : failure,
      stack: failure instanceof Error ? failure.stack : undefined,
    })
    expect(serialized).toMatch(/Clay read failed for tables get/)
    expect(serialized).not.toMatch(
      /t_private_record|Bearer private-token|private@example\.com|raw row/,
    )
  })
})
