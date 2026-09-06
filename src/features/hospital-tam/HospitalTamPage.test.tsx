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
    expect(document.querySelectorAll('.tam-score-builder')).toHaveLength(1)
    expect(document.querySelectorAll('.tam-score-builder__data-ball')).toHaveLength(1)
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

  it('builds an account profile through all four scoring stations', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)
    const builder = document.querySelector('.tam-score-builder') as HTMLElement

    await user.click(screen.getByRole('radio', { name: '10+ hospitals' }))
    await user.click(screen.getByRole('button', { name: /Lock size and roll onward/i }))
    expect(within(builder).getByRole('status')).toHaveTextContent(/Scoring station 2 of 4/i)

    await user.click(screen.getByRole('button', { name: /Lock geography and roll onward/i }))
    await user.click(screen.getByRole('button', { name: /Lock facility mix and roll onward/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Payer Contracting' }))
    await user.click(screen.getByRole('button', { name: /Print the account profile/i }))

    expect(screen.getByRole('heading', { name: 'Example Health' })).toBeVisible()
    expect(screen.getByText('10+ hospitals')).toBeVisible()
    expect(screen.getByText(/Managed Care · Payer Contracting/)).toBeVisible()
    expect(screen.getByText(/Recommended action: investigate the account/i)).toBeVisible()
  })

  it('traces an identity passport and diverts ambiguous records to review', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)
    const passport = screen.getByLabelText('Identity passport for Hospital A').closest('.tam-passport-machine') as HTMLElement
    const advance = within(passport).getByRole('button', { name: /Advance record/i })

    await user.click(advance)
    await user.click(advance)
    expect(within(passport).getByRole('status')).toHaveTextContent(/Identity station 3 of 7: System resolution/i)
    expect(within(passport).getByText('SYS001')).toBeVisible()

    await user.click(within(passport).getByRole('switch', { name: /Introduce ambiguity/i }))
    expect(within(passport).getByRole('status')).toHaveTextContent(/held for human review/i)
    expect(within(passport).getByText('CONFLICT')).toBeVisible()
    expect(within(passport).getByText('HUMAN REVIEW')).toBeVisible()
    expect(within(passport).getByRole('button', { name: /Held for human review/i })).toBeDisabled()

    await user.click(within(passport).getByRole('switch', { name: /Introduce ambiguity/i }))
    await user.click(within(passport).getByRole('button', { name: /Advance record/i }))
    expect(within(passport).getByText('CO001')).toBeVisible()
  })

  it('reroutes the same account when its commercial thesis or evidence changes', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)
    const filters = screen.getByRole('heading', { name: /Filters should reflect/i }).closest('section') as HTMLElement

    expect(within(filters).getByRole('status')).toHaveTextContent(/routed to include in this audience/i)
    await user.click(within(filters).getByRole('radio', { name: /Rural-care operations/i }))
    expect(within(filters).getByRole('status')).toHaveTextContent(/routed to outside this thesis/i)

    await user.selectOptions(within(filters).getByRole('combobox', { name: /Rural-care operating evidence/i }), 'missing')
    expect(within(filters).getByRole('status')).toHaveTextContent(/routed to hold for review/i)
    expect(within(filters).getByRole('heading', { name: 'Hold for review' }).closest('aside')).toHaveTextContent(/Missing evidence is a research task/i)
  })

  it('uses base-safe links to both portfolio destinations', () => {
    render(<HospitalTamPage />)
    expect(screen.getByRole('link', { name: 'Return to portfolio' }).getAttribute('href')).toMatch(/\/$/)
    expect(screen.getByRole('link', { name: /Signal Convergence Playground/i }).getAttribute('href')).toMatch(/\/signal-convergence\/$/)
  })
})
