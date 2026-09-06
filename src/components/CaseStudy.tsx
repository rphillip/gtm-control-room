import type { CaseStudyContent } from '../content/types'
import { CaseMachine } from './CaseMachine'
import { EvidenceMobile } from './EvidenceMobile'

export function CaseStudy({ study, index }: { study: CaseStudyContent; index: number }) {
  const titleId = `${study.slug}-title`
  const featuredMetrics = study.metrics.filter(({ provenance }) => provenance !== 'unavailable').slice(0, 3)
  const isPrototype = study.slug === 'activation-workflows'
  const mobileVariant = study.slug === 'healthcare-market-map' || study.slug === 'activation-workflows'
    ? study.slug
    : 'multi-signal-account-engine'

  return (
    <article id={study.slug} className="case-study" aria-labelledby={titleId}>
      <header className="case-study__heading">
        <p className="eyebrow">{String(index + 1).padStart(2, '0')} / {isPrototype ? 'Prototype de système' : 'Étude de système · Featured'}</p>
        <h3 id={titleId}>{study.title}</h3>
        <p className="case-study__problem"><strong>The problem</strong>{study.problem}</p>
        <p className="case-study__summary">{study.summary}</p>
      </header>

      <EvidenceMobile title={study.title} metrics={featuredMetrics} variant={mobileVariant} />

      <details className="case-study__drawer">
        <summary><span>See the decisions, failure, and next production step</span><span className="disclosure-plus" aria-hidden="true">+</span></summary>
        <div className="case-study__drawer-body">
          <CaseMachine study={study} />

          <section className="case-study__build-log" aria-labelledby={`${study.slug}-build-log`}>
            <h4 id={`${study.slug}-build-log`}>Three build decisions</h4>
            <ol>{study.buildLog.slice(0, 3).map((entry) => <li key={entry}>{entry}</li>)}</ol>
          </section>

          <section className="case-study__failure" aria-labelledby={`${study.slug}-failure`}>
            <h4 id={`${study.slug}-failure`}>The important failure</h4>
            <ul>{study.failures.slice(0, 1).map((failure) => <li key={failure}>{failure}</li>)}</ul>
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
