import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { HospitalTamPage } from './HospitalTamPage'
import { tamChecklist } from './TamChecklist'

afterEach(cleanup)

describe('HospitalTamPage', () => {
  it('frames the project, audience, sources, limitations, and non-endorsement honestly', () => {
    render(<HospitalTamPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('5,000 Hospitals Don’t Mean 5,000 Prospects')
    expect(screen.getByText(/Independent portfolio exercise/i)).toBeVisible()
    expect(screen.getByText(/Not work performed for, sponsored by, or endorsed/i)).toBeVisible()
    expect(screen.getByText(/CMS lists hospitals registered with Medicare/i)).toBeVisible()
    expect(screen.getByText(/not a purchase-intent model/i)).toBeVisible()
    expect(screen.getByText('No data background needed.')).toBeVisible()
    expect(screen.getByText(/pile of mailing labels/i)).toBeVisible()
    expect(document.querySelector('[data-artifact-data-ball]')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /CMS Hospital General Information/i })).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })

  it('provides a functional ten-item TAM checklist', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)

    const checklist = screen.getByRole('heading', { name: 'Before You Call It a TAM' }).closest('section')!
    const checks = checklist.querySelectorAll('input[type="checkbox"]')
    expect(checks).toHaveLength(tamChecklist.length)
    await user.click(checks[0] as HTMLInputElement)
    expect(within(checklist).getByRole('status')).toHaveTextContent(/1 of 10 TAM checks complete/i)
  })

  it('uses base-safe links to both portfolio destinations', () => {
    render(<HospitalTamPage />)
    expect(screen.getByRole('link', { name: 'Return to portfolio' }).getAttribute('href')).toMatch(/\/$/)
    expect(screen.getByRole('link', { name: /Signal Convergence Playground/i }).getAttribute('href')).toMatch(/\/signal-convergence\/$/)
  })
})
