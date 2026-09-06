import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { SignalConvergencePage } from './SignalConvergencePage'

afterEach(cleanup)

describe('SignalConvergencePage', () => {
  it('labels the exercise as synthetic and updates the hypothesis from native controls', async () => {
    const user = userEvent.setup()
    render(<SignalConvergencePage />)

    expect(screen.getByText('100% synthetic')).toBeInTheDocument()
    expect(screen.getByText('No data background needed.')).toBeVisible()
    expect(screen.getByText(/each signal as one clue/i)).toBeVisible()
    expect(document.querySelectorAll('[data-artifact-data-ball]')).toHaveLength(1)
    expect(document.querySelectorAll('.convergence-diagram__ticket')).toHaveLength(3)
    expect(screen.getAllByText(/Evidence · Synthetic/i)).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 signals')
    expect(screen.getByRole('status')).toHaveTextContent('Baseline — no current reason to prioritize')

    const signals = screen.getAllByRole('checkbox')
    expect(signals).toHaveLength(3)
    for (const signal of signals) await user.click(signal)

    expect(screen.getByRole('status')).toHaveTextContent('3 of 3 signals')
    expect(screen.getByRole('status')).toHaveTextContent('Strong convergence — investigate now')
    expect(screen.getByText(/three clues join.*gate opens/i)).toBeVisible()
    expect(screen.getByRole('meter')).toHaveValue(100)
    expect(screen.getByRole('status')).toHaveTextContent(/None of these proves buying intent/i)
  })

  it('exposes adjustable assumptions without changing the underlying account', async () => {
    const user = userEvent.setup()
    render(<SignalConvergencePage />)

    const equal = screen.getByRole('radio', { name: 'Equal weight' })
    const custom = screen.getByRole('radio', { name: 'Custom weight' })
    expect(equal).toBeChecked()
    expect(screen.getAllByRole('slider')[0]).toBeDisabled()

    await user.click(custom)
    expect(custom).toBeChecked()
    expect(screen.getAllByRole('slider')[0]).toBeEnabled()
    expect(screen.getByText(/Pure Vibe™/i)).toBeVisible()
    expect(screen.getByText(/Acme Manufacturing/i)).toBeVisible()
  })

  it('links safely back to the portfolio base', () => {
    render(<SignalConvergencePage />)
    expect(screen.getByRole('link', { name: 'Return to portfolio' }).getAttribute('href')).toMatch(/\/$/)
    expect(screen.getByRole('link', { name: /Explore the hospital TAM/i }).getAttribute('href')).toMatch(/\/hospital-tam\/$/)
  })
})
