import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { portfolio } from '../content/portfolio'
import { SelectedSystems } from './SelectedSystems'

afterEach(cleanup)

describe('SelectedSystems', () => {
  it('switches one visible case file from three animated machine controls', async () => {
    const user = userEvent.setup()
    render(<SelectedSystems studies={portfolio.caseStudies} />)

    const controls = screen.getByRole('group', { name: 'Choose a case file' })
    const buttons = controls.querySelectorAll('button[data-case-selector]')
    expect(buttons).toHaveLength(3)
    expect(screen.getByRole('heading', { level: 3, name: 'Multi-Signal Account Engine' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: 'Healthcare Market Map' })).not.toBeInTheDocument()

    const marketButton = screen.getByRole('button', { name: /Healthcare Market Map/i })
    await user.click(marketButton)

    expect(marketButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Now viewing Healthcare Market Map case file.')
    expect(screen.getByRole('region', { name: 'Healthcare Market Map case file' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Healthcare Market Map' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: 'Multi-Signal Account Engine' })).not.toBeInTheDocument()
  })
})
