import { lstat, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  listAllClayPages,
  parseTierCounts,
  resolveExactName,
  runSyncCli,
  writeSnapshotFile,
} from './sync-clay.mjs'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(async (directory) => {
      const { rm } = await import('node:fs/promises')
      await rm(directory, { recursive: true, force: true })
    }),
  )
})

describe('resolveExactName', () => {
  it('selects only the exact display name', () => {
    const selected = resolveExactName(
      [{ name: 'Week 2 archive' }, { name: 'Week 2' }],
      'Week 2',
      'workbook',
    )

    expect(selected).toEqual({ name: 'Week 2' })
  })

  it('rejects missing and ambiguous display names', () => {
    expect(() => resolveExactName([], 'Week 3', 'workbook')).toThrow(/exactly one workbook/i)
    expect(() =>
      resolveExactName([{ name: 'Week 3' }, { name: 'Week 3' }], 'Week 3', 'workbook'),
    ).toThrow(/exactly one workbook/i)
  })
})

describe('parseTierCounts', () => {
  it('maps a null tier to the public Unclassified bucket', () => {
    expect(
      parseTierCounts(
        {
          results: [
            { tier: 'High', count: '9' },
            { tier: 'Medium', count: '37' },
            { tier: 'Low', count: '7' },
            { tier: null, count: '7' },
          ],
        },
        ['High', 'Medium', 'Low', 'Unclassified'],
      ),
    ).toEqual({ High: 9, Medium: 37, Low: 7, Unclassified: 7 })
  })

  it('rejects unknown tiers and malformed counts', () => {
    expect(() =>
      parseTierCounts({ results: [{ tier: 'Critical', count: '1' }] }, ['High', 'Low']),
    ).toThrow(/tier aggregate/i)
    expect(() =>
      parseTierCounts({ results: [{ tier: 'High', count: '-1' }] }, ['High']),
    ).toThrow(/tier aggregate/i)
  })
})

describe('listAllClayPages', () => {
  it('does not include command arguments in malformed-page errors', async () => {
    let failure: unknown
    try {
      await listAllClayPages(
        ['tables', 'list', '--filter', 'workbook.id=wb_private_record'],
        100,
        async () => ({ error: 'raw row private@example.com' }),
      )
    } catch (error) {
      failure = error
    }

    const serialized = JSON.stringify({
      message: failure instanceof Error ? failure.message : failure,
      stack: failure instanceof Error ? failure.stack : undefined,
    })
    expect(serialized).toMatch(/response is malformed/i)
    expect(serialized).not.toMatch(/wb_private_record|private@example\.com/)
  })

  it('rejects a repeated pagination cursor', async () => {
    const execute = async () => ({ data: [], cursor: 'private-cursor' })

    await expect(listAllClayPages(['workbooks', 'list'], 100, execute)).rejects.toThrow(
      /pagination cursor repeated/i,
    )
  })

  it('rejects pagination beyond the page ceiling', async () => {
    let page = 0
    const execute = async () => ({ data: [], cursor: `cursor-${page++}` })

    await expect(listAllClayPages(['workbooks', 'list'], 100, execute)).rejects.toThrow(
      /page limit/i,
    )
    expect(page).toBe(25)
  })
})

describe('writeSnapshotFile', () => {
  it('atomically replaces a regular snapshot file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'clay-snapshot-test-'))
    temporaryDirectories.push(directory)
    const destination = join(directory, 'snapshot.json')
    await writeFile(destination, 'old', 'utf8')

    await writeSnapshotFile({ generatedAt: 'safe' }, destination)

    expect(await readFile(destination, 'utf8')).toBe('{\n  "generatedAt": "safe"\n}\n')
    expect((await lstat(destination)).isFile()).toBe(true)
  })

  it('rejects a symlink destination without modifying its target', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'clay-snapshot-test-'))
    temporaryDirectories.push(directory)
    const target = join(directory, 'target.json')
    const destination = join(directory, 'snapshot.json')
    await writeFile(target, 'sentinel', 'utf8')
    await symlink(target, destination)

    await expect(writeSnapshotFile({ generatedAt: 'safe' }, destination)).rejects.toThrow(
      /regular file/i,
    )

    expect(await readFile(target, 'utf8')).toBe('sentinel')
    expect((await lstat(destination)).isSymbolicLink()).toBe(true)
  })
})

describe('runSyncCli', () => {
  it('prints only a constant failure message when an unexpected error contains secrets', async () => {
    let stderr = ''
    const exitCode = await runSyncCli({
      build: async () => {
        throw new Error('t_private_record Bearer private-token private@example.com')
      },
      write: async () => undefined,
      stdout: { write: () => true },
      stderr: { write: (value: string) => ((stderr += value), true) },
    })

    expect(exitCode).toBe(1)
    expect(stderr).toBe('Clay sync failed.\n')
    expect(stderr).not.toMatch(/t_private_record|Bearer|private@example\.com/)
  })
})
