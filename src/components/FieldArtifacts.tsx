const artifacts = [
  {
    slug: 'hospital-tam',
    eyebrow: 'Entity-resolution walkthrough',
    title: '5,000 Hospitals Doesn’t Mean 5,000 Prospects',
    summary: 'Feel ten facility rows collapse into four health systems and three GTM accounts—then inspect the joins, filters, failure modes, and checklist.',
    action: 'Explore the hospital TAM',
    machine: ['10 facilities', '4 systems', '3 accounts'],
  },
  {
    slug: 'signal-convergence',
    eyebrow: 'Signal-design playground',
    title: 'Signal Convergence Playground',
    summary: 'Combine three different evidence streams and watch the GTM hypothesis change—without pretending a hand-built score is predictive science.',
    action: 'Open the playground',
    machine: ['Looking', 'Investing', 'Changing'],
  },
] as const

export function FieldArtifacts() {
  return (
    <section id="artifacts" className="artifact-shelf" aria-labelledby="artifact-shelf-title">
      <header><p className="eyebrow">Interactive field artifacts · Synthetic data</p><h3 id="artifact-shelf-title">Open the system. Test the premise.</h3></header>
      <div className="artifact-shelf__grid">
        {artifacts.map((artifact) => (
          <article className="artifact-callout" key={artifact.slug}>
            <div><p className="eyebrow">{artifact.eyebrow}</p><h4>{artifact.title}</h4><p>{artifact.summary}</p></div>
            <div className={`artifact-callout__machine artifact-callout__machine--${artifact.slug}`} aria-hidden="true">
              {artifact.machine.map((label) => <span key={label}>{label}</span>)}<b>{artifact.slug === 'hospital-tam' ? '↓' : 'Σ'}</b>
            </div>
            <a className="button" href={`${import.meta.env.BASE_URL}${artifact.slug}/`}>{artifact.action}</a>
          </article>
        ))}
      </div>
    </section>
  )
}
