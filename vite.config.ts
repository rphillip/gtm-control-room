import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

import { renderSiteUrlMetadata } from './src/config/siteMetadata'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repositoryName ? `/${repositoryName}/` : '/',
  plugins: [
    react(),
    {
      name: 'verified-site-url-metadata',
      transformIndexHtml(html) {
        const metadata = renderSiteUrlMetadata(process.env.VITE_SITE_URL)
        return html.replace(
          '    <!-- SITE_URL_METADATA -->',
          metadata ? `    ${metadata}` : '',
        )
      },
    },
  ],
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    setupFiles: './src/test/setup.ts',
  },
})
