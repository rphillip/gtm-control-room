import type { ClaySnapshot, PublicClaySnapshot } from './types'

const aggregateKeys = [
  'signalsActive', 'signalsErrored', 'scoredAccounts', 'newHireEvents', 'scoreTiers', 'intentTiers',
  'injuryTiers', 'blsInjuryRows', 'sampledActionHealth', 'cmsFacilities', 'chspSystems',
  'healthSystemWorkingRows', 'matureTargets', 'immatureTargets', 'payerProviders', 'campaigns',
] as const

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function finiteCount(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined
}

function normalizeSignals(value: unknown): ClaySnapshot['signals'] | undefined {
  if (!Array.isArray(value)) return undefined
  const signals = value.map((item) => {
    const signal = record(item)
    return typeof signal?.name === 'string' && typeof signal.type === 'string' &&
      (signal.status === 'Active' || signal.status === 'Errored') && typeof signal.cadence === 'string' &&
      (signal.inputKind === 'table' || signal.inputKind === 'audience')
      ? { name: signal.name, type: signal.type, status: signal.status, cadence: signal.cadence, inputKind: signal.inputKind }
      : undefined
  })
  return signals.every(Boolean) ? signals as ClaySnapshot['signals'] : undefined
}

function normalizeWorkflows(value: unknown): ClaySnapshot['workflows'] | undefined {
  if (!Array.isArray(value)) return undefined
  const workflows = value.map((item) => {
    const workflow = record(item)
    if (typeof workflow?.name !== 'string' || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) return undefined
    const nodes = workflow.nodes.map((node) => {
      const item = record(node)
      return typeof item?.name === 'string' && typeof item.type === 'string' ? { name: item.name, type: item.type } : undefined
    })
    if (!nodes.every(Boolean) || !nodes.length) return undefined
    const edges = workflow.edges.map((edge) => Array.isArray(edge) && edge.length === 2 && Number.isInteger(edge[0]) && Number.isInteger(edge[1]) && edge[0] >= 0 && edge[1] >= 0 && edge[0] < nodes.length && edge[1] < nodes.length ? [edge[0], edge[1]] as [number, number] : undefined)
    return edges.every(Boolean) ? { name: workflow.name, nodes: nodes as ClaySnapshot['workflows'][number]['nodes'], edges: edges as [number, number][] } : undefined
  })
  return workflows.every(Boolean) ? workflows as ClaySnapshot['workflows'] : undefined
}

function normalizeAggregates(value: unknown): ClaySnapshot['aggregates'] | undefined {
  const source = record(value)
  if (!source) return undefined
  const aggregates: ClaySnapshot['aggregates'] = {}
  for (const key of aggregateKeys) {
    const item = source[key]
    if (finiteCount(item) !== undefined) aggregates[key] = item as number
    else if (record(item) && Object.values(item as Record<string, unknown>).every((count) => finiteCount(count) !== undefined)) {
      aggregates[key] = item as Record<string, number>
    }
  }
  return aggregates
}

export function normalizePublicSnapshot(value: unknown): PublicClaySnapshot | undefined {
  const source = record(value)
  if (!source) return undefined
  const fn = record(source.function)
  const normalized: PublicClaySnapshot = {
    signals: normalizeSignals(source.signals),
    workflows: normalizeWorkflows(source.workflows),
    aggregates: normalizeAggregates(source.aggregates),
  }
  if (fn?.name === 'AutoTier' && typeof fn.contract === 'string') normalized.function = { name: 'AutoTier', contract: fn.contract }
  return normalized
}
