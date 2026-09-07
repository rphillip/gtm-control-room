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
    expect(document.querySelectorAll('[data-artifact-data-ball]')).toHaveLength(1)
    expect(document.querySelectorAll('.tam-collapse-feeder__rack i')).toHaveLength(10)
    expect(document.querySelectorAll('.tam-system-resolver__balls b')).toHaveLength(4)
    expect(document.querySelectorAll('.tam-company-resolver__outputs b')).toHaveLength(3)
    expect(document.querySelectorAll('.tam-account-counter__balls i')).toHaveLength(3)
    expect(document.querySelectorAll('.tam-account-counter__counted b')).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent('Step 1 of 4')
    expect(screen.getAllByText(/Hospital location · Synthetic/i)).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /Inspect all 10 records/i }))
    expect(screen.getAllByText(/Hospital location · Synthetic/i)).toHaveLength(10)

    await user.click(next)
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 4: Join to health systems')
    expect(screen.getByText(/Ten separate locations now become 4 health systems/i)).toBeVisible()
    expect(screen.getByText('Example Health System')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /Resolve to GTM companies/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 4')
    expect(screen.getByText('Example Health')).toBeVisible()

    await user.click(next)
    expect(next).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Step 4 of 4')
    expect(screen.getByText(/Three account balls strike the counter/i)).toBeVisible()
    expect(screen.getByText(/0 unresolved/i)).toBeVisible()

    await user.click(previous)
    expect(screen.getByRole('status')).toHaveTextContent('Step 3 of 4')
  })

  it('marks the current numbered control without relying on color', () => {
    render(<HospitalTamWalkthrough />)
    expect(screen.getByRole('button', { name: /Start with facilities/i })).toHaveAttribute('aria-current', 'step')
  })
})
