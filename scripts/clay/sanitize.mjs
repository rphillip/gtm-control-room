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

const ALLOWED_WORKFLOW_NODES = new Map([
  [
    'Turquoise Immature',
    new Map([
      ['Segment', 'trigger'],
      ['Has company identifier?', 'conditional'],
      ['Mark no company identifier', 'tool'],
      ['Find contacts at company', 'tool'],
      ['Add contact to Audiences', 'tool'],
    ]),
  ],
  [
    'Turquoise Operator Enrichment',
    new Map([
      ['Segment', 'trigger'],
      ['Operator Send Research', 'agent'],
      ['Write LinkedIn Message', 'agent'],
      ['Save To Audience Record', 'tool'],
    ]),
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
  if (!Array.isArray(workflows)) throw new Error('Workflows must be an array')

  return workflows.map((workflow) => {
    if (!isObject(workflow) || !ALLOWED_WORKFLOW_NODES.has(workflow.name)) {
      throw new Error('Workflow allowlist rejected an entry')
    }
    if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      throw new Error('Workflow nodes are invalid')
    }
    if (!Array.isArray(workflow.edges)) throw new Error('Workflow edges are invalid')

    const allowedNodes = ALLOWED_WORKFLOW_NODES.get(workflow.name)
    const nodeIndex = new Map()
    const nodes = workflow.nodes.map((node, index) => {
      if (
        !isObject(node) ||
        typeof node.id !== 'string' ||
        !allowedNodes.has(node.name) ||
        node.nodeType !== allowedNodes.get(node.name) ||
        nodeIndex.has(node.id)
      ) {
        throw new Error('Workflow node allowlist rejected an entry')
      }
      nodeIndex.set(node.id, index)
      return { name: node.name, type: node.nodeType }
    })

    const seenEdges = new Set()
    const edges = workflow.edges.map((edge) => {
      if (
        !isObject(edge) ||
        typeof edge.sourceNodeId !== 'string' ||
        typeof edge.targetNodeId !== 'string' ||
        !nodeIndex.has(edge.sourceNodeId) ||
        !nodeIndex.has(edge.targetNodeId) ||
        edge.sourceNodeId === edge.targetNodeId
      ) {
        throw new Error('Workflow edge is invalid')
      }
      const edgeKey = `${edge.sourceNodeId}\u0000${edge.targetNodeId}`
      if (seenEdges.has(edgeKey)) throw new Error('Workflow edge is duplicated')
      seenEdges.add(edgeKey)
      return [nodeIndex.get(edge.sourceNodeId), nodeIndex.get(edge.targetNodeId)]
    })

    return { name: workflow.name, nodes, edges }
  })
}

function sanitizeFunction(value) {
  const requiredInputs = ['Value', 'ClayDomain', 'Column Name']
  const properties = value?.inputSchema?.properties
  if (
    !isObject(value) ||
    value.name !== 'AutoTier' ||
    !isObject(value.inputSchema) ||
    !isObject(properties) ||
    !requiredInputs.every((name) => Object.hasOwn(properties, name))
  ) {
    throw new Error('Function shape is invalid')
  }

  return {
    name: 'AutoTier',
    contract: 'Value + company domain + scoring dimension → tier',
  }
}

function assertAggregateNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
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
}
