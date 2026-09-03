import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { ControlRoom } from './ControlRoom'
import type { ClaySnapshot } from '../content/types'
import snapshot from '../data/clay-snapshot.json'

afterEach(cleanup)

const sanitizedSnapshot = snapshot as unknown as ClaySnapshot

describe('ControlRoom', () => {
  it('updates the explained path when a source is selected', async () => {
    const user = userEvent.setup()
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    await user.click(screen.getByRole('button', { name: /CMS \+ CHSP/i }))

    expect(screen.getByRole('button', { name: /CMS \+ CHSP/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(/5,419 CMS facility rows/i)
  })

  it('uses standard buttons in document order without drag-only behavior', () => {
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    const buttons = screen.getAllByRole('button')

    expect(buttons.map((button) => button.textContent)).toEqual(
      expect.arrayContaining(['Hiring + intent', 'CMS + CHSP', 'BLS injury data']),
    )
  })

  it('updates selected-stage telemetry through keyboard operation', async () => {
    const user = userEvent.setup()
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    const normalize = screen.getByRole('button', { name: /02 normalize/i })
    normalize.focus()
    await user.keyboard('{Enter}')

    expect(normalize).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(/Normalize/i)
  })
})
