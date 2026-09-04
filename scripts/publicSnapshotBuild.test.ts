// @vitest-environment node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { build } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

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
})
