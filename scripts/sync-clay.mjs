import { randomUUID } from 'node:crypto'
import { lstat, open, rename, unlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { runClay } from './clay/commands.mjs'
import { assertPublicClaySnapshot, sanitizeClay } from './clay/sanitize.mjs'

const WORKBOOK_NAMES = ['Week 2', 'Week 3']
const SIGNAL_COUNTS = new Map([
  ['Event: Company topic intent', 1],
  ['Event: Job posting', 2],
  ['Event: New hire', 2],
  ['OSHA news', 1],
])
const WORKFLOW_NAMES = ['Turquoise Immature', 'Turquoise Operator Enrichment']
const FUNCTION_NAME = 'AutoTier'
const SNAPSHOT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/clay-snapshot.json',
)

const TABLE_NAMES = {
  blsInjury: '⚡️BLS Industry Injury Rate',
  cmsFacilities: '⚡️ Import data - CMS',
  chspSystems: 'chsp-Health Systems',
  healthSystemWorking: 'Turquoise Health Systems',
  matureTargets: 'Turquoise Mature Table',
  immatureTargets: 'Turquoise Immature Table',
  payerProviders: 'Turquoise Payer Providers Table',
}

const SCORE_COLUMNS = {
  final: 'Score Tier',
  intent: 'Intent Score Tier',
  injury: 'Injury Rate Tier',
  sampledAction: 'AutoTier Intent Score',
}

function assertDataPage(value, label) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.data)) {
    throw new Error(`${label} response is malformed`)
  }
  return value
}

const MAX_CLAY_PAGES = 25

export async function listAllClayPages(prefix, limit, execute = runClay) {
  const data = []
  const seenCursors = new Set()
  let pageCount = 0
  let cursor
  do {
    if (pageCount >= MAX_CLAY_PAGES) throw new Error('Clay pagination exceeded the page limit')
    pageCount += 1
    const args = [...prefix, '--limit', String(limit)]
    if (cursor) args.push('--cursor', cursor)
    const page = assertDataPage(await execute(args), 'Clay list')
    data.push(...page.data)
    cursor = page.cursor
    if (cursor !== undefined && typeof cursor !== 'string') {
      throw new Error('Clay pagination cursor is malformed')
    }
    if (cursor && seenCursors.has(cursor)) throw new Error('Clay pagination cursor repeated')
    if (cursor) seenCursors.add(cursor)
  } while (cursor)
  return data
}

export function resolveExactName(items, expectedName, label) {
  if (!Array.isArray(items)) throw new Error(`${label} inventory is malformed`)
  const matches = items.filter((item) => item?.name === expectedName)
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label} named ${expectedName}`)
  }
  return matches[0]
}

export function parseTierCounts(value, expectedLabels) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.results)) {
    throw new Error('Tier aggregate response is malformed')
  }
  const allowed = new Set(expectedLabels)
  const counts = {}
  for (const row of value.results) {
    const label = row?.tier === null ? 'Unclassified' : row?.tier
    const count = row?.count
    if (
      typeof label !== 'string' ||
      !allowed.has(label) ||
      Object.hasOwn(counts, label) ||
      !((typeof count === 'string' && /^(?:0|[1-9]\d*)$/.test(count)) ||
        (Number.isInteger(count) && count >= 0))
    ) {
      throw new Error('Tier aggregate contains an invalid label or count')
    }
    counts[label] = Number(count)
  }
  if (expectedLabels.some((label) => !Object.hasOwn(counts, label))) {
    throw new Error('Tier aggregate is missing an expected label')
  }
  return Object.fromEntries(expectedLabels.map((label) => [label, counts[label]]))
}

function inferInputKind(signal) {
  if (signal?.input?.table && signal.input.audiences === null) return 'table'
  if (signal?.input?.audiences && signal.input.table === null) return 'audience'
  throw new Error('Signal input kind is invalid')
}

function assertId(value, label) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} identifier is missing`)
  return value
}

function assertInsideWorkbook(resource, tableIds, label) {
  const id = assertId(resource?.id, label)
  if (!tableIds.has(id)) throw new Error(`${label} is outside the resolved workbook`)
  return resource
}

async function getTableRowCount(table) {
  const metadata = await runClay(['tables', 'get', assertId(table?.id, 'table')])
  if (!metadata || typeof metadata !== 'object' || !Number.isInteger(metadata.rowCount) || metadata.rowCount < 0) {
    throw new Error('Table row count is invalid')
  }
  return metadata.rowCount
}

async function queryTierCounts(tableId, columnName, labels) {
  const query = `SELECT {{${columnName}}} AS tier, COUNT(*) AS count GROUP BY {{${columnName}}}`
  return parseTierCounts(
    await runClay(['tables', 'query-live', tableId, '--query', query]),
    labels,
  )
}

async function getSampledActionHealth(tableId) {
  const columns = assertDataPage(
    await runClay(['tables', 'columns', 'get', tableId]),
    'tables columns get',
  ).data
  const actionColumn = resolveExactName(columns, SCORE_COLUMNS.sampledAction, 'column')
  const actionColumnId = assertId(actionColumn.id, 'sampled action column')
  const rows = assertDataPage(
    await runClay(['tables', 'rows', 'list', tableId, '--limit', '10']),
    'tables rows list',
  ).data
  if (rows.length !== 10) throw new Error('Sampled action health requires exactly ten rows')

  let succeeded = 0
  let errored = 0
  for (const row of rows) {
    const status = row?.cells?.[actionColumnId]?.status
    if (status === 'success') succeeded += 1
    else if (status === 'error') errored += 1
    else throw new Error('Sampled action health contains an unsupported status')
  }
  return { sampled: rows.length, succeeded, errored }
}

async function collectSignals() {
  const response = assertDataPage(await runClay(['signals', 'list']), 'signals list')
  const selected = response.data.filter((signal) => SIGNAL_COUNTS.has(signal?.name))
  for (const [name, expectedCount] of SIGNAL_COUNTS) {
    if (selected.filter((signal) => signal.name === name).length !== expectedCount) {
      throw new Error(`Expected ${expectedCount} approved signal entries named ${name}`)
    }
  }

  return Promise.all(
    selected.map(async (signal) => {
      const detail = await runClay(['signals', 'get', assertId(signal.id, 'signal')])
      if (detail?.name !== signal.name) throw new Error('Signal detail name does not match inventory')
      return { ...detail, inputKind: inferInputKind(detail) }
    }),
  )
}

async function collectFunction() {
  const functions = await listAllClayPages(
    ['functions', 'list', '--filter', 'source=custom'],
    100,
  )
  const selected = resolveExactName(functions, FUNCTION_NAME, 'function')
  const detail = await runClay(['functions', 'get', assertId(selected.id, 'function')])
  if (detail?.name !== FUNCTION_NAME) throw new Error('Function detail name does not match inventory')
  return detail
}

async function collectWorkflows() {
  const inventory = await listAllClayPages(['workflows', 'list'], 200)
  return Promise.all(
    WORKFLOW_NAMES.map(async (name) => {
      const workflow = resolveExactName(inventory, name, 'workflow')
      const graph = await runClay([
        'workflows',
        'graph',
        'get',
        assertId(workflow.id, 'workflow'),
        '--mode',
        'summary',
      ])
      const summary = graph?.summary
      if (summary?.workflowName !== name) throw new Error('Workflow graph name does not match inventory')
      return { name, nodes: summary.nodes, edges: summary.edges }
    }),
  )
}

async function collectCampaignCount() {
  return (await listAllClayPages(['campaigns', 'list'], 100)).length
}

async function collectNamedResources() {
  const workbooks = await listAllClayPages(['workbooks', 'list'], 100)
  const week2 = resolveExactName(workbooks, WORKBOOK_NAMES[0], 'workbook')
  const week3 = resolveExactName(workbooks, WORKBOOK_NAMES[1], 'workbook')
  const week2Id = assertId(week2.id, 'Week 2 workbook')
  const week3Id = assertId(week3.id, 'Week 3 workbook')

  const [week2Tables, week3Tables] = await Promise.all([
    listAllClayPages(['tables', 'list', '--filter', `workbook.id=${week2Id}`], 100),
    listAllClayPages(['tables', 'list', '--filter', `workbook.id=${week3Id}`], 100),
  ])

  return {
    week2Tables,
    week3Tables,
    week2TableIds: new Set(week2Tables.map((table) => assertId(table.id, 'Week 2 table'))),
  }
}

async function collectAggregates(signals, resources) {
  const tableSignal = signals.find(
    (signal) => signal.name === 'Event: New hire' && signal.inputKind === 'table',
  )
  if (!tableSignal) throw new Error('The approved table-based new-hire signal is missing')

  const scoredTableId = assertId(tableSignal.input?.table?.id, 'scored account table')
  if (!resources.week2TableIds.has(scoredTableId)) {
    throw new Error('Scored account table is outside Week 2')
  }
  const eventTable = assertInsideWorkbook(
    { id: tableSignal.destinationTable?.id },
    resources.week2TableIds,
    'new-hire event table',
  )

  const blsTable = resolveExactName(resources.week2Tables, TABLE_NAMES.blsInjury, 'table')
  const cmsTable = resolveExactName(resources.week3Tables, TABLE_NAMES.cmsFacilities, 'table')
  const chspTable = resolveExactName(resources.week3Tables, TABLE_NAMES.chspSystems, 'table')
  const workingTable = resolveExactName(
    resources.week3Tables,
    TABLE_NAMES.healthSystemWorking,
    'table',
  )
  const matureTable = resolveExactName(resources.week3Tables, TABLE_NAMES.matureTargets, 'table')
  const immatureTable = resolveExactName(resources.week3Tables, TABLE_NAMES.immatureTargets, 'table')
  const payerTable = resolveExactName(resources.week3Tables, TABLE_NAMES.payerProviders, 'table')

  const [
    scoreTiers,
    intentTiers,
    injuryTiers,
    sampledActionHealth,
    newHireEvents,
    blsInjuryRows,
    cmsFacilities,
    chspSystems,
    healthSystemWorkingRows,
    matureTargets,
    immatureTargets,
    payerProviders,
    campaigns,
  ] = await Promise.all([
    queryTierCounts(scoredTableId, SCORE_COLUMNS.final, ['High', 'Medium', 'Low']),
    queryTierCounts(scoredTableId, SCORE_COLUMNS.intent, [
      'High',
      'Medium',
      'Low',
      'Unclassified',
    ]),
    queryTierCounts(scoredTableId, SCORE_COLUMNS.injury, ['High', 'Medium', 'Low']),
    getSampledActionHealth(scoredTableId),
    getTableRowCount(eventTable),
    getTableRowCount(blsTable),
    getTableRowCount(cmsTable),
    getTableRowCount(chspTable),
    getTableRowCount(workingTable),
    getTableRowCount(matureTable),
    getTableRowCount(immatureTable),
    getTableRowCount(payerTable),
    collectCampaignCount(),
  ])

  const scoredAccounts = Object.values(scoreTiers).reduce((sum, count) => sum + count, 0)
  return {
    signalsActive: signals.filter((signal) => signal.runStatus === 'Active').length,
    signalsErrored: signals.filter((signal) => signal.runStatus === 'Errored').length,
    scoredAccounts,
    newHireEvents,
    scoreTiers,
    intentTiers,
    injuryTiers,
    blsInjuryRows,
    sampledActionHealth,
    cmsFacilities,
    chspSystems,
    healthSystemWorkingRows,
    matureTargets,
    immatureTargets,
    payerProviders,
    campaigns,
  }
}

export async function buildClaySnapshot() {
  const resources = await collectNamedResources()
  const [signals, functionDefinition, workflows] = await Promise.all([
    collectSignals(),
    collectFunction(),
    collectWorkflows(),
  ])
  const aggregates = await collectAggregates(signals, resources)
  return sanitizeClay({ signals, function: functionDefinition, workflows, aggregates })
}

async function assertRegularDestination(destination) {
  try {
    const metadata = await lstat(destination)
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error('Snapshot destination must be a regular file')
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}

export function createSnapshotWriter(canonicalDestination) {
  const canonicalPath = resolve(canonicalDestination)

  return async function writeSnapshotFile(snapshot, destination = canonicalPath) {
    if (resolve(destination) !== canonicalPath) throw new Error('Snapshot destination must be the canonical output path')
    assertPublicClaySnapshot(snapshot)
    const serialized = `${JSON.stringify(snapshot, null, 2)}\n`
    const destinationDirectory = dirname(canonicalPath)
    const parent = await lstat(destinationDirectory)
    if (!parent.isDirectory() || parent.isSymbolicLink()) {
      throw new Error('Snapshot parent must be a real directory')
    }
    const temporaryPath = resolve(
      destinationDirectory,
      `.clay-snapshot.${process.pid}.${randomUUID()}.tmp`,
    )
    await assertRegularDestination(canonicalPath)

    let temporaryFile
    try {
      temporaryFile = await open(temporaryPath, 'wx', 0o644)
      await temporaryFile.writeFile(serialized, 'utf8')
      await temporaryFile.sync()
      await temporaryFile.close()
      temporaryFile = undefined

      await assertRegularDestination(canonicalPath)
      await rename(temporaryPath, canonicalPath)
    } finally {
      if (temporaryFile) await temporaryFile.close().catch(() => undefined)
      await unlink(temporaryPath).catch((error) => {
        if (error?.code !== 'ENOENT') throw error
      })
    }
  }
}

export const writeSnapshotFile = createSnapshotWriter(SNAPSHOT_PATH)

export async function runSyncCli({
  build = buildClaySnapshot,
  write = writeSnapshotFile,
  stdout = process.stdout,
  stderr = process.stderr,
} = {}) {
  try {
    const snapshot = await build()
    await write(snapshot)
    stdout.write('Wrote sanitized Clay snapshot.\n')
    return 0
  } catch {
    stderr.write('Clay sync failed.\n')
    return 1
  }
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (entry === import.meta.url) {
  runSyncCli().then((exitCode) => {
    process.exitCode = exitCode
  })
}
