import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { portfolio } from '../content/portfolio'
import { CaseMachine } from './CaseMachine'

afterEach(cleanup)

describe('CaseMachine', () => {
  it.each(portfolio.caseStudies)(
    'renders an accessible animated machine and permanent evidence caption for $title',
    (study) => {
      const { container } = render(<CaseMachine study={study} />)
      const figure = screen.getByRole('figure', { name: `${study.title} animated system machine` })

      expect(figure).toHaveAttribute('data-machine', study.slug)
      expect(figure).toHaveAttribute('data-physics-engine', 'matter-js')
      expect(container.querySelector('[data-case-ball]')).toHaveAttribute('aria-hidden', 'true')
      expect(container.querySelector('[data-case-ball]')?.tagName.toLowerCase()).toBe('circle')
      expect(container.querySelector('[data-physics-spin]')).toBeInTheDocument()
      expect(container.querySelector('[data-physics-launcher]')).toBeInTheDocument()
      expect(container.querySelector('.case-machine__return-track')).toBeInTheDocument()
      const featuredMetrics = study.metrics.filter(({ provenance }) => provenance !== 'unavailable').slice(0, 3)
      expect(within(figure).getAllByRole('button', { name: /evidence:/i })).toHaveLength(featuredMetrics.length)
      for (const metric of featuredMetrics) {
        expect(within(figure).getByText(metric.value, { selector: 'dd' })).toBeInTheDocument()
        expect(within(figure).getByText(metric.label, { selector: 'dt' })).toBeInTheDocument()
      }
    },
  )
})
