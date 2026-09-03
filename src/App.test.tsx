import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

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
  })

  it('exposes keyboard-reachable navigation and public profile links', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /enter the control room/i })).toHaveAttribute(
      'href',
      '#control-room',
    )
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/ryan-s-75366514/',
    )
    expect(screen.queryByText(/713.?679.?4960/)).not.toBeInTheDocument()
  })
})
