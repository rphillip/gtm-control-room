import { useState } from 'react'
import type { CaseStudyContent } from '../content/types'
import { resolveLocalAsset } from '../content/localAsset'
import { MetricStrip } from './MetricStrip'

export function CaseStudy({ study, index }: { study: CaseStudyContent; index: number }) {
  const [isBuildLogOpen, setIsBuildLogOpen] = useState(false)
  const titleId = `${study.slug}-title`

  return (
    <article id={study.slug} className="case-study" aria-labelledby={titleId}>
      <header className="case-study__heading">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')} / System study</p>
        <h3 id={titleId}>{study.title}</h3>
        <p className="case-study__problem"><strong>Problem.</strong> {study.problem}</p>
        <p className="case-study__summary">{study.summary}</p>
      </header>

      <div className="case-study__architecture" role="group" aria-label={`${study.title} architecture stages`}>
        <p className="eyebrow">System path</p>
        <ol>
          {study.stages.map((stage, stageIndex) => <li key={stage}><span>{String(stageIndex + 1).padStart(2, '0')}</span>{stage}</li>)}
        </ol>
      </div>

      <MetricStrip metrics={study.metrics} />

      {study.media && <figure className="case-study__media">
        <img
          src={resolveLocalAsset(study.media.src)}
          alt={study.media.alt}
          width={study.media.width}
          height={study.media.height}
          loading="lazy"
          decoding="async"
        />
        <figcaption>{study.media.caption}</figcaption>
      </figure>}

      <section className="case-study__evidence" aria-label={`${study.title} system evidence`}>
        <h4 className="visually-hidden">System evidence</h4>
        <div className="case-study__evidence-screen" aria-hidden="true">
          <span>INPUT</span><i /><span>TRANSFORM</span><i /><span>OUTPUT</span>
          <b>SAFE VIEW</b>
        </div>
        <p>Portfolio-safe system view: stage topology and aggregate evidence only. No rows, records, workspace links, or raw responses are included.</p>
      </section>

      <section className="case-study__build-log" aria-labelledby={`${study.slug}-build-log`}>
        <h4 id={`${study.slug}-build-log`}>Build log</h4>
        <button type="button" aria-expanded={isBuildLogOpen} onClick={() => setIsBuildLogOpen((open) => !open)}>
          {isBuildLogOpen ? 'Close build log' : 'Open build log'}
        </button>
        {isBuildLogOpen && <ol>{study.buildLog.map((entry) => <li key={entry}>{entry}</li>)}</ol>}
      </section>

      <section className="case-study__failure" aria-labelledby={`${study.slug}-failure`}>
        <h4 id={`${study.slug}-failure`}>What broke / what was missing</h4>
        <ul>{study.failures.map((failure) => <li key={failure}>{failure}</li>)}</ul>
      </section>

      <footer className="case-study__reflection">
        <p className="eyebrow">What I would change in production</p>
        <p>{study.reflection}</p>
      </footer>
    </article>
  )
}
