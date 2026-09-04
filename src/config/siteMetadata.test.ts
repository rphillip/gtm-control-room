import { describe, expect, it } from 'vitest'

import { renderSiteUrlMetadata } from './siteMetadata'

describe('renderSiteUrlMetadata', () => {
  it('renders a normalized canonical and Open Graph URL for a deployed Pages site', () => {
    expect(renderSiteUrlMetadata('https://example.github.io/portfolio?draft=1#preview')).toBe(
      [
        '<link rel="canonical" href="https://example.github.io/portfolio/" />',
        '<meta property="og:url" content="https://example.github.io/portfolio/" />',
      ].join('\n    '),
    )
  })

  it('omits URL metadata when no verified deployment URL is available', () => {
    expect(renderSiteUrlMetadata()).toBe('')
  })

  it('rejects a non-HTTPS deployment URL', () => {
    expect(() => renderSiteUrlMetadata('http://example.github.io/portfolio')).toThrow(
      'VITE_SITE_URL must be an HTTPS URL',
    )
  })
})
