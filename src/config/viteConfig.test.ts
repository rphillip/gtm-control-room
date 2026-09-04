// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { createViteConfig } from '../../vite.config'

describe('Vitest workspace isolation', () => {
  it('does not discover tests inside Git worktrees nested under the repository', () => {
    const config = createViteConfig()

    expect(config.test.exclude).toContain('.worktrees/**')
  })
})
