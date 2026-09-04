import { useState } from 'react'

const stages = [
  {
    id: 'detect',
    name: 'Detect',
    description: 'Public-market signals enter the monitored GTM system.',
    input: 'Public hiring, intent, healthcare, and safety source events.',
    transformation: 'Classify the incoming source as an observed signal and retain its visible status.',
    output: 'An eligible signal event or source record ready for normalization.',
    failure: 'OSHA news remains visibly errored when its taxonomy input needs attention.',
  },
  {
    id: 'normalize',
    name: 'Normalize',
    description: 'Source fields are made comparable before scoring or routing.',
    input: 'Facility, company, industry, and health-system attributes from public sources.',
    transformation: 'Align shared entity fields and match keys before downstream scoring.',
    output: 'Comparable account and system context.',
    failure: 'Unresolved parent, system, or company identifiers remain explicit states.',
  },
  {
    id: 'qualify',
    name: 'Qualify',
    description: 'AutoTier assigns a reusable tier from its public scoring contract.',
    input: 'A scoring value, company domain, and scoring dimension.',
    transformation: 'Apply the public AutoTier contract to assign a reusable tier.',
    output: 'A tier that can contribute to a qualified account or system.',
    failure: 'Sampled AutoTier intent errors are local telemetry, not a workspace-wide rate.',
  },
  {
    id: 'route',
    name: 'Route',
    description: 'Qualified work moves through an explicit workflow topology.',
    input: 'Qualified tiers plus an audience segment and identifier availability.',
    transformation: 'Send work through a linear sequence or an explicit conditional branch.',
    output: 'A research-ready audience state or a marked missing-identifier state.',
    failure: 'Missing company identifiers take the named branch instead of silently failing.',
  },
  {
    id: 'activate',
    name: 'Activate',
    description: 'Activation-ready outputs are prepared; Campaigns are not yet shipped.',
    input: 'Prepared research and message outputs from the routed audience state.',
    transformation: 'Hold activation-ready work for a future delivery layer.',
    output: 'Prepared output only; campaign delivery is not represented in this workflow stage.',
    failure: 'No campaign execution results are presented as campaign performance.',
  },
  {
    id: 'observe',
    name: 'Observe',
    description: 'Sampled health and named failure states stay visible for improvement.',
    input: 'Signal states, workflow topology, and sampled action outcomes.',
    transformation: 'Surface sampled health and known failures alongside the path.',
    output: 'An operator-readable reliability view for the next improvement cycle.',
    failure: 'Sampled action errors remain visible as sample telemetry, never as a workspace-wide rate.',
  },
  {
    id: 'improve',
    name: 'Improve',
    description: 'Observed reliability guides the next production revision.',
    input: 'Operator-readable reliability view and production revision priorities.',
    transformation: 'Turn visible failure states into explicit ownership, retry, and data-contract improvements.',
    output: 'A safer next version of the GTM system.',
    failure: 'Improvements stay hypotheses until the next observed or sampled telemetry confirms their effect.',
  },
] as const

const paths = {
  signals: {
    label: 'Hiring + intent',
    telemetry: '60 accounts · 27 new-hire events · 5 active watches',
    stages: ['detect', 'normalize', 'qualify', 'route', 'observe', 'improve'],
  },
  healthcare: {
    label: 'CMS + CHSP',
    telemetry: '5,419 CMS facility rows joined to 639 CHSP health systems',
    stages: ['detect', 'normalize', 'qualify', 'route', 'activate', 'observe', 'improve'],
  },
  safety: {
    label: 'BLS injury data',
    telemetry: '9 industry series → 20 high / 12 medium / 28 low',
    stages: ['detect', 'normalize', 'qualify', 'observe', 'improve'],
  },
} as const

type PathId = keyof typeof paths
type StageId = (typeof stages)[number]['id']

interface WorkflowNode {
  name: string
  type: string
}

interface WorkflowTopology {
  name: string
  nodes: WorkflowNode[]
  edges: [number, number][]
  shape: 'Linear sequence' | 'Conditional branch' | 'Connected topology'
}

interface ControlRoomView {
  activeSignals?: number
  erroredSignals?: number
  tierContract?: string
  campaigns?: number
  sampledActionHealth?: { sampled: number; succeeded: number; errored: number }
  workflows: WorkflowTopology[]
}

const workflowNames = ['Turquoise Immature', 'Turquoise Operator Enrichment'] as const

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function numberAt(record: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = record?.[key]
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined
}

function normalizeWorkflow(value: unknown, expectedName: string): WorkflowTopology | undefined {
  const workflow = asRecord(value)
  if (workflow?.name !== expectedName || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) return undefined

  const nodes = workflow.nodes.map((node) => {
    const parsed = asRecord(node)
    return typeof parsed?.name === 'string' && typeof parsed.type === 'string'
      ? { name: parsed.name, type: parsed.type }
      : undefined
  })
  if (nodes.some((node) => node === undefined) || nodes.length === 0) return undefined

  const edges = workflow.edges.map((edge) => {
    if (!Array.isArray(edge) || edge.length !== 2 || !Number.isInteger(edge[0]) || !Number.isInteger(edge[1])) return undefined
    const [from, to] = edge
    return from >= 0 && from < nodes.length && to >= 0 && to < nodes.length ? [from, to] as [number, number] : undefined
  })
  if (edges.some((edge) => edge === undefined) || edges.length === 0) return undefined

  const completeNodes = nodes as WorkflowNode[]
  const completeEdges = edges as [number, number][]
  const outgoing = completeNodes.map((_, index) => completeEdges.filter(([from]) => from === index).length)
  const shape = outgoing.some((count) => count > 1)
    ? 'Conditional branch'
    : completeEdges.length === completeNodes.length - 1 && outgoing.every((count) => count <= 1)
      ? 'Linear sequence'
      : 'Connected topology'

  return { name: expectedName, nodes: completeNodes, edges: completeEdges, shape }
}

function normalizeView(snapshot: unknown): ControlRoomView {
  const source = asRecord(snapshot)
  const aggregates = asRecord(source?.aggregates)
  const sampledHealth = asRecord(aggregates?.sampledActionHealth)
  const sampled = numberAt(sampledHealth, 'sampled')
  const succeeded = numberAt(sampledHealth, 'succeeded')
  const errored = numberAt(sampledHealth, 'errored')
  const fn = asRecord(source?.function)
  const tierContract = fn?.name === 'AutoTier' && typeof fn.contract === 'string' ? `AutoTier: ${fn.contract}` : undefined
  const candidates = Array.isArray(source?.workflows) ? source.workflows : []
  const workflows = workflowNames.flatMap((name) => {
    const match = candidates.find((workflow) => asRecord(workflow)?.name === name)
    const normalized = normalizeWorkflow(match, name)
    return normalized ? [normalized] : []
  })

  return {
    activeSignals: numberAt(aggregates, 'signalsActive'),
    erroredSignals: numberAt(aggregates, 'signalsErrored'),
    tierContract,
    campaigns: numberAt(aggregates, 'campaigns'),
    sampledActionHealth: sampled !== undefined && succeeded !== undefined && errored !== undefined &&
      Number.isInteger(sampled) && Number.isInteger(succeeded) && Number.isInteger(errored) &&
      succeeded + errored === sampled
      ? { sampled, succeeded, errored }
      : undefined,
    workflows,
  }
}

function MachineGlyph({ id }: { id: StageId }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const mechanism = `machine-glyph__mechanism machine-glyph__mechanism--${id}`
  return (
    <svg className="machine-glyph" viewBox="0 0 48 48" aria-hidden="true">
      {id === 'detect' && <g className={mechanism} data-ball-interaction={id} {...common}><path d="M24 36V20m-8 16h16"/><path className="machine-glyph__wave machine-glyph__wave--near" d="M18 18a8 8 0 0 1 12 0"/><path className="machine-glyph__wave machine-glyph__wave--far" d="M13 13a15 15 0 0 1 22 0"/><circle className="machine-glyph__catch" cx="24" cy="20" r="2.5"/></g>}
      {id === 'normalize' && <g className={mechanism} data-ball-interaction={id} {...common}><path className="machine-glyph__funnel" d="M10 10h28l-11 14v11l-6 4V24z"/><path d="M16 16h16"/><circle className="machine-glyph__micro-ball" cx="24" cy="12" r="2.6" fill="currentColor" stroke="none"/></g>}
      {id === 'qualify' && <g className={mechanism} data-ball-interaction={id} {...common}><path d="M24 9v28M17 38h14"/><g className="machine-glyph__balance"><path d="M12 15h24M16 15l-6 12h12zm16 0-6 12h12z"/></g></g>}
      {id === 'route' && <g className={mechanism} data-ball-interaction={id} {...common}><path className="machine-glyph__switch" d="M10 24h16m0 0 9-10m-9 10 9 10"/><circle cx="9" cy="24" r="3"/><circle cx="37" cy="12" r="3"/><circle cx="37" cy="36" r="3"/></g>}
      {id === 'activate' && <g className={mechanism} data-ball-interaction={id} {...common}><rect x="9" y="14" width="30" height="21" rx="1"/><path className="machine-glyph__flap" d="m10 16 14 11 14-11"/><path d="M24 9v5m-6-3 2 3m10-3-2 3"/></g>}
      {id === 'observe' && <g className={mechanism} data-ball-interaction={id} {...common}><path className="machine-glyph__eye" d="M6 24s7-10 18-10 18 10 18 10-7 10-18 10S6 24 6 24z"/><circle className="machine-glyph__iris" cx="24" cy="24" r="5"/><path className="machine-glyph__needle" d="M24 24l6-4"/></g>}
      {id === 'improve' && <g className={mechanism} data-ball-interaction={id} {...common}><g className="machine-glyph__loop"><path d="M15 16a14 14 0 0 1 22 8l4-4m0 0v9h-9M33 33a14 14 0 0 1-22-8l-4 4m0 0v-9h9"/></g></g>}
    </svg>
  )
}

export function ControlRoom({ snapshot }: { snapshot: unknown }) {
  const [selectedPath, setSelectedPath] = useState<PathId>('signals')
  const [selectedStage, setSelectedStage] = useState<StageId>('detect')
  const path = paths[selectedPath]
  const stage = stages.find(({ id }) => id === selectedStage) ?? stages[0]
  const activeStages = new Set<string>(path.stages)
  const view = normalizeView(snapshot)

  return (
    <section id="control-room" className="section control-room" aria-labelledby="control-room-title">
      <div className="control-room__heading">
        <div>
          <p className="eyebrow">01 / La machine</p>
          <h2 id="control-room-title">A very serious data machine.</h2>
        </div>
        <p className="control-room__intro">
          Choose a source. The contraption shows how raw evidence becomes an accountable GTM action—and where the gears can jam.
        </p>
      </div>

      <div className="control-room__sources" role="group" aria-label="Public data sources">
        {(Object.keys(paths) as PathId[]).map((pathId) => {
          const source = paths[pathId]
          const selected = selectedPath === pathId

          return (
            <button
              key={pathId}
              className="control-room__source"
              type="button"
              aria-pressed={selected}
              data-state={selected ? 'viewing path' : 'view path'}
              onClick={() => setSelectedPath(pathId)}
            >
              {source.label}
            </button>
          )
        })}
      </div>

      <div className="control-room__layout">
        <div className="control-room__pipeline contraption" data-selected={selectedStage}>
          <p className="control-room__pipeline-label">Selected path · {path.label}</p>
          <svg className="contraption__tracks" viewBox="0 0 1000 430" preserveAspectRatio="none" aria-hidden="true">
            <path className="track track--main" d="M76 118H228L274 73H405L449 171H570L626 103H785L836 188H944" />
            <path className="track track--return" d="M944 188v155H721l-42-55H502l-47 63H233L174 286H76V118" />
            <path className="track track--red" d="M275 73v-34h112" />
            <path className="track track--blue" d="M721 343v44h145" />
            <circle cx="274" cy="73" r="14"/><circle cx="626" cy="103" r="14"/><circle cx="455" cy="351" r="14"/>
            <path d="M260 73h28M626 89v28M441 351h28"/>
          </svg>
          <span className="contraption__parcel" data-contraption-motion="ball" aria-hidden="true" />
          <span className="contraption__mechanism contraption__mechanism--wheel" data-contraption-part="wheel" aria-hidden="true"><i /><i /><i /></span>
          <span className="contraption__mechanism contraption__mechanism--lever" data-contraption-part="lever" aria-hidden="true"><i /></span>
          <span className="contraption__mechanism contraption__mechanism--bell" data-contraption-part="bell" aria-hidden="true"><i /></span>
          <ol className="control-room__stages" aria-label="GTM operating loop">
            {stages.map((item, index) => {
              const isOnPath = activeStages.has(item.id)
              const isSelected = selectedStage === item.id

              return (
                <li key={item.id} className={isOnPath ? 'is-on-path' : 'is-off-path'}>
                  <button
                    type="button"
                    aria-label={`${String(index + 1).padStart(2, '0')} ${item.name}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedStage(item.id)}
                  >
                    <span className="control-room__stage-number">{String(index + 1).padStart(2, '0')}</span>
                    <MachineGlyph id={item.id} />
                    <span className="control-room__stage-name">{item.name}</span>
                    <span className="control-room__stage-state">{isSelected ? 'Selected' : isOnPath ? 'On path' : 'Not used'}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <aside className="control-room__telemetry">
          <p className="eyebrow">Now clanking</p>
          <div className="control-room__status" role="status" aria-live="polite">
            <p>{path.telemetry}. {stage.name}: {stage.description}</p>
          </div>
        </aside>
      </div>

      <details className="machine-notes">
        <summary><span>Open machine notes</span><span className="disclosure-plus" aria-hidden="true">+</span></summary>
        <div className="machine-notes__body">
          <div className="machine-notes__telemetry" aria-label="Control Room telemetry">
            <dl className="control-room__stage-detail">
              <div><dt>Input</dt><dd>{stage.input}</dd></div>
              <div><dt>Transformation</dt><dd>{stage.transformation}</dd></div>
              <div><dt>Output</dt><dd>{stage.output}</dd></div>
              <div><dt>Failure mode</dt><dd>{stage.failure}</dd></div>
            </dl>
            <dl className="control-room__facts">
              <div><dt>Signals</dt><dd>{view.activeSignals !== undefined && view.erroredSignals !== undefined ? `${view.activeSignals} active · ${view.erroredSignals} errored` : 'Signal status unavailable'}</dd></div>
              <div><dt>Tier contract</dt><dd>{view.tierContract ?? 'Tier contract unavailable'}</dd></div>
              <div><dt>Campaigns</dt><dd>{view.campaigns === undefined ? 'Campaign state unavailable' : `${view.campaigns} · not yet shipped`}</dd></div>
            </dl>
          </div>
          <div className="control-room__rail" role="group" aria-label="Reliability and workflow telemetry">
            <section className="control-room__rail-item control-room__rail-item--failure" aria-labelledby="failure-title">
              <h3 className="eyebrow" id="failure-title">Failure rail</h3>
              <p>OSHA news is errored: taxonomy input needs attention.</p>
              {view.sampledActionHealth ? <p>Sampled action health: {view.sampledActionHealth.succeeded} of {view.sampledActionHealth.sampled} actions succeeded; {view.sampledActionHealth.errored} AutoTier intent action{view.sampledActionHealth.errored === 1 ? '' : 's'} errored. This is a sample, not a workspace-wide error rate.</p> : <p>Sampled action health unavailable.</p>}
            </section>
            <section className="control-room__rail-item" aria-labelledby="workflow-title">
              <h3 className="eyebrow" id="workflow-title">Workflow topologies</h3>
              {view.workflows.length > 0 ? view.workflows.map((workflow) => (
                <article className="control-room__workflow" key={workflow.name}>
                  <h4>{workflow.name} · {workflow.shape}</h4>
                  <ol>{workflow.nodes.map((node) => <li key={`${workflow.name}-${node.name}`}><span>{node.name}</span> <span>{node.type}</span></li>)}</ol>
                  <p>Edges: {[...workflow.edges].sort(([fromA, toA], [fromB, toB]) => fromA - fromB || toA - toB).map(([from, to]) => `${workflow.nodes[from].name} → ${workflow.nodes[to].name}`).join(' · ')}</p>
                </article>
              )) : <p>Workflow topology unavailable.</p>}
            </section>
          </div>
        </div>
      </details>
    </section>
  )
}
