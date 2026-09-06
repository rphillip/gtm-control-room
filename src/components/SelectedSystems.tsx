import { useRef, useState } from 'react'
import type { CaseStudyContent } from '../content/types'
import { selectorMachineProfiles, useMatterMachine } from '../hooks/useMatterMachine'
import { CaseStudy } from './CaseStudy'
import { DataRelay } from './DataBallJourney'

function CaseSelectorGlyph({ slug }: { slug: string }) {
  const profile = selectorMachineProfiles[slug] ?? selectorMachineProfiles['multi-signal-account-engine']
  const start = profile.points[0]
  const launcher = profile.points.find(({ impact }) => impact === 'launch') ?? profile.points.at(-1)!
  const launcherIndex = profile.points.indexOf(launcher)
  const returnPoints = [...profile.points.slice(launcherIndex), profile.points[0]].map(({ x, y }) => `${x},${y}`).join(' ')
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg className="case-selector__glyph" viewBox="0 0 64 50" aria-hidden="true">
      {slug === 'multi-signal-account-engine' && <g {...common}><path d="M32 7v35M12 16h40M18 16 9 34h18zm28 0-9 18h18zM22 43h20"/><circle className="case-selector__moving-part" cx="32" cy="16" r="5"/></g>}
      {slug === 'healthcare-market-map' && <g {...common}><circle cx="32" cy="25" r="17"/><path className="case-selector__moving-part" d="m22 15 20 20m0-20L22 35"/><circle cx="9" cy="25" r="4"/><circle cx="55" cy="25" r="4"/></g>}
      {slug === 'activation-workflows' && <g {...common}><path d="M7 25h21m0 0 14-13m-14 13 14 13"/><rect x="42" y="6" width="16" height="13"/><path className="case-selector__moving-part" d="m43 8 7 6 7-6"/><circle cx="7" cy="25" r="4"/></g>}
      <polyline className="case-selector__return-track" points={returnPoints} />
      <g className="case-selector__launcher" data-physics-launcher transform={`translate(${launcher.x} ${launcher.y})`} {...common}>
        <path className="physics-launcher__spring" d="M-4-5 2-3-4-1 2 1-4 3 2 5" />
        <path d="M3-7v14" />
      </g>
      <circle className="case-selector__ball" data-physics-ball cx={start.x} cy={start.y} r="4" />
      <path className="case-selector__seam" data-physics-spin d="M -2 -0.8 L 2 0.8" transform={`translate(${start.x} ${start.y})`} />
    </svg>
  )
}

function CaseSelectorButton({ study, index, selected, onSelect }: {
  study: CaseStudyContent
  index: number
  selected: boolean
  onSelect: () => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const profile = selectorMachineProfiles[study.slug] ?? selectorMachineProfiles['multi-signal-account-engine']
  useMatterMachine(buttonRef, profile, selected)

  return (
    <button
      ref={buttonRef}
      type="button"
      data-case-selector={study.slug}
      data-physics-engine="matter-js"
      aria-pressed={selected}
      aria-controls="selected-case-file"
      onClick={onSelect}
    >
      <span className="case-selector__number">{String(index + 1).padStart(2, '0')}</span>
      <CaseSelectorGlyph slug={study.slug} />
      <span className="case-selector__label">{study.title}</span>
      <span className="case-selector__state">{selected ? 'Now viewing' : index < 2 ? 'Featured case' : 'Supporting prototype'}</span>
    </button>
  )
}

export function SelectedSystems({ studies }: { studies: CaseStudyContent[] }) {
  const [selectedSlug, setSelectedSlug] = useState(studies[0]?.slug ?? '')
  const [hasSwitched, setHasSwitched] = useState(false)
  const selectedIndex = Math.max(studies.findIndex(({ slug }) => slug === selectedSlug), 0)
  const selectedStudy = studies[selectedIndex]

  return (
    <section id="work" className="section selected-systems" aria-labelledby="work-title">
      <div className="selected-systems__intro">
        <div>
          <p className="eyebrow">02 / Les systèmes</p>
          <h2 id="work-title">Two core systems. One activation prototype.</h2>
          <DataRelay id="work" variant="switchboard" />
        </div>
        <p>Start with the business problem and result. Open a case file for the decisions, failure modes, and next production step.</p>
      </div>

      <div className="case-selector" role="group" aria-label="Choose a case file">
        {studies.map((study, index) => {
          const selected = study.slug === selectedStudy?.slug
          return (
            <CaseSelectorButton
              key={study.slug}
              study={study}
              index={index}
              selected={selected}
              onSelect={() => {
                if (!selected) setHasSwitched(true)
                setSelectedSlug(study.slug)
              }}
            />
          )
        })}
      </div>

      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        Now viewing {selectedStudy?.title ?? 'no'} case file.
      </p>

      {selectedStudy ? (
        <div
          id="selected-case-file"
          className={`selected-systems__stage${hasSwitched ? ' is-switching' : ''}`}
          role="region"
          aria-label={`${selectedStudy.title} case file`}
          key={selectedStudy.slug}
        >
          <CaseStudy study={selectedStudy} index={selectedIndex} />
        </div>
      ) : null}

      <aside id="playground" className="artifact-callout" aria-labelledby="artifact-callout-title">
        <div>
          <p className="eyebrow">Interactive field artifact · Synthetic data</p>
          <h3 id="artifact-callout-title">Signal Convergence Playground</h3>
          <p>One signal can be noise. Combine three different evidence streams and watch the GTM hypothesis change—without pretending a hand-built score is predictive science.</p>
        </div>
        <div className="artifact-callout__machine" aria-hidden="true">
          <span>LOOKING</span><i /><span>INVESTING</span><i /><span>CHANGING</span><b>Σ</b>
        </div>
        <a className="button" href={`${import.meta.env.BASE_URL}signal-convergence/`}>Open the playground</a>
      </aside>
    </section>
  )
}
