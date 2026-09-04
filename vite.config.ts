import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

import { assertPublicClaySnapshot } from './scripts/clay/sanitize.mjs'
import { renderSiteUrlMetadata } from './src/config/siteMetadata'

const publicSnapshotModule = 'virtual:public-clay-snapshot'
const resolvedPublicSnapshotModule = `\0${publicSnapshotModule}`

export function pagesBase(repository = process.env.GITHUB_REPOSITORY) {
  const repositoryName = repository?.split('/')[1]
  return repositoryName ? `/${repositoryName}/` : '/'
}

export function publicSnapshotPlugin(snapshotPath: string) {
  return {
    name: 'public-clay-snapshot-boundary',
    resolveId(id: string) {
      return id === publicSnapshotModule ? resolvedPublicSnapshotModule : undefined
    },
    load(id: string) {
      if (id !== resolvedPublicSnapshotModule) return undefined
      if (!existsSync(snapshotPath)) return 'export default undefined'

      let snapshot: unknown
      try {
        snapshot = JSON.parse(readFileSync(snapshotPath, 'utf8'))
      } catch {
        throw new Error('Public Clay snapshot is not valid JSON')
      }
      assertPublicClaySnapshot(snapshot)
      return `export default ${JSON.stringify(snapshot)}`
    },
  }
}

export function createViteConfig({
  snapshotPath = resolve(process.cwd(), 'src/data/clay-snapshot.json'),
  base = pagesBase(),
  siteUrl = process.env.VITE_SITE_URL,
}: {
  snapshotPath?: string
  base?: string
  siteUrl?: string
} = {}) {
  return {
    base,
    plugins: [
      react(),
      publicSnapshotPlugin(snapshotPath),
      {
        name: 'verified-site-url-metadata',
        transformIndexHtml(html: string) {
          const metadata = renderSiteUrlMetadata(siteUrl)
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
  }
}

export default defineConfig(createViteConfig())
