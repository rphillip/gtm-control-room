// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { createViteConfig, routeForHtmlPath } from '../../vite.config'

describe('Vitest workspace isolation', () => {
  it('does not discover tests inside Git worktrees nested under the repository', () => {
    const config = createViteConfig()

    expect(config.test.exclude).toContain('.worktrees/**')
  })

  it('emits a directly addressable Signal Convergence page', () => {
    const config = createViteConfig()
    const input = config.build.rollupOptions.input

    expect(input.signalConvergence).toMatch(/signal-convergence\/index\.html$/)
    expect(input.hospitalTam).toMatch(/hospital-tam\/index\.html$/)
  })

  it('maps each artifact HTML path to its canonical route', () => {
    expect(routeForHtmlPath('/signal-convergence/index.html')).toBe('signal-convergence')
    expect(routeForHtmlPath('/hospital-tam/index.html')).toBe('hospital-tam')
    expect(routeForHtmlPath('/index.html')).toBe('')
  })
})
