// @vitest-environment node

import { mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { chromium } from '@playwright/test'
import { build, createServer } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

import { createSnapshotWriter } from './sync-clay.mjs'
import { createViteConfig } from '../vite.config'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })))
})

async function buildPortfolio({ snapshot, base }: { snapshot?: string; base: string }) {
  const directory = await mkdtemp(join(tmpdir(), 'gtm-snapshot-build-'))
  temporaryDirectories.push(directory)
  const snapshotPath = join(directory, 'clay-snapshot.json')
  const outDir = join(directory, 'dist')
  if (snapshot !== undefined) await writeFile(snapshotPath, snapshot, 'utf8')

  await build({
    ...createViteConfig({ snapshotPath, base }),
    configFile: false,
    root: process.cwd(),
    logLevel: 'silent',
    build: { outDir, emptyOutDir: true },
  })

  return { indexHtml: await readFile(join(outDir, 'index.html'), 'utf8') }
}

async function snapshotWithScoredAccounts(scoredAccounts: number) {
  const snapshot = JSON.parse(await readFile(join(process.cwd(), 'src/data/clay-snapshot.json'), 'utf8'))
  snapshot.aggregates.scoredAccounts = scoredAccounts
  return snapshot
}

describe('public Clay snapshot build boundary', () => {
  it('builds the app with authored fallback when the snapshot JSON is absent', async () => {
    const result = await buildPortfolio({ base: '/' })

    expect(result.indexHtml).toContain('/assets/')
  })

  it('fails the build before bundling unknown snapshot fields', async () => {
    await expect(buildPortfolio({
      snapshot: JSON.stringify({ unreviewedField: 'private value' }),
      base: '/',
    })).rejects.toThrow(/unknown snapshot field/i)
  })

  it('builds a valid snapshot under the GitHub Pages base path', async () => {
    const snapshot = await readFile(join(process.cwd(), 'src/data/clay-snapshot.json'), 'utf8')
    const result = await buildPortfolio({ snapshot, base: '/gtm-control-room/' })

    expect(result.indexHtml).toContain('/gtm-control-room/assets/')
  })

  it('reloads the virtual snapshot module when a dev snapshot is created, changed, or deleted', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'gtm-snapshot-dev-'))
    temporaryDirectories.push(directory)
    const snapshotPath = join(directory, 'clay-snapshot.json')
    const server = await createServer({
      ...createViteConfig({ snapshotPath, base: '/' }),
      configFile: false,
      root: process.cwd(),
      logLevel: 'silent',
      server: { host: '127.0.0.1', port: 0 },
    })
    const browser = await chromium.launch()

    try {
      await server.listen()
      const origin = server.resolvedUrls?.local[0]
      if (!origin) throw new Error('Vite did not expose a local dev URL')
      const page = await browser.newPage()

      await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 10_000 })
      await page.getByText('Unavailable scored accounts', { exact: true }).waitFor({ timeout: 10_000 })

      await createSnapshotWriter(snapshotPath)(await snapshotWithScoredAccounts(61))
      await page.getByText('61 scored', { exact: true }).waitFor({ timeout: 10_000 })

      await createSnapshotWriter(snapshotPath)(await snapshotWithScoredAccounts(62))
      await page.getByText('62 scored', { exact: true }).waitFor({ timeout: 10_000 })

      await unlink(snapshotPath)
      await page.getByText('Unavailable scored accounts', { exact: true }).waitFor({ timeout: 10_000 })
    } finally {
      await browser.close()
      await server.close()
    }
  }, 25_000)
})
