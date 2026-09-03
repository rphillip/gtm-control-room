import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { SystemRegistry } from './SystemRegistry'
import type { ClaySnapshot } from '../content/types'
import { normalizePublicSnapshot } from '../content/publicSnapshot'

afterEach(cleanup)

const snapshot: ClaySnapshot = {
  generatedAt: '2026-09-03T00:00:00.000Z',
  signals: [],
  function: { name: 'AutoTier', contract: 'Value + domain + dimension → tier' },
  aggregates: { campaigns: 0, signalsActive: 5, signalsErrored: 1 },
  workflows: [
    {
      name: 'Turquoise Immature',
      nodes: [
        { name: 'Segment', type: 'trigger' },
        { name: 'Has company identifier?', type: 'conditional' },
        { name: 'Mark no company identifier', type: 'tool' },
        { name: 'Find contacts at company', type: 'tool' },
        { name: 'Add contact to Audiences', type: 'tool' },
      ],
      edges: [[0, 1], [1, 2], [1, 3], [3, 4]],
    },
    {
      name: 'Turquoise Operator Enrichment',
      nodes: [
        { name: 'Segment', type: 'trigger' },
        { name: 'Research', type: 'agent' },
        { name: 'Write', type: 'agent' },
        { name: 'Save', type: 'tool' },
      ],
      edges: [[0, 1], [1, 2], [2, 3]],
    },
  ],
}

describe('SystemRegistry', () => {
  it('renders the snapshot edge topology, distinguishing branch from linear flow', async () => {
    const user = userEvent.setup()
    render(<SystemRegistry snapshot={snapshot} />)

    await user.click(screen.getByRole('button', { name: 'Workflows' }))

    expect(screen.getByText(/Conditional branch: Has company identifier\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Linear sequence: Segment → Research → Write → Save/i)).toBeInTheDocument()
    expect(screen.getByText(/0 observed — activation not shipped/i)).toBeInTheDocument()
  })

  it('uses native pressed view selectors that work with the keyboard', async () => {
    const user = userEvent.setup()
    render(<SystemRegistry snapshot={snapshot} />)
    const workflows = screen.getByRole('button', { name: 'Workflows' })

    expect(workflows).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    workflows.focus()
    await user.keyboard('{Enter}')

    expect(workflows).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/Conditional branch/i)).toBeInTheDocument()
  })

  it.each([
    ['an undefined snapshot', undefined],
    ['malformed workflow and campaign fields', normalizePublicSnapshot({ workflows: 'not a list', aggregates: { campaigns: 'zero' } })],
  ])('shows campaigns as unavailable for %s', async (_label, malformedSnapshot) => {
    const user = userEvent.setup()
    render(<SystemRegistry snapshot={malformedSnapshot} />)

    await user.click(screen.getByRole('button', { name: 'Workflows' }))

    expect(screen.getByText(/^Campaigns: Unavailable$/i)).toBeInTheDocument()
    expect(screen.queryByText(/0 observed — activation not shipped/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Workflow topology unavailable/i)).toBeInTheDocument()
  })
})
