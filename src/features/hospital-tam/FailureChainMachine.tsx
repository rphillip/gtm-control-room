import { useEffect, useState } from 'react'

type RunMode = 'idle' | 'broken' | 'clean'

const failures = [
  ['Double-counted TAM', 'One facility record becomes several apparent prospects, even though one system controls contracting.', 'Duplicate press'],
  ['Duplicate outreach', 'Different records fire separate messages toward the same parent company.', 'Mail cannon'],
  ['Bad scoring', 'Facility size, system scale, and company complexity tip one crooked score.', 'Crooked scale'],
  ['Wrong buyer', 'The route points toward a local contact when the buying decision lives centrally.', 'Buyer pointer'],
  ['Broken reporting', 'Duplicate entities keep ringing the pipeline counter and inflate the apparent market.', 'Pipeline counter'],
] as const

export function FailureChainMachine() {
  const [mode, setMode] = useState<RunMode>('idle')
  const [stage, setStage] = useState(0)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (mode === 'idle') return
    const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setStage(mode === 'broken' ? failures.length : 1)
      return
    }

    const stageCount = mode === 'broken' ? failures.length : 1
    const timers = Array.from({ length: stageCount }, (_, index) => window.setTimeout(() => setStage(index + 1), 650 + index * 720))
    return () => timers.forEach(window.clearTimeout)
  }, [mode, revision])

  const startRun = (nextMode: Exclude<RunMode, 'idle'>) => {
    setStage(0)
    setMode(nextMode)
    setRevision((current) => current + 1)
  }

  const status = mode === 'idle'
    ? 'Machine ready. Choose whether to skip or run identity resolution.'
    : mode === 'clean'
      ? 'Identity resolution ran first. One stable account continues to scoring, outreach, and reporting.'
      : stage === failures.length
        ? 'Identity resolution was skipped. All five downstream failures were triggered.'
        : `Failure chain running. ${stage} of ${failures.length} failures triggered.`

  return (
    <div className="tam-break-machine" data-mode={mode} data-stage={stage}>
      <header className="tam-break-machine__controls">
        <div><span>Identity resolution safeguard</span><strong>{mode === 'broken' ? 'Bypassed' : mode === 'clean' ? 'Engaged' : 'Standing by'}</strong></div>
        <div role="group" aria-label="Failure machine controls">
          <button type="button" className="tam-break-machine__break" onClick={() => startRun('broken')}>Break the machine</button>
          <button type="button" onClick={() => startRun('clean')}>Run it correctly</button>
        </div>
      </header>

      <div className="tam-break-machine__stage" key={revision} aria-hidden="true">
        <span className="tam-break-machine__rail" />
        <i className="tam-break-machine__ball" />
        <i className="tam-break-machine__copy tam-break-machine__copy--one" />
        <i className="tam-break-machine__copy tam-break-machine__copy--two" />
        <span className="tam-break-machine__repair">↶<small>repair arm</small></span>
        <span className="tam-break-machine__resolver"><b>≠</b><small>resolve first</small></span>

        <div className="tam-break-station tam-break-station--press"><span>01</span><strong>Duplicate press</strong><i><b /><b /><b /></i></div>
        <div className="tam-break-station tam-break-station--mail"><span>02</span><strong>Mail cannon</strong><i><b /></i></div>
        <div className="tam-break-station tam-break-station--scale"><span>03</span><strong>Crooked scale</strong><i><b /><b /></i></div>
        <div className="tam-break-station tam-break-station--buyer"><span>04</span><strong>Buyer pointer</strong><i><b /></i></div>
        <div className="tam-break-station tam-break-station--counter"><span>05</span><strong>Pipeline counter</strong><i><b>03</b><b>07</b></i></div>
      </div>

      <div className="tam-break-machine__failures">
        {failures.map(([title, description, mechanism], index) => {
          const triggered = mode === 'broken' && stage > index
          return <article key={title} className={triggered ? 'is-triggered' : ''}>
            <span>0{index + 1} / {mechanism}</span>
            <h3>{title}</h3>
            <p hidden={!triggered}>{description}</p>
          </article>
        })}
      </div>

      <p className="tam-break-machine__status" role="status" aria-live="polite">{status}</p>
    </div>
  )
}
