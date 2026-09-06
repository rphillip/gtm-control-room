import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { portfolio } from '../content/portfolio'
import { EvidenceMobile } from './EvidenceMobile'

afterEach(cleanup)

describe('EvidenceMobile', () => {
  it.each(portfolio.caseStudies)(
    'turns the featured evidence for $title into readable hanging nodes',
    (study) => {
      const variant = study.slug as 'multi-signal-account-engine' | 'healthcare-market-map' | 'activation-workflows'
      render(<EvidenceMobile title={study.title} metrics={study.metrics.slice(0, 3)} variant={variant} />)
      const mobile = screen.getByRole('figure', { name: `${study.title} evidence mobile` })

      expect(mobile).toHaveAttribute('data-mobile-variant', study.slug)
      expect(within(mobile).getByText(/Evidence (in balance|in orbit|at the switch)/i)).toBeInTheDocument()
      expect(mobile.querySelectorAll('[data-mobile-node]')).toHaveLength(3)
      for (const metric of study.metrics.slice(0, 3)) {
        expect(within(mobile).getByText(metric.value)).toBeInTheDocument()
        expect(within(mobile).getByText(metric.label)).toBeInTheDocument()
      }
    },
  )
})
