import { useState } from 'react'
import type { ClaySnapshot } from '../content/types'

const stages = [
  {
    id: 'detect',
    name: 'Detect',
    description: 'Public-market signals enter the monitored GTM system.',
  },
  {
    id: 'normalize',
    name: 'Normalize',
    description: 'Source fields are made comparable before scoring or routing.',
  },
  {
    id: 'qualify',
    name: 'Qualify',
    description: 'AutoTier assigns a reusable tier from its public scoring contract.',
  },
  {
    id: 'route',
    name: 'Route',
    description: 'Qualified work moves through an explicit workflow topology.',
  },
  {
    id: 'activate',
    name: 'Activate',
    description: 'Activation-ready outputs are prepared; Campaigns are not yet shipped.',
  },
  {
    id: 'observe',
    name: 'Observe',
    description: 'Sampled health and named failure states stay visible for improvement.',
  },
] as const

const paths = {
  signals: {
    label: 'Hiring + intent',
    telemetry: '60 accounts · 27 new-hire events · 5 active watches',
    stages: ['detect', 'normalize', 'qualify', 'route'],
  },
  healthcare: {
    label: 'CMS + CHSP',
    telemetry: '5,419 CMS facility rows joined to 639 CHSP health systems',
    stages: ['detect', 'normalize', 'qualify', 'route', 'activate'],
  },
  safety: {
    label: 'BLS injury data',
    telemetry: '9 industry series → 20 high / 12 medium / 28 low',
    stages: ['detect', 'normalize', 'qualify'],
  },
} as const

type PathId = keyof typeof paths
type StageId = (typeof stages)[number]['id']

function aggregate(snapshot: ClaySnapshot, name: string): number {
  const value = snapshot.aggregates[name]
  return typeof value === 'number' ? value : 0
}

function nestedAggregate(snapshot: ClaySnapshot, group: string, name: string): number {
  const value = snapshot.aggregates[group]
  return typeof value === 'object' && value !== null && typeof value[name] === 'number' ? value[name] : 0
}

export function ControlRoom({ snapshot }: { snapshot: ClaySnapshot }) {
  const [selectedPath, setSelectedPath] = useState<PathId>('signals')
  const [selectedStage, setSelectedStage] = useState<StageId>('detect')
  const path = paths[selectedPath]
  const stage = stages.find(({ id }) => id === selectedStage) ?? stages[0]
  const activeStages = new Set<string>(path.stages)
  const activeSignals = aggregate(snapshot, 'signalsActive')
  const erroredSignals = aggregate(snapshot, 'signalsErrored')
  const sampled = nestedAggregate(snapshot, 'sampledActionHealth', 'sampled')
  const succeeded = nestedAggregate(snapshot, 'sampledActionHealth', 'succeeded')
  const campaigns = aggregate(snapshot, 'campaigns')
  const workflows = snapshot.workflows.filter(
    ({ name }) => name === 'Turquoise Immature' || name === 'Turquoise Operator Enrichment',
  )

  return (
    <section id="control-room" className="section control-room" aria-labelledby="control-room-title">
      <div className="control-room__heading">
        <div>
          <p className="eyebrow">01 / Closed-loop GTM</p>
          <h2 id="control-room-title">GTM Control Room</h2>
        </div>
        <p className="control-room__intro">
          Select a public data source, then inspect the visible path through a healthcare GTM system.
        </p>
      </div>

      <div className="control-room__sources" aria-label="Public data sources">
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
        <div className="control-room__pipeline">
          <p className="control-room__pipeline-label">Selected path · {path.label}</p>
          <ol className="control-room__stages">
            {stages.map((item, index) => {
              const isOnPath = activeStages.has(item.id)
              const isSelected = selectedStage === item.id

              return (
                <li key={item.id} className={isOnPath ? 'is-on-path' : 'is-off-path'}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${String(index + 1).padStart(2, '0')} ${item.name}${isOnPath ? ', on selected path' : ', outside selected path'}`}
                    onClick={() => setSelectedStage(item.id)}
                  >
                    <span className="control-room__stage-number">{String(index + 1).padStart(2, '0')}</span>
                    <span>{item.name}</span>
                    <span className="control-room__stage-state">{isOnPath ? 'On path' : 'Not used'}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <aside className="control-room__telemetry" aria-label="Control Room telemetry">
          <p className="eyebrow">Live explanation</p>
          <p className="control-room__status" role="status" aria-live="polite">
            {path.telemetry}. {stage.name}: {stage.description}
          </p>
          <dl className="control-room__facts">
            <div>
              <dt>Signals</dt>
              <dd>{activeSignals} active · {erroredSignals} errored</dd>
            </div>
            <div>
              <dt>Tier contract</dt>
              <dd>{snapshot.function.name}: {snapshot.function.contract}</dd>
            </div>
            <div>
              <dt>Campaigns</dt>
              <dd>{campaigns} · not yet shipped</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="control-room__rail" aria-label="Reliability and workflow telemetry">
        <section className="control-room__rail-item control-room__rail-item--failure" aria-labelledby="failure-title">
          <p className="eyebrow" id="failure-title">Failure rail</p>
          <p>OSHA news is errored: taxonomy input needs attention.</p>
          <p>
            Sampled action health: {succeeded} of {sampled} actions succeeded; one AutoTier intent action errored. This is a sample,
            not a workspace-wide error rate.
          </p>
        </section>
        <section className="control-room__rail-item" aria-labelledby="workflow-title">
          <p className="eyebrow" id="workflow-title">Workflow topologies</p>
          <ul>
            {workflows.map((workflow) => (
              <li key={workflow.name}>
                {workflow.name} · {workflow.nodes.length} nodes
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}
