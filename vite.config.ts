import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
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

function invalidatePublicSnapshot(server: ViteDevServer) {
  const module = server.moduleGraph.getModuleById(resolvedPublicSnapshotModule)
  if (module) server.moduleGraph.invalidateModule(module)
  server.ws.send({ type: 'full-reload' })
}

export function publicSnapshotPlugin(snapshotPath: string): Plugin {
  const watchedSnapshotPath = resolve(snapshotPath)

  return {
    name: 'public-clay-snapshot-boundary',
    buildStart() {
      this.addWatchFile(watchedSnapshotPath)
    },
    resolveId(id: string) {
      return id === publicSnapshotModule ? resolvedPublicSnapshotModule : undefined
    },
    load(id: string) {
      if (id !== resolvedPublicSnapshotModule) return undefined
      if (!existsSync(watchedSnapshotPath)) return 'export default undefined'

      let snapshot: unknown
      try {
        snapshot = JSON.parse(readFileSync(watchedSnapshotPath, 'utf8'))
      } catch {
        throw new Error('Public Clay snapshot is not valid JSON')
      }
      assertPublicClaySnapshot(snapshot)
      return `export default ${JSON.stringify(snapshot)}`
    },
    configureServer(server) {
      server.watcher.add(dirname(watchedSnapshotPath))
      const invalidateOnCreateOrDelete = (file: string) => {
        if (resolve(file) === watchedSnapshotPath) invalidatePublicSnapshot(server)
      }
      server.watcher.on('add', invalidateOnCreateOrDelete)
      server.watcher.on('unlink', invalidateOnCreateOrDelete)
      server.httpServer?.once('close', () => {
        server.watcher.off('add', invalidateOnCreateOrDelete)
        server.watcher.off('unlink', invalidateOnCreateOrDelete)
      })
    },
    handleHotUpdate({ file, server }) {
      if (resolve(file) !== watchedSnapshotPath) return
      invalidatePublicSnapshot(server)
      return []
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
      exclude: [...configDefaults.exclude, 'e2e/**', '.worktrees/**'],
      setupFiles: './src/test/setup.ts',
    },
  }
}

export default defineConfig(createViteConfig())
