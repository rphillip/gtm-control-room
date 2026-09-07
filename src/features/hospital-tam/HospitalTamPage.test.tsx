import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HospitalTamPage } from './HospitalTamPage'
import { tamChecklist } from './TamChecklist'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('HospitalTamPage', () => {
  it('frames the project, audience, sources, limitations, and non-endorsement honestly', () => {
    render(<HospitalTamPage />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('5,000 Hospitals Don’t Mean 5,000 Prospects')
    expect(screen.getByText(/Independent portfolio exercise/i)).toBeVisible()
    expect(screen.getByText(/Not work performed for, sponsored by, or endorsed/i)).toBeVisible()
    expect(screen.getByText(/CMS lists hospitals registered with Medicare/i)).toBeInTheDocument()
    expect(screen.getByText(/not a universal score or a prediction/i)).toBeVisible()
    expect(screen.getByText('No data background needed.')).toBeVisible()
    expect(screen.getByText(/pile of mailing labels/i)).toBeVisible()
    expect(screen.getByText(/account universe needed before estimating it/i)).toBeVisible()
    expect(document.querySelector('[data-artifact-data-ball]')).toBeInTheDocument()
    expect(document.querySelectorAll('.tam-score-builder')).toHaveLength(1)
    expect(document.querySelectorAll('.tam-score-builder__data-ball')).toHaveLength(1)
    expect(screen.getByRole('link', { name: /CMS Hospital General Information/i })).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
  })

  it('provides a functional plain-English TAM checklist', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)

    const checklist = screen.getByRole('heading', { name: 'Can You Explain the Market?' }).closest('section')!
    const checks = checklist.querySelectorAll('input[type="checkbox"]')
    expect(checks).toHaveLength(tamChecklist.length)
    await user.click(checks[0] as HTMLInputElement)
    expect(within(checklist).getByRole('status')).toHaveTextContent(/1 of 5 market checks complete/i)
  })

  it('builds an account profile through all four scoring stations', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)
    const builder = document.querySelector('.tam-score-builder') as HTMLElement

    await user.click(screen.getByRole('radio', { name: '10+ hospitals' }))
    await user.click(screen.getByRole('button', { name: /Set organization size and roll onward/i }))
    expect(within(builder).getByRole('status')).toHaveTextContent(/Account brief station 2 of 4/i)

    await user.click(screen.getByRole('button', { name: /Set operating footprint and roll onward/i }))
    await user.click(screen.getByRole('button', { name: /Set hospital mix and roll onward/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Payer Contracting' }))
    await user.click(screen.getByRole('button', { name: /Print the account brief/i }))

    expect(screen.getByRole('heading', { name: 'Example Health' })).toBeVisible()
    expect(screen.getByText('10+ hospitals')).toBeVisible()
    expect(screen.getByText(/Managed Care · Payer Contracting/)).toBeVisible()
    expect(screen.getByRole('heading', { name: /Why the machine believes this brief/i })).toBeVisible()
    expect(screen.getAllByText(/Sep 6, 2026 · synthetic snapshot/i)).toHaveLength(4)
    expect(screen.getByText(/Check for acquisitions after the source date/i)).toBeVisible()
    expect(screen.getAllByText(/Recommended next step: Investigate the account/i)).not.toHaveLength(0)
  })

  it('traces an identity passport and diverts ambiguous records to review', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)
    const passport = document.querySelector('.tam-passport-machine') as HTMLElement
    await user.click(within(passport).getByText(/View the technical data receipt/i))
    const advance = within(passport).getByRole('button', { name: /Advance record/i })

    await user.click(advance)
    await user.click(advance)
    expect(within(passport).getByRole('status')).toHaveTextContent(/Identity station 3 of 7: Operating system/i)
    expect(within(passport).getByText('SYS001')).toBeVisible()

    await user.click(within(passport).getByRole('switch', { name: /Simulate a disputed match/i }))
    expect(within(passport).getByRole('status')).toHaveTextContent(/held for human review/i)
    expect(within(passport).getByText('CONFLICT')).toBeVisible()
    expect(within(passport).getByText('HUMAN REVIEW')).toBeVisible()
    expect(within(passport).getByRole('button', { name: /Held for human review/i })).toBeDisabled()

    await user.click(within(passport).getByRole('switch', { name: /Simulate a disputed match/i }))
    await user.click(within(passport).getByRole('button', { name: /Advance record/i }))
    expect(within(passport).getByText('CO001')).toBeVisible()
  })

  it('demonstrates the five linked failures caused by skipping identity resolution', () => {
    vi.useFakeTimers()
    render(<HospitalTamPage />)
    const failures = screen.getByRole('heading', { name: /What breaks if every hospital row becomes a customer/i }).closest('section') as HTMLElement

    fireEvent.click(within(failures).getByRole('button', { name: 'Break the machine' }))
    act(() => vi.advanceTimersByTime(4000))

    expect(within(failures).getByRole('status')).toHaveTextContent(/all five downstream failures were triggered/i)
    expect(within(failures).getByText(/one facility record becomes several apparent prospects/i)).toBeVisible()
    expect(within(failures).getByText(/keep ringing the pipeline counter/i)).toBeVisible()

    fireEvent.click(within(failures).getByRole('button', { name: 'Run it correctly' }))
    expect(within(failures).getByRole('status')).toHaveTextContent(/one stable account continues/i)
  })

  it('reroutes the same account when its commercial thesis or evidence changes', async () => {
    const user = userEvent.setup()
    render(<HospitalTamPage />)
    const filters = screen.getByRole('heading', { name: /The product determines which accounts matter/i }).closest('section') as HTMLElement

    expect(within(filters).getByRole('status')).toHaveTextContent(/routed to include for investigation/i)
    await user.click(within(filters).getByRole('radio', { name: /Rural-care operations/i }))
    expect(within(filters).getByRole('status')).toHaveTextContent(/routed to not a fit for this product strategy/i)

    await user.selectOptions(within(filters).getByRole('combobox', { name: /Rural-care operating evidence/i }), 'missing')
    expect(within(filters).getByRole('status')).toHaveTextContent(/routed to needs human review/i)
    expect(within(filters).getByRole('heading', { name: 'Needs human review' }).closest('aside')).toHaveTextContent(/Missing information creates a research task/i)
  })

  it('uses base-safe links to both portfolio destinations', () => {
    render(<HospitalTamPage />)
    expect(screen.getByRole('link', { name: 'Return to portfolio' }).getAttribute('href')).toMatch(/\/$/)
    expect(screen.getByRole('link', { name: /Signal Convergence Playground/i }).getAttribute('href')).toMatch(/\/signal-convergence\/$/)
  })
})
