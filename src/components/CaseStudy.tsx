import type { CaseStudyContent } from '../content/types'
import { resolveLocalAsset } from '../content/localAsset'
import { CaseMachine } from './CaseMachine'
import { MetricStrip } from './MetricStrip'

export function CaseStudy({ study, index }: { study: CaseStudyContent; index: number }) {
  const titleId = `${study.slug}-title`
  const featuredMetrics = study.metrics.slice(0, 3)

  return (
    <article id={study.slug} className="case-study" aria-labelledby={titleId}>
      <header className="case-study__heading">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')} / Étude de système</p>
        <h3 id={titleId}>{study.title}</h3>
        <p className="case-study__problem"><strong>The problem</strong>{study.problem}</p>
        <p className="case-study__summary">{study.summary}</p>
      </header>

      <MetricStrip metrics={featuredMetrics} />

      <details className="case-study__drawer">
        <summary><span>Open full case file</span><span className="disclosure-plus" aria-hidden="true">+</span></summary>
        <div className="case-study__drawer-body">
          <CaseMachine study={study} />
          <div className="case-study__architecture" role="group" aria-label={`${study.title} architecture stages`}>
            <p className="eyebrow">System path</p>
            <ol>
              {study.stages.map((stage, stageIndex) => <li key={stage}><span>{String(stageIndex + 1).padStart(2, '0')}</span>{stage}</li>)}
            </ol>
          </div>

          {study.media && <figure className="case-study__media">
            <img src={resolveLocalAsset(study.media.src)} alt={study.media.alt} width={study.media.width} height={study.media.height} loading="lazy" decoding="async" />
            <figcaption>{study.media.caption}</figcaption>
          </figure>}

          <section className="case-study__build-log" aria-labelledby={`${study.slug}-build-log`}>
            <h4 id={`${study.slug}-build-log`}>Build log</h4>
            <ol>{study.buildLog.map((entry) => <li key={entry}>{entry}</li>)}</ol>
          </section>

          <section className="case-study__failure" aria-labelledby={`${study.slug}-failure`}>
            <h4 id={`${study.slug}-failure`}>What broke / what was missing</h4>
            <ul>{study.failures.map((failure) => <li key={failure}>{failure}</li>)}</ul>
          </section>

          <footer className="case-study__reflection">
            <p className="eyebrow">What I would change in production</p>
            <p>{study.reflection}</p>
          </footer>
        </div>
      </details>
    </article>
  )
}
