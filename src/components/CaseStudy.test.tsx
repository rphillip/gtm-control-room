import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CaseStudy } from './CaseStudy'
import { portfolio } from '../content/portfolio'

describe('CaseStudy', () => {
  it('shows evidence provenance and expands the build log', async () => {
    const user = userEvent.setup()
    render(<CaseStudy study={portfolio.caseStudies[0]} index={0} />)

    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText(/observed/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open build log/i }))

    expect(screen.getByText(/normalized company identity/i)).toBeVisible()
  })

  it('presents failures without converting samples into global rates', () => {
    render(<CaseStudy study={portfolio.caseStudies[1]} index={1} />)

    expect(screen.getByText(/ten-row CMS sample/i)).toBeInTheDocument()
    expect(screen.queryByText(/match rate/i)).not.toBeInTheDocument()
  })
})
