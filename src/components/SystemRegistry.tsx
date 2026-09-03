import { useState } from 'react'
import type { ClaySnapshot, PublicClaySnapshot } from '../content/types'

const tabs = ['Tables', 'Signals', 'Function', 'Workflows'] as const
type Tab = (typeof tabs)[number]

function aggregate(snapshot: PublicClaySnapshot | undefined, key: string) {
  const value = snapshot?.aggregates?.[key]
  return typeof value === 'number' ? value.toLocaleString() : 'Unavailable'
}

function campaignStatus(snapshot: PublicClaySnapshot | undefined) {
  const campaigns = snapshot?.aggregates?.campaigns
  if (campaigns === 0) return '0 observed — activation not shipped'
  if (typeof campaigns === 'number') return `${campaigns.toLocaleString()} observed`
  return 'Campaigns: Unavailable'
}

function topologyText(workflow: ClaySnapshot['workflows'][number]) {
  const outgoing = workflow.nodes.map((_, index) => workflow.edges.filter(([from]) => from === index).map(([, to]) => to))
  const branchAt = outgoing.findIndex((targets) => targets.length > 1)
  if (branchAt >= 0) {
    const branchEdges = outgoing[branchAt].map((to) => `${workflow.nodes[branchAt].name} → ${workflow.nodes[to].name}`)
    return `Conditional branch: ${branchEdges.join('; ')}`
  }

  const incoming = workflow.nodes.map((_, index) => workflow.edges.filter(([, to]) => to === index).length)
  let current = incoming.findIndex((count) => count === 0)
  const ordered: string[] = []
  while (current >= 0 && !ordered.includes(workflow.nodes[current].name)) {
    ordered.push(workflow.nodes[current].name)
    current = outgoing[current][0] ?? -1
  }
  return ordered.length === workflow.nodes.length ? `Linear sequence: ${ordered.join(' → ')}` : `Connected topology: ${workflow.edges.map(([from, to]) => `${workflow.nodes[from].name} → ${workflow.nodes[to].name}`).join('; ')}`
}

export function SystemRegistry({ snapshot }: { snapshot?: PublicClaySnapshot }) {
  const [selected, setSelected] = useState<Tab>('Tables')
  const signals = Array.isArray(snapshot?.signals) ? snapshot.signals : []
  const workflows = Array.isArray(snapshot?.workflows) ? snapshot.workflows : []

  return (
    <section id="registry" className="section system-registry" aria-labelledby="registry-title">
      <p className="eyebrow">03 / Sanitized system inventory</p>
      <h2 id="registry-title">System Registry</h2>
      <p className="system-registry__intro">Build-time topology and observed aggregates, deliberately kept separate from contact-level data and private workspace resources.</p>
      <div className="system-registry__tabs" role="group" aria-label="System registry views">
        {tabs.map((tab) => <button key={tab} type="button" aria-pressed={selected === tab} onClick={() => setSelected(tab)}><span className="system-registry__selected-marker" aria-hidden="true">✓</span>{tab}</button>)}
      </div>
      <div className="system-registry__panel" role="region" aria-live="polite" aria-label={`${selected} registry`}>
        {selected === 'Tables' && <div className="registry-grid">
          <article><p className="eyebrow">Week 2 / Account engine</p><h3>Source + scoring inventory</h3><p>{aggregate(snapshot, 'scoredAccounts')} scored accounts · normalized identity, public signals, Tally feedback, BLS injury tiers, and composite-score outputs.</p></article>
          <article><p className="eyebrow">Week 3 / Healthcare map</p><h3>Facility + system pipeline</h3><p>{aggregate(snapshot, 'cmsFacilities')} CMS facility rows · {aggregate(snapshot, 'chspSystems')} CHSP health-system records · {aggregate(snapshot, 'healthSystemWorkingRows')} Turquoise Health Systems working rows.</p></article>
        </div>}
        {selected === 'Signals' && <div className="registry-list">
          <p>{aggregate(snapshot, 'signalsActive')} active · {aggregate(snapshot, 'signalsErrored')} errored. Status is observed at the sanitized snapshot boundary.</p>
          {signals.length ? <ul>{signals.map((signal, index) => <li key={`${signal.name}-${index}`}><strong>{signal.name}</strong><span>{signal.type} · {signal.inputKind} input · {signal.cadence} · <em className={signal.status === 'Errored' ? 'is-errored' : ''}>{signal.status}</em></span></li>)}</ul> : <p>Signal inventory unavailable.</p>}
        </div>}
        {selected === 'Function' && <div className="registry-contract">
          <p className="eyebrow">Public input / output contract</p><h3>{snapshot?.function?.name ?? 'Function unavailable'}</h3><p>{snapshot?.function?.contract ?? 'The sanitized function contract was unavailable at build time.'}</p><p>Reusable tier output; no source rows or function internals are published.</p>
        </div>}
        {selected === 'Workflows' && <div className="registry-workflows">
          {workflows.length ? workflows.map((workflow) => <article key={workflow.name}><p className="eyebrow">{workflow.nodes.length}-node observed topology</p><h3>{workflow.name}</h3><p className="registry-workflows__topology">{topologyText(workflow)}</p><ol>{workflow.nodes.map((node, index) => <li key={`${workflow.name}-${node.name}`}><span>{String(index + 1).padStart(2, '0')}</span>{node.name}<small>{node.type}</small></li>)}</ol></article>) : <p>Workflow topology unavailable.</p>}
          <p className="registry-campaigns">{campaignStatus(snapshot)}</p>
        </div>}
      </div>
    </section>
  )
}
