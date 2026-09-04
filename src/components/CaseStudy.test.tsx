import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CaseStudy } from './CaseStudy'
import { portfolio } from '../content/portfolio'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

describe('CaseStudy', () => {
  it('shows evidence provenance and expands the build log', async () => {
    const user = userEvent.setup()
    render(<CaseStudy study={portfolio.caseStudies[0]} index={0} />)

    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('Observed aggregate evidence; samples are labeled.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open build log/i }))

    expect(screen.getByText(/normalized company identity/i)).toBeVisible()
  })

  it('presents failures without converting samples into global rates', () => {
    render(<CaseStudy study={portfolio.caseStudies[1]} index={1} />)

    expect(screen.getByText(/ten-row CMS sample/i)).toBeInTheDocument()
    expect(screen.queryByText(/match rate/i)).not.toBeInTheDocument()
  })

  it('renders optional local evidence media from a content entry', () => {
    vi.stubEnv('BASE_URL', '/gtm-control-room/')
    render(
      <CaseStudy
        index={0}
        study={{
          ...portfolio.caseStudies[0],
          media: {
            kind: 'image',
            src: '/evidence/account-engine-topology.svg',
            alt: 'An anonymized account-engine topology',
            caption: 'An optional portfolio-safe topology asset.',
            width: 1600,
            height: 900,
          },
        }}
      />,
    )

    expect(screen.getByRole('img', { name: /anonymized account-engine topology/i })).toHaveAttribute(
      'src',
      '/gtm-control-room/evidence/account-engine-topology.svg',
    )
    expect(screen.getByRole('img', { name: /anonymized account-engine topology/i })).toHaveAttribute('width', '1600')
    expect(screen.getByRole('img', { name: /anonymized account-engine topology/i })).toHaveAttribute('height', '900')
    expect(screen.getByText(/optional portfolio-safe topology asset/i)).toBeInTheDocument()
  })

  it.each(portfolio.caseStudies.map((study, index) => [study.title, study, index] as const))(
    'renders the required %s case study',
    (title, study, index) => {
      render(<CaseStudy study={study} index={index} />)
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument()
    },
  )
})
