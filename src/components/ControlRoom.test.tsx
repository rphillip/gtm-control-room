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

  it('includes a decorative motion layer for the ball and mechanisms', () => {
    const { container } = render(<ControlRoom snapshot={snapshot} />)

    expect(container.querySelector('[data-contraption-motion="ball"]')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('[data-physics-engine="matter-js"]')).toBeInTheDocument()
    expect(container.querySelector('[data-contraption-motion="ball"]')?.tagName.toLowerCase()).toBe('circle')
    expect(container.querySelector('[data-physics-spin]')).toBeInTheDocument()
    expect(container.querySelector('[data-physics-launcher]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-contraption-part]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-ball-interaction]')).toHaveLength(7)
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
    await user.click(screen.getByText(/inspect the operating logic/i))

    const telemetry = screen.getByLabelText('Control Room telemetry')
    const stageInputs = [
      [/01 detect/i, /Public hiring, intent, healthcare, and safety source events/i],
      [/02 normalize/i, /Facility, company, industry, and health-system attributes/i],
      [/03 qualify/i, /scoring value, company domain, and scoring dimension/i],
      [/04 route/i, /Qualified tiers plus an audience segment and identifier availability/i],
      [/05 activate/i, /Prepared research and message outputs/i],
      [/06 observe/i, /Signal states, workflow topology, and sampled action outcomes/i],
      [/07 improve/i, /Operator-readable reliability view and production revision priorities/i],
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

  it('keeps every source path in the canonical loop through Observe then Improve', async () => {
    const user = userEvent.setup()
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    const loop = screen.getByRole('list', { name: 'GTM operating loop' })
    expect(within(loop).getAllByRole('button').map((button) => button.querySelector('.control-room__stage-name')?.textContent)).toEqual([
      'Detect',
      'Normalize',
      'Qualify',
      'Route',
      'Activate',
      'Observe',
      'Improve',
    ])

    for (const source of ['Hiring + intent', 'CMS + CHSP', 'BLS injury data']) {
      await user.click(screen.getByRole('button', { name: source }))
      const activeStages = Array.from(loop.querySelectorAll('.is-on-path button'))
        .map((button) => button.querySelector('.control-room__stage-name')?.textContent)
      expect(activeStages.slice(-2)).toEqual(['Observe', 'Improve'])
    }
  })

  it('keeps production judgment visible without duplicating the workflow registry', () => {
    render(<ControlRoom snapshot={sanitizedSnapshot} />)

    screen.getByText(/inspect the operating logic/i).click()

    expect(screen.getByRole('heading', { name: /production judgment/i })).toBeInTheDocument()
    expect(screen.getByText(/owned states—not silent drops/i)).toBeInTheDocument()
    expect(screen.queryByText(/Turquoise Immature/i)).not.toBeInTheDocument()
  })

  it('renders authored unavailable states instead of false zeroes for incomplete snapshots', () => {
    const incompleteSnapshot = { aggregates: {}, signals: [] }
    render(<ControlRoom snapshot={incompleteSnapshot} />)

    screen.getByText(/inspect the operating logic/i).click()

    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Signal status unavailable/i)
    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Tier contract unavailable/i)
    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Campaign state unavailable/i)
    expect(screen.getByLabelText('Reliability telemetry')).toHaveTextContent(/Sampled action health unavailable/i)
    expect(screen.queryByText(/0 active · 0 errored/i)).not.toBeInTheDocument()
  })

  it('derives campaign and sampled-action telemetry from consistent snapshot counts', () => {
    const changedSnapshot = structuredClone(sanitizedSnapshot)
    changedSnapshot.aggregates.campaigns = 3
    changedSnapshot.aggregates.sampledActionHealth = { sampled: 10, succeeded: 8, errored: 2 }
    render(<ControlRoom snapshot={changedSnapshot} />)

    screen.getByText(/inspect the operating logic/i).click()

    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/3 · not yet shipped/i)
    expect(screen.getByLabelText('Reliability telemetry')).toHaveTextContent(
      /8 of 10 actions succeeded; 2 AutoTier intent actions errored/i,
    )
  })

  it('marks inconsistent sampled-action telemetry unavailable instead of inventing a failure count', () => {
    const inconsistentSnapshot = structuredClone(sanitizedSnapshot)
    inconsistentSnapshot.aggregates.sampledActionHealth = { sampled: 10, succeeded: 9, errored: 2 }
    render(<ControlRoom snapshot={inconsistentSnapshot} />)

    screen.getByText(/inspect the operating logic/i).click()

    expect(screen.getByLabelText('Reliability telemetry')).toHaveTextContent(
      /Sampled action health unavailable/i,
    )
    expect(screen.queryByText(/one AutoTier intent action errored/i)).not.toBeInTheDocument()
  })
})
