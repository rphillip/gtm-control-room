import { cleanup, render, screen, within } from '@testing-library/react'
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

    const sourceControls = screen.getByLabelText('Public data sources')
    const buttons = within(sourceControls).getAllByRole('button')

    expect(buttons.map((button) => button.textContent)).toEqual(['Hiring + intent', 'CMS + CHSP', 'BLS injury data'])
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

  it('explains each selected stage with inputs, transformations, outputs, and failure modes', async () => {
    const user = userEvent.setup()
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    const telemetry = screen.getByLabelText('Control Room telemetry')
    const stageInputs = [
      [/01 detect/i, /Public hiring, intent, healthcare, and safety source events/i],
      [/02 normalize/i, /Facility, company, industry, and health-system attributes/i],
      [/03 qualify/i, /scoring value, company domain, and scoring dimension/i],
      [/04 route/i, /Qualified tiers plus an audience segment and identifier availability/i],
      [/05 activate/i, /Prepared research and message outputs/i],
      [/06 observe/i, /Signal states, workflow topology, and sampled action outcomes/i],
    ] as const

    for (const [stageName, input] of stageInputs) {
      await user.click(screen.getByRole('button', { name: stageName }))
      expect(telemetry).toHaveTextContent(/Input/i)
      expect(telemetry).toHaveTextContent(/Transformation/i)
      expect(telemetry).toHaveTextContent(/Output/i)
      expect(telemetry).toHaveTextContent(/Failure mode/i)
      expect(telemetry).toHaveTextContent(input)
    }
  })

  it('renders the snapshot workflow nodes, edges, and topology shape', () => {
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    const workflows = screen.getByLabelText('Workflow topologies')
    expect(workflows).toHaveTextContent(/Turquoise Immature.*Conditional branch/i)
    expect(workflows).toHaveTextContent(/Has company identifier\?.*conditional/i)
    expect(workflows).toHaveTextContent(/Segment → Has company identifier\?/i)
    expect(workflows).toHaveTextContent(/Turquoise Operator Enrichment.*Linear sequence/i)
    expect(workflows).toHaveTextContent(/Operator Send Research → Write LinkedIn Message/i)
  })

  it('renders authored unavailable states instead of false zeroes for incomplete snapshots', () => {
    const incompleteSnapshot = { aggregates: {}, signals: [] }
    render(<ControlRoom snapshot={incompleteSnapshot} />)

    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Signal status unavailable/i)
    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Tier contract unavailable/i)
    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Campaign state unavailable/i)
    expect(screen.getByLabelText('Reliability and workflow telemetry')).toHaveTextContent(/Sampled action health unavailable/i)
    expect(screen.getByLabelText('Workflow topologies')).toHaveTextContent(/Workflow topology unavailable/i)
    expect(screen.queryByText(/0 active · 0 errored/i)).not.toBeInTheDocument()
  })
})
