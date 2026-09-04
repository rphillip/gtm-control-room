import { describe, expect, it } from 'vitest'

import { assertPublicClaySnapshot, sanitizeClay } from './sanitize.mjs'

const validFunction = {
  name: 'AutoTier',
  inputSchema: {
    properties: {
      Value: {},
      ClayDomain: {},
      'Column Name': {},
    },
  },
}

function validRaw() {
  return {
    signals: [
      {
        id: 'td_private',
        name: 'Event: New hire',
        runStatus: 'Active',
        signal: { id: 'sig_private', type: 'NewHire' },
        inputKind: 'table',
        schedule: { id: 'schedule-private', periodUnit: 'quarterly' },
        prompt: 'discard this private prompt',
      },
    ],
    workflows: [
      {
        name: 'Turquoise Immature',
        url: 'https://private.example/workflow',
        nodes: [
          {
            id: 'wfn_trigger',
            name: 'Segment',
            nodeType: 'trigger',
            contentPreview: 'discard this private preview',
          },
          {
            id: 'wfn_condition',
            name: 'Has company identifier?',
            nodeType: 'conditional',
          },
          {
            id: 'wfn_missing',
            name: 'Mark no company identifier',
            nodeType: 'tool',
          },
          {
            id: 'wfn_find',
            name: 'Find contacts at company',
            nodeType: 'tool',
          },
          {
            id: 'wfn_add',
            name: 'Add contact to Audiences',
            nodeType: 'tool',
          },
        ],
        edges: [
          { sourceNodeId: 'wfn_trigger', targetNodeId: 'wfn_condition' },
          { sourceNodeId: 'wfn_condition', targetNodeId: 'wfn_missing' },
          { sourceNodeId: 'wfn_condition', targetNodeId: 'wfn_find' },
          { sourceNodeId: 'wfn_find', targetNodeId: 'wfn_add' },
        ],
      },
      {
        name: 'Turquoise Operator Enrichment',
        nodes: [
          { id: 'wfn_operator_trigger', name: 'Segment', nodeType: 'trigger' },
          { id: 'wfn_research', name: 'Operator Send Research', nodeType: 'agent' },
          { id: 'wfn_write', name: 'Write LinkedIn Message', nodeType: 'agent' },
          { id: 'wfn_save', name: 'Save To Audience Record', nodeType: 'tool' },
        ],
        edges: [
          { sourceNodeId: 'wfn_operator_trigger', targetNodeId: 'wfn_research' },
          { sourceNodeId: 'wfn_research', targetNodeId: 'wfn_write' },
          { sourceNodeId: 'wfn_write', targetNodeId: 'wfn_save' },
        ],
      },
    ],
    function: validFunction,
    aggregates: {
      scoredAccounts: 60,
      scoreTiers: { High: 11, Medium: 40, Low: 9 },
    },
  }
}

describe('sanitizeClay', () => {
  it('keeps approved aggregate topology while discarding unsafe source fields', () => {
    const safe = sanitizeClay(validRaw())

    expect(safe.signals[0]).toEqual({
      name: 'Event: New hire',
      type: 'NewHire',
      status: 'Active',
      cadence: 'quarterly',
      inputKind: 'table',
    })
    expect(safe.workflows[0]).toEqual({
      name: 'Turquoise Immature',
      nodes: [
        { name: 'Segment', type: 'trigger' },
        { name: 'Has company identifier?', type: 'conditional' },
        { name: 'Mark no company identifier', type: 'tool' },
        { name: 'Find contacts at company', type: 'tool' },
        { name: 'Add contact to Audiences', type: 'tool' },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [1, 3],
        [3, 4],
      ],
    })
    expect(safe.aggregates).toEqual({
      scoredAccounts: 60,
      scoreTiers: { High: 11, Medium: 40, Low: 9 },
    })
    expect(Number.isNaN(Date.parse(safe.generatedAt))).toBe(false)

    const serialized = JSON.stringify(safe)
    expect(serialized).not.toMatch(
      /td_private|sig_private|wfn_trigger|private\.example|private prompt|private preview/,
    )
  })

  it('rejects an unapproved signal name instead of silently filtering it', () => {
    const raw = validRaw()
    raw.signals[0].name = 'Customer export'

    expect(() => sanitizeClay(raw)).toThrow(/signal allowlist/i)
  })

  it.each([
    ['status', { runStatus: 'Paused' }],
    ['input kind', { inputKind: 'rows' }],
    ['cadence', { schedule: { periodUnit: 'hourly' } }],
    ['signal type', { signal: { type: 'Custom' } }],
  ])('rejects an invalid %s', (_label, replacement) => {
    const raw = validRaw()
    raw.signals[0] = { ...raw.signals[0], ...replacement }

    expect(() => sanitizeClay(raw)).toThrow(/signal/i)
  })

  it('rejects an unapproved workflow name with an otherwise valid function', () => {
    const raw = validRaw()
    raw.workflows[0].name = 'Customer Export'

    expect(() => sanitizeClay(raw)).toThrow(/workflow allowlist/i)
  })

  it.each([
    ['node name', { name: 'Export private contacts' }],
    ['node type', { nodeType: 'code' }],
  ])('rejects an unapproved workflow %s', (_label, replacement) => {
    const raw = validRaw()
    raw.workflows[0].nodes[0] = {
      ...raw.workflows[0].nodes[0],
      ...replacement,
    }

    expect(() => sanitizeClay(raw)).toThrow(/workflow node allowlist/i)
  })

  it('rejects a workflow edge whose endpoint is missing', () => {
    const raw = validRaw()
    raw.workflows[0].edges[0].targetNodeId = 'wfn_dangling'

    expect(() => sanitizeClay(raw)).toThrow(/workflow edge/i)
  })

  it.each([
    ['a partial node set', (raw) => raw.workflows[0].nodes.pop()],
    ['a duplicate node name', (raw) => { raw.workflows[0].nodes[4].name = 'Find contacts at company' }],
    ['a disconnected graph', (raw) => { raw.workflows[0].edges[3] = { sourceNodeId: 'wfn_missing', targetNodeId: 'wfn_find' } }],
    ['a missing required edge', (raw) => { raw.workflows[0].edges.pop() }],
    ['an extra edge', (raw) => raw.workflows[0].edges.push({ sourceNodeId: 'wfn_missing', targetNodeId: 'wfn_add' })],
    ['a reversed required edge', (raw) => { raw.workflows[0].edges[0] = { sourceNodeId: 'wfn_condition', targetNodeId: 'wfn_trigger' } }],
    ['a multi-node cycle', (raw) => {
      raw.workflows[0].edges = [
        { sourceNodeId: 'wfn_trigger', targetNodeId: 'wfn_condition' },
        { sourceNodeId: 'wfn_condition', targetNodeId: 'wfn_missing' },
        { sourceNodeId: 'wfn_missing', targetNodeId: 'wfn_condition' },
        { sourceNodeId: 'wfn_find', targetNodeId: 'wfn_add' },
      ]
    }],
  ])('rejects %s instead of publishing a different workflow topology', (_label, mutate) => {
    const raw = validRaw()
    mutate(raw)

    expect(() => sanitizeClay(raw)).toThrow(/workflow/i)
  })

  it.each([
    ['self-referential', { sourceNodeId: 'wfn_trigger', targetNodeId: 'wfn_trigger' }],
    ['duplicate', { sourceNodeId: 'wfn_trigger', targetNodeId: 'wfn_condition' }],
  ])('rejects a %s workflow edge', (_label, edge) => {
    const raw = validRaw()
    raw.workflows[0].edges.push(edge)

    expect(() => sanitizeClay(raw)).toThrow(/workflow edge/i)
  })

  it.each([
    ['a missing function', null],
    ['an unapproved function', { ...validFunction, name: 'ExportRows' }],
    [
      'a function missing a required input',
      {
        ...validFunction,
        inputSchema: { properties: { Value: {}, ClayDomain: {} } },
      },
    ],
  ])('rejects %s', (_label, value) => {
    const raw = validRaw()
    raw.function = value

    expect(() => sanitizeClay(raw)).toThrow(/function/i)
  })

  it.each([
    ['negative', -1],
    ['infinite', Number.POSITIVE_INFINITY],
    ['not-a-number', Number.NaN],
  ])('rejects a %s nested aggregate number', (_label, value) => {
    const raw = validRaw()
    raw.aggregates.scoreTiers.High = value

    expect(() => sanitizeClay(raw)).toThrow(/aggregate/i)
  })

  it('rejects aggregate fields outside the public schema', () => {
    const raw = validRaw()
    raw.aggregates.rawRowValues = { High: 1 }

    expect(() => sanitizeClay(raw)).toThrow(/aggregate allowlist/i)
  })

  it('rejects an incomplete nested aggregate shape', () => {
    const raw = validRaw()
    delete raw.aggregates.scoreTiers.Low

    expect(() => sanitizeClay(raw)).toThrow(/aggregate/i)
  })

  it('rejects inconsistent sampled action totals', () => {
    const raw = validRaw()
    raw.aggregates.sampledActionHealth = { sampled: 10, succeeded: 9, errored: 2 }

    expect(() => sanitizeClay(raw)).toThrow(/sampled action health/i)
  })

  it('produces output with no private ids, URLs, prompts, rows, or credentials', () => {
    const raw = validRaw()
    Object.assign(raw.workflows[0], {
      rows: [{ email: 'private@example.com' }],
      credentials: { bearer: 'Bearer private-token' },
    })

    const serialized = JSON.stringify(sanitizeClay(raw))

    expect(serialized).not.toMatch(
      /\b(?:wf_|wfn_|td_|sig_|t_|f_|wb_|rec_)[A-Za-z0-9_-]+\b|https?:\/\/|prompt|rows|credentials|bearer|private@example\.com/i,
    )
  })

  it.each([
    [{ safe: { rows: [] } }, /forbidden field/i],
    [{ safe: 'https://private.example' }, /private content/i],
    [{ safe: 'wf_private' }, /private content/i],
    [{ safe: 'Bearer private-token' }, /private content/i],
  ])('recursively rejects unsafe content in a public snapshot', (value, message) => {
    expect(() => assertPublicClaySnapshot(value)).toThrow(message)
  })
})
