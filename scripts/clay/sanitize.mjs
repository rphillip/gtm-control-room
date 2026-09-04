const PRIVATE_ID = /\b(?:wf_|wfn_|td_|sig_|t_|f_|wb_|rec_)[A-Za-z0-9_-]+\b/
const URL = /\b(?:https?|ftp):\/\/|\bwww\./i
const CREDENTIAL = /\b(?:bearer\s+[A-Za-z0-9._~-]+|api[_-]?key|access[_-]?token|private[_-]?key)\b/i

const FORBIDDEN_OUTPUT_KEYS = new Set([
  'id',
  'url',
  'contentpreview',
  'prompt',
  'email',
  'phone',
  'rows',
  'row',
  'credentials',
  'credential',
  'authorization',
  'apikey',
  'token',
  'secret',
  'password',
])

const ALLOWED_SIGNALS = new Map([
  ['Event: Company topic intent', 'CompanyTopicIntent'],
  ['Event: Job posting', 'JobPost'],
  ['Event: New hire', 'NewHire'],
  ['OSHA news', 'News'],
])
const ALLOWED_STATUSES = new Set(['Active', 'Errored'])
const ALLOWED_INPUT_KINDS = new Set(['table', 'audience'])
const ALLOWED_CADENCES = new Set(['quarterly'])
const PUBLIC_FUNCTION_NAME = 'AutoTier'
const PUBLIC_FUNCTION_CONTRACT = 'Value + company domain + scoring dimension → tier'
const NORMALIZED_ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const ALLOWED_WORKFLOWS = new Map([
  [
    'Turquoise Immature',
    {
      nodes: new Map([
        ['Segment', 'trigger'],
        ['Has company identifier?', 'conditional'],
        ['Mark no company identifier', 'tool'],
        ['Find contacts at company', 'tool'],
        ['Add contact to Audiences', 'tool'],
      ]),
      edges: [
        ['Segment', 'Has company identifier?'],
        ['Has company identifier?', 'Mark no company identifier'],
        ['Has company identifier?', 'Find contacts at company'],
        ['Find contacts at company', 'Add contact to Audiences'],
      ],
    },
  ],
  [
    'Turquoise Operator Enrichment',
    {
      nodes: new Map([
        ['Segment', 'trigger'],
        ['Operator Send Research', 'agent'],
        ['Write LinkedIn Message', 'agent'],
        ['Save To Audience Record', 'tool'],
      ]),
      edges: [
        ['Segment', 'Operator Send Research'],
        ['Operator Send Research', 'Write LinkedIn Message'],
        ['Write LinkedIn Message', 'Save To Audience Record'],
      ],
    },
  ],
])

const AGGREGATE_SCHEMA = new Map([
  ['signalsActive', null],
  ['signalsErrored', null],
  ['scoredAccounts', null],
  ['newHireEvents', null],
  ['scoreTiers', new Set(['High', 'Medium', 'Low'])],
  ['intentTiers', new Set(['High', 'Medium', 'Low', 'Unclassified'])],
  ['injuryTiers', new Set(['High', 'Medium', 'Low'])],
  ['blsInjuryRows', null],
  ['sampledActionHealth', new Set(['sampled', 'succeeded', 'errored'])],
  ['cmsFacilities', null],
  ['chspSystems', null],
  ['healthSystemWorkingRows', null],
  ['matureTargets', null],
  ['immatureTargets', null],
  ['payerProviders', null],
  ['campaigns', null],
])

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function edgeKey(source, target) {
  return `${source}\u0000${target}`
}

function assertExactKeys(value, keys, label) {
  if (!isObject(value)) throw new Error(`${label} is invalid`)
  const expected = new Set(keys)
  if (Object.keys(value).length !== expected.size || Object.keys(value).some((key) => !expected.has(key))) {
    throw new Error(`Unknown snapshot field in ${label}`)
  }
}

function sanitizeSignals(signals) {
  if (!Array.isArray(signals)) throw new Error('Signals must be an array')

  return signals.map((item) => {
    if (!isObject(item) || !ALLOWED_SIGNALS.has(item.name)) {
      throw new Error('Signal allowlist rejected an entry')
    }
    if (!isObject(item.signal) || item.signal.type !== ALLOWED_SIGNALS.get(item.name)) {
      throw new Error('Signal type is invalid')
    }
    if (!ALLOWED_STATUSES.has(item.runStatus)) throw new Error('Signal status is invalid')
    if (!ALLOWED_INPUT_KINDS.has(item.inputKind)) throw new Error('Signal input kind is invalid')
    if (!isObject(item.schedule) || !ALLOWED_CADENCES.has(item.schedule.periodUnit)) {
      throw new Error('Signal cadence is invalid')
    }

    return {
      name: item.name,
      type: item.signal.type,
      status: item.runStatus,
      cadence: item.schedule.periodUnit,
      inputKind: item.inputKind,
    }
  })
}

function sanitizeWorkflows(workflows) {
  if (!Array.isArray(workflows) || workflows.length !== ALLOWED_WORKFLOWS.size) {
    throw new Error('Workflow cardinality is invalid')
  }

  const byName = new Map()
  for (const workflow of workflows) {
    if (!isObject(workflow) || typeof workflow.name !== 'string' || !ALLOWED_WORKFLOWS.has(workflow.name) || byName.has(workflow.name)) {
      throw new Error('Workflow allowlist rejected an entry')
    }
    byName.set(workflow.name, workflow)
  }

  return [...ALLOWED_WORKFLOWS].map(([name, definition]) => sanitizeWorkflow(byName.get(name), name, definition))
}

function assertConnectedDag(nodes, edges) {
  const undirected = new Map(nodes.map((name) => [name, new Set()]))
  const directed = new Map(nodes.map((name) => [name, []]))
  for (const [source, target] of edges) {
    undirected.get(source).add(target)
    undirected.get(target).add(source)
    directed.get(source).push(target)
  }
  const reachable = new Set()
  const pending = [nodes[0]]
  while (pending.length) {
    const node = pending.pop()
    if (reachable.has(node)) continue
    reachable.add(node)
    pending.push(...undirected.get(node))
  }
  if (reachable.size !== nodes.length) throw new Error('Workflow graph must be connected')

  const visiting = new Set()
  const visited = new Set()
  const visit = (node) => {
    if (visiting.has(node)) throw new Error('Workflow graph must be a DAG')
    if (visited.has(node)) return
    visiting.add(node)
    directed.get(node).forEach(visit)
    visiting.delete(node)
    visited.add(node)
  }
  nodes.forEach(visit)
}

function sanitizeWorkflow(workflow, name, definition) {
  if (!isObject(workflow) || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) {
    throw new Error('Workflow nodes are invalid')
  }
  if (workflow.nodes.length !== definition.nodes.size) throw new Error('Workflow node set is invalid')
  if (workflow.edges.length !== definition.edges.length) throw new Error('Workflow edge shape is invalid')

  const nodesById = new Map()
  const names = new Set()
  for (const node of workflow.nodes) {
    if (
      !isObject(node) || typeof node.id !== 'string' || !definition.nodes.has(node.name) ||
      node.nodeType !== definition.nodes.get(node.name) || nodesById.has(node.id) || names.has(node.name)
    ) throw new Error('Workflow node allowlist rejected an entry')
    nodesById.set(node.id, node.name)
    names.add(node.name)
  }
  if (names.size !== definition.nodes.size || [...definition.nodes.keys()].some((nodeName) => !names.has(nodeName))) {
    throw new Error('Workflow node set is invalid')
  }

  const expectedEdges = new Set(definition.edges.map(([source, target]) => edgeKey(source, target)))
  const actualEdges = []
  const seenEdges = new Set()
  for (const edge of workflow.edges) {
    if (!isObject(edge) || typeof edge.sourceNodeId !== 'string' || typeof edge.targetNodeId !== 'string') {
      throw new Error('Workflow edge is invalid')
    }
    const source = nodesById.get(edge.sourceNodeId)
    const target = nodesById.get(edge.targetNodeId)
    const key = edgeKey(source, target)
    if (!source || !target || source === target || seenEdges.has(key)) throw new Error('Workflow edge is invalid')
    seenEdges.add(key)
    actualEdges.push([source, target])
  }
  if (seenEdges.size !== expectedEdges.size || [...expectedEdges].some((key) => !seenEdges.has(key))) {
    throw new Error('Workflow edge shape is invalid')
  }
  assertConnectedDag([...definition.nodes.keys()], actualEdges)

  const canonicalNodes = [...definition.nodes].map(([nodeName, type]) => ({ name: nodeName, type }))
  const canonicalIndex = new Map(canonicalNodes.map((node, index) => [node.name, index]))
  return {
    name,
    nodes: canonicalNodes,
    edges: definition.edges.map(([source, target]) => [canonicalIndex.get(source), canonicalIndex.get(target)]),
  }
}

function sanitizeFunction(value) {
  const requiredInputs = ['Value', 'ClayDomain', 'Column Name']
  const properties = value?.inputSchema?.properties
  if (
    !isObject(value) ||
    value.name !== PUBLIC_FUNCTION_NAME ||
    !isObject(value.inputSchema) ||
    !isObject(properties) ||
    !requiredInputs.every((name) => Object.hasOwn(properties, name))
  ) {
    throw new Error('Function shape is invalid')
  }

  return {
    name: PUBLIC_FUNCTION_NAME,
    contract: PUBLIC_FUNCTION_CONTRACT,
  }
}

function assertAggregateNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error('Aggregate value is invalid')
  }
  return value
}

function sanitizeAggregates(aggregates) {
  if (!isObject(aggregates)) throw new Error('Aggregates must be an object')

  const safe = {}
  for (const [name, value] of Object.entries(aggregates)) {
    if (!AGGREGATE_SCHEMA.has(name)) throw new Error('Aggregate allowlist rejected an entry')
    const nestedSchema = AGGREGATE_SCHEMA.get(name)
    if (nestedSchema === null) {
      safe[name] = assertAggregateNumber(value)
      continue
    }
    if (!isObject(value)) throw new Error('Aggregate value is invalid')
    if (
      Object.keys(value).length !== nestedSchema.size ||
      [...nestedSchema].some((nestedName) => !Object.hasOwn(value, nestedName))
    ) {
      throw new Error('Aggregate shape is invalid')
    }

    const nested = {}
    for (const [nestedName, nestedValue] of Object.entries(value)) {
      if (!nestedSchema.has(nestedName)) {
        throw new Error('Aggregate allowlist rejected a nested entry')
      }
      nested[nestedName] = assertAggregateNumber(nestedValue)
    }
    safe[name] = nested
    if (name === 'sampledActionHealth' && nested.succeeded + nested.errored !== nested.sampled) {
      throw new Error('Sampled action health totals are inconsistent')
    }
  }
  return safe
}

function assertPublicSafe(value, path = 'snapshot') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertPublicSafe(item, `${path}[${index}]`))
    return
  }
  if (isObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (FORBIDDEN_OUTPUT_KEYS.has(key.toLowerCase())) {
        throw new Error(`Sanitized output contains forbidden field at ${path}.${key}`)
      }
      assertPublicSafe(nested, `${path}.${key}`)
    }
    return
  }
  if (typeof value === 'string' && (PRIVATE_ID.test(value) || URL.test(value) || CREDENTIAL.test(value))) {
    throw new Error(`Sanitized output contains private content at ${path}`)
  }
}

export function sanitizeClay(raw) {
  if (!isObject(raw)) throw new Error('Clay snapshot input must be an object')

  const safe = {
    generatedAt: new Date().toISOString(),
    signals: sanitizeSignals(raw.signals),
    function: sanitizeFunction(raw.function),
    workflows: sanitizeWorkflows(raw.workflows),
    aggregates: sanitizeAggregates(raw.aggregates),
  }
  assertPublicSafe(safe)
  return safe
}

export function assertPublicClaySnapshot(value) {
  assertPublicSafe(value)
  assertExactKeys(value, ['generatedAt', 'signals', 'function', 'workflows', 'aggregates'], 'snapshot')
  if (
    typeof value.generatedAt !== 'string' ||
    !NORMALIZED_ISO_TIMESTAMP.test(value.generatedAt) ||
    Number.isNaN(Date.parse(value.generatedAt)) ||
    new Date(value.generatedAt).toISOString() !== value.generatedAt
  ) throw new Error('Snapshot generatedAt is invalid')
  assertPublicSignals(value.signals)
  assertPublicFunction(value.function)
  assertPublicWorkflows(value.workflows)
  sanitizeAggregates(value.aggregates)
}

function assertPublicSignals(signals) {
  if (!Array.isArray(signals)) throw new Error('Snapshot signals are invalid')
  for (const signal of signals) {
    assertExactKeys(signal, ['name', 'type', 'status', 'cadence', 'inputKind'], 'signal')
    if (
      !ALLOWED_SIGNALS.has(signal.name) || signal.type !== ALLOWED_SIGNALS.get(signal.name) ||
      !ALLOWED_STATUSES.has(signal.status) || !ALLOWED_CADENCES.has(signal.cadence) ||
      !ALLOWED_INPUT_KINDS.has(signal.inputKind)
    ) throw new Error('Snapshot signal is invalid')
  }
}

function assertPublicFunction(fn) {
  assertExactKeys(fn, ['name', 'contract'], 'function')
  if (fn.name !== PUBLIC_FUNCTION_NAME || fn.contract !== PUBLIC_FUNCTION_CONTRACT) throw new Error('Snapshot function is invalid')
}

function assertPublicWorkflows(workflows) {
  if (!Array.isArray(workflows) || workflows.length !== ALLOWED_WORKFLOWS.size) {
    throw new Error('Snapshot workflow cardinality is invalid')
  }
  const seen = new Set()
  for (const workflow of workflows) {
    assertExactKeys(workflow, ['name', 'nodes', 'edges'], 'workflow')
    const definition = ALLOWED_WORKFLOWS.get(workflow.name)
    if (!definition || seen.has(workflow.name)) throw new Error('Snapshot workflow is invalid')
    seen.add(workflow.name)
    if (!Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges) || workflow.nodes.length !== definition.nodes.size || workflow.edges.length !== definition.edges.length) {
      throw new Error('Snapshot workflow topology is invalid')
    }
    const names = new Set()
    for (const node of workflow.nodes) {
      assertExactKeys(node, ['name', 'type'], 'workflow node')
      if (!definition.nodes.has(node.name) || definition.nodes.get(node.name) !== node.type || names.has(node.name)) {
        throw new Error('Snapshot workflow node is invalid')
      }
      names.add(node.name)
    }
    const expectedEdges = new Set(definition.edges.map(([source, target]) => edgeKey(source, target)))
    const actualEdges = []
    const seenEdges = new Set()
    for (const edge of workflow.edges) {
      if (!Array.isArray(edge) || edge.length !== 2 || !Number.isInteger(edge[0]) || !Number.isInteger(edge[1])) {
        throw new Error('Snapshot workflow edge is invalid')
      }
      const [sourceIndex, targetIndex] = edge
      const source = workflow.nodes[sourceIndex]?.name
      const target = workflow.nodes[targetIndex]?.name
      const key = edgeKey(source, target)
      if (!source || !target || source === target || seenEdges.has(key)) throw new Error('Snapshot workflow edge is invalid')
      seenEdges.add(key)
      actualEdges.push([source, target])
    }
    if (seenEdges.size !== expectedEdges.size || [...expectedEdges].some((key) => !seenEdges.has(key))) {
      throw new Error('Snapshot workflow topology is invalid')
    }
    assertConnectedDag([...definition.nodes.keys()], actualEdges)
  }
}
