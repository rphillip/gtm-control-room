export function renderSiteUrlMetadata(siteUrl?: string): string {
  if (!siteUrl) return ''

  const url = new URL(siteUrl)
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('VITE_SITE_URL must be an HTTPS URL')
  }

  url.search = ''
  url.hash = ''
  if (!url.pathname.endsWith('/')) url.pathname += '/'

  const canonicalUrl = url.href
  return [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  ].join('\n    ')
}
