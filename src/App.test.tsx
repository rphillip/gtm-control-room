import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App, { PortfolioPage } from './App'

afterEach(cleanup)

describe('portfolio shell', () => {
  it('states the healthcare data wedge on the first screen', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /healthcare GTM problems are usually data problems first/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/signals, models, integrations, and automation/i)).toBeInTheDocument()
    expect(
      screen.getByText(/4\+ years building production cloud data systems across startup and digital-health teams/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/Atelier de données · Houston/i)).toBeInTheDocument()
    expect(document.querySelector('[data-atelier-ball]')).toHaveAttribute('aria-hidden', 'true')
    expect(document.querySelector('[data-atelier-ball]')).toHaveAttribute('data-physics-ball')
    expect(document.querySelector('.hero__system')).toHaveAttribute('data-physics-engine', 'matter-js')
    expect(document.querySelector('.hero__system [data-physics-launcher]')).toBeInTheDocument()
    expect(document.querySelector('.hero__system [data-physics-spin]')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-atelier-part]')).toHaveLength(3)
    const heroRegion = screen.getByRole('region', { name: /healthcare GTM problems/i })
    expect(within(heroRegion).queryByLabelText('Selected system evidence')).not.toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Choose a case file' })).toBeInTheDocument()
  })

  it('exposes keyboard-reachable navigation and public profile links', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /start the machine/i })).toHaveAttribute(
      'href',
      '#control-room',
    )
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/ryan-s-75366514/',
    )
    expect(screen.queryByText(/713.?679.?4960/)).not.toBeInTheDocument()
  })

  it('provides focusable skip content, stable section anchors, and a hero email action', () => {
    render(<App />)

    const main = screen.getByRole('main')
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main')
    expect(main).toHaveAttribute('tabindex', '-1')
    main.focus()
    expect(main).toHaveFocus()

    for (const sectionId of ['control-room', 'work', 'registry', 'about', 'contact']) {
      expect(document.getElementById(sectionId)).toBeInTheDocument()
    }

    const hero = screen.getByRole('region', { name: /healthcare GTM problems are usually data problems first/i })
    expect(within(hero).getByRole('link', { name: /email Ryan/i })).toHaveAttribute(
      'href',
      'mailto:ryansulapas@gmail.com',
    )
  })

  it('keeps authored content and labels dynamic values unavailable for a malformed snapshot', async () => {
    const user = userEvent.setup()
    render(<PortfolioPage snapshot={{ aggregates: { campaigns: 0 }, workflows: 'not a list' }} />)

    expect(screen.getByRole('heading', { level: 3, name: /Multi-Signal Account Engine/i })).toBeInTheDocument()
    await user.click(screen.getByText(/open machine notes/i))
    expect(screen.getByLabelText('Control Room telemetry')).toHaveTextContent(/Signal status unavailable/i)
    await user.click(screen.getByText(/open the registry/i))
    await user.click(screen.getByRole('button', { name: 'Signals' }))
    expect(screen.getByText(/Signal inventory unavailable/i)).toBeInTheDocument()
  })
})
