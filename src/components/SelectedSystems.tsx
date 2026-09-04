import { useState } from 'react'
import type { CaseStudyContent } from '../content/types'
import { CaseStudy } from './CaseStudy'

function CaseSelectorGlyph({ slug }: { slug: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg className="case-selector__glyph" viewBox="0 0 64 50" aria-hidden="true">
      {slug === 'multi-signal-account-engine' && <g {...common}><path d="M32 7v35M12 16h40M18 16 9 34h18zm28 0-9 18h18zM22 43h20"/><circle className="case-selector__moving-part" cx="32" cy="16" r="5"/></g>}
      {slug === 'healthcare-market-map' && <g {...common}><circle cx="32" cy="25" r="17"/><path className="case-selector__moving-part" d="m22 15 20 20m0-20L22 35"/><circle cx="9" cy="25" r="4"/><circle cx="55" cy="25" r="4"/></g>}
      {slug === 'activation-workflows' && <g {...common}><path d="M7 25h21m0 0 14-13m-14 13 14 13"/><rect x="42" y="6" width="16" height="13"/><path className="case-selector__moving-part" d="m43 8 7 6 7-6"/><circle cx="7" cy="25" r="4"/></g>}
      <circle className="case-selector__ball" cx="7" cy="8" r="4" />
    </svg>
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
          <h2 id="work-title">Three machines. Real evidence.</h2>
        </div>
        <p>Choose a mechanism. Open its case file for the build logs, failures, and production reflection.</p>
      </div>

      <div className="case-selector" role="group" aria-label="Choose a case file">
        {studies.map((study, index) => {
          const selected = study.slug === selectedStudy?.slug
          return (
            <button
              key={study.slug}
              type="button"
              data-case-selector={study.slug}
              aria-pressed={selected}
              aria-controls="selected-case-file"
              onClick={() => {
                if (!selected) setHasSwitched(true)
                setSelectedSlug(study.slug)
              }}
            >
              <span className="case-selector__number">{String(index + 1).padStart(2, '0')}</span>
              <CaseSelectorGlyph slug={study.slug} />
              <span className="case-selector__label">{study.title}</span>
              <span className="case-selector__state">{selected ? 'Now viewing' : 'Select machine'}</span>
            </button>
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
    </section>
  )
}
