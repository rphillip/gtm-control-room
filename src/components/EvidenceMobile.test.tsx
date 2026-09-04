import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { portfolio } from '../content/portfolio'
import { EvidenceMobile } from './EvidenceMobile'

afterEach(cleanup)

describe('EvidenceMobile', () => {
  it.each(portfolio.caseStudies)(
    'turns the featured evidence for $title into readable hanging nodes',
    (study) => {
      render(<EvidenceMobile title={study.title} metrics={study.metrics.slice(0, 3)} />)
      const mobile = screen.getByRole('figure', { name: `${study.title} evidence mobile` })

      expect(within(mobile).getByText(/Observed aggregate evidence; samples are labeled/i)).toBeInTheDocument()
      expect(mobile.querySelectorAll('[data-mobile-node]')).toHaveLength(3)
      for (const metric of study.metrics.slice(0, 3)) {
        expect(within(mobile).getByText(metric.value)).toBeInTheDocument()
        expect(within(mobile).getByText(metric.label)).toBeInTheDocument()
      }
    },
  )
})
