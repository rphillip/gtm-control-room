import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { HospitalTamWalkthrough } from './HospitalTamWalkthrough'

afterEach(cleanup)

describe('HospitalTamWalkthrough', () => {
  it('moves forward and backward through all entity layers', async () => {
    const user = userEvent.setup()
    render(<HospitalTamWalkthrough />)

    const previous = screen.getByRole('button', { name: /Previous layer/i })
    const next = screen.getByRole('button', { name: /Next layer/i })
    expect(previous).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 4')
    expect(screen.getAllByText(/CMS facility · Synthetic/i)).toHaveLength(10)

    await user.click(next)
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 4: Join to health systems')
    expect(screen.getByText(/two jaws close/i)).toBeVisible()
    expect(screen.getByText('Example Health System')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /Resolve to GTM companies/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 4')
    expect(screen.getByText('Example Health')).toBeVisible()

    await user.click(next)
    expect(next).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Step 4 of 4')
    expect(screen.getByText(/ball taps 1, 2, 3/i)).toBeVisible()
    expect(screen.getByText(/0 unresolved/i)).toBeVisible()

    await user.click(previous)
    expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 4')
  })

  it('marks the current numbered control without relying on color', () => {
    render(<HospitalTamWalkthrough />)
    expect(screen.getByRole('button', { name: /Start with facilities/i })).toHaveAttribute('aria-current', 'step')
  })
})
