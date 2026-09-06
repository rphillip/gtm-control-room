import { useRef, useState } from 'react'
import { ArtifactAudienceGuide } from '../../components/ArtifactAudienceGuide'
import { portfolio } from '../../content/portfolio'
import { useDataWordHighlight } from '../../hooks/useDataWordHighlight'
import { calculatePriorityScore, playgroundSignals, priorityByCount, signalStory, type SignalKey } from './model'

type WeightMode = 'equal' | 'custom'

const initialSignals: Record<SignalKey, boolean> = { intent: false, job: false, hire: false }
const initialWeights: Record<SignalKey, number> = Object.fromEntries(
  playgroundSignals.map(({ key, defaultWeight }) => [key, defaultWeight]),
) as Record<SignalKey, number>

const pipeline = [
  'Source data',
  'Normalize / entity resolution',
  'Signals',
  'Account',
  'Convergence / prioritization',
  'Human investigation',
  'Action',
  'Outcome',
  'Feedback',
]

const replicationSteps = [
  "Define the business change you're trying to detect.",
  'Find signals that represent different dimensions of that change.',
  'Normalize them to the account level.',
  'Keep raw evidence next to every signal.',
  'Start with simple scoring and look for convergence.',
  'Route high-convergence accounts for human investigation.',
  'Record outcomes, then revisit the weights and assumptions.',
]

const machineCaptions = [
  'No clues are loaded, so the ball waits at the account.',
  'One clue drops into the account, but the ball only nudges forward.',
  'Two clues join at the account and push the ball as far as the question gate.',
  'Three clues join, the Σ gate opens, and the ball reaches “Ask next” before the spring returns it.',
] as const

export function SignalConvergencePage() {
  const mainRef = useRef<HTMLElement>(null)
  useDataWordHighlight(mainRef)
  const [active, setActive] = useState(initialSignals)
  const [weightMode, setWeightMode] = useState<WeightMode>('equal')
  const [customWeights, setCustomWeights] = useState(initialWeights)
  const activeCount = playgroundSignals.filter(({ key }) => active[key]).length
  const weights = weightMode === 'equal'
    ? { intent: 100 / 3, job: 100 / 3, hire: 100 / 3 }
    : customWeights
  const priorityScore = calculatePriorityScore(active, weights)
  const baseUrl = import.meta.env.BASE_URL

  return (
    <>
      <a className="skip-link" href="#main">Skip to playground</a>
      <header className="site-header convergence-header">
        <a className="site-header__mark" href={baseUrl} aria-label="RS — return to Ryan Sulapas portfolio">RS<span aria-hidden="true">/</span></a>
        <nav aria-label="Playground sections">
          <ul className="site-header__nav">
            <li><a href="#playground">Playground</a></li>
            <li><a href="#mental-model">Why it matters</a></li>
            <li><a href="#system">The system</a></li>
            <li><a href="#replicate">Build it</a></li>
          </ul>
        </nav>
      </header>

      <main ref={mainRef} id="main" className="convergence-page" tabIndex={-1}>
        <section className="convergence-hero" aria-labelledby="convergence-title">
          <div>
            <p className="eyebrow">Interactive field artifact · Demo / synthetic data</p>
            <h1 id="convergence-title">Signal Convergence Playground</h1>
            <p className="convergence-hero__subtitle">One signal can be noise. Multiple signals agreeing can become a story worth investigating.</p>
            <ul className="artifact-tags" aria-label="Project tags">
              {['GTM Engineering', 'Signal Design', 'Data Engineering', 'Healthcare', 'Interactive'].map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
          <aside className="synthetic-stamp" aria-label="Data disclosure">
            <strong>100% synthetic</strong>
            <span>No real company or private information</span>
          </aside>
        </section>

        <ArtifactAudienceGuide
          plainEnglish="Think of each signal as one clue. A job posting alone may mean very little. When different clues point toward the same change, the red data ball gets enough momentum to reach a better next question—not a guaranteed sale."
        />

        <section id="playground" className="convergence-workbench" aria-labelledby="playground-title">
          <header className="convergence-workbench__header">
            <div>
              <p className="eyebrow">01 / Le banc d'essai</p>
              <h2 id="playground-title">Investigate the account.</h2>
            </div>
            <div className="demo-account">
              <span>Fictional account</span>
              <strong>Acme Manufacturing</strong>
              <small>4,800 employees · Large frontline workforce · Multi-state operations</small>
            </div>
          </header>

          <div className="convergence-console">
            <fieldset className="signal-controls">
              <legend>Choose the evidence available</legend>
              {playgroundSignals.map((signal, index) => (
                <div className={`signal-control${active[signal.key] ? ' is-active' : ''}`} key={signal.key}>
                  <label className="signal-control__switch">
                    <input
                      type="checkbox"
                      checked={active[signal.key]}
                      onChange={() => setActive((current) => ({ ...current, [signal.key]: !current[signal.key] }))}
                    />
                    <span className="signal-control__index">0{index + 1}</span>
                    <span className="signal-control__toggle" aria-hidden="true">{active[signal.key] ? 'ON' : 'OFF'}</span>
                    <strong>{signal.name}</strong>
                    <span>{signal.description}</span>
                  </label>
                  <dl>
                    <div><dt>Evidence · Synthetic</dt><dd>“{signal.evidence}”</dd></div>
                    <div><dt>Could mean</dt><dd>{signal.interpretation}</dd></div>
                    <div><dt>Limit</dt><dd>{signal.limitation}</dd></div>
                  </dl>
                </div>
              ))}
            </fieldset>

            <div className="convergence-machine">
              <div className={`convergence-diagram convergence-diagram--${activeCount}`} aria-hidden="true">
                <span className="convergence-diagram__return-rail" />
                <div className="convergence-diagram__signals">
                  {playgroundSignals.map(({ key, shortLabel }, index) => (
                    <div className={active[key] ? 'is-active' : ''} key={key}>
                      <span className={`convergence-diagram__ball convergence-diagram__ball--${index + 1}`} />
                      <span>{shortLabel}</span>
                    </div>
                  ))}
                </div>
                <span className="convergence-diagram__account">Account</span>
                <span className="convergence-diagram__gate">Σ</span>
                <span className="convergence-diagram__output">Ask<br />next</span>
                <span className="convergence-diagram__spring" />
                <span className="convergence-diagram__data-ball" data-artifact-data-ball />
              </div>
              <p className="convergence-machine-caption" aria-live="polite"><strong>The red ball is data.</strong> {machineCaptions[activeCount]}</p>
            </div>

            <section className="hypothesis-panel" aria-labelledby="hypothesis-title" data-data-highlight-ignore>
              <header>
                <p className="eyebrow">Current GTM hypothesis</p>
                <strong><span>{activeCount}</span> / 3 signals</strong>
              </header>
              <h3 id="hypothesis-title">{priorityByCount[activeCount]}</h3>
              <p>{signalStory(active)}</p>
              <div className="priority-meter">
                <div><span>Priority score</span><strong>{priorityScore}</strong></div>
                <meter className="priority-meter__track" aria-label="Illustrative priority score" min="0" max="100" value={priorityScore}>{priorityScore} out of 100</meter>
                <small>Prioritizes investigation. Does not predict purchase intent.</small>
              </div>
            </section>
            <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
              {activeCount} of 3 signals. {priorityByCount[activeCount]}. {signalStory(active)}
            </p>
          </div>

          <section className="weight-lab" aria-labelledby="weight-title">
            <div>
              <p className="eyebrow">Assumption controls</p>
              <h3 id="weight-title">Weights are hypotheses.</h3>
              <p>Changing the weights changes the ranking because the assumptions changed—not because the account changed.</p>
            </div>
            <div className="weight-mode" role="group" aria-label="Weight model">
              <label><input type="radio" name="weight-mode" value="equal" checked={weightMode === 'equal'} onChange={() => setWeightMode('equal')} />Equal weight</label>
              <label><input type="radio" name="weight-mode" value="custom" checked={weightMode === 'custom'} onChange={() => setWeightMode('custom')} />Custom weight</label>
            </div>
            <div className="weight-controls" data-data-highlight-ignore>
              {playgroundSignals.map((signal) => (
                <label key={signal.key}>
                  <span>{signal.shortLabel} <span className="weight-output">{weightMode === 'equal' ? '33⅓' : customWeights[signal.key]}</span></span>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={weightMode === 'equal' ? 33 : customWeights[signal.key]}
                    disabled={weightMode === 'equal'}
                    onChange={(event) => setCustomWeights((current) => ({ ...current, [signal.key]: Number(event.target.value) }))}
                  />
                </label>
              ))}
            </div>
            <p className="vibe-note"><strong>Pure Vibe™ 🏄</strong> The original 35 / 30 / 35 weights were educated guesses, not an empirically validated model.</p>
          </section>
        </section>

        <section id="mental-model" className="section convergence-lesson" aria-labelledby="lesson-title">
          <p className="eyebrow">02 / Pourquoi la convergence</p>
          <h2 id="lesson-title">Clue. Context. Hypothesis.</h2>
          <div className="convergence-lesson__steps">
            <article><span>1</span><h3>One signal is a clue</h3><p>It might be meaningful—or completely unrelated.</p></article>
            <article><span>2</span><h3>Two signals create context</h3><p>Independent evidence begins to explain what may be changing.</p></article>
            <article><span>3</span><h3>Three signals create a hypothesis</h3><p>A defensible reason to investigate now, not proof of intent.</p></article>
          </div>
          <blockquote>“Signals don't tell you who will buy. They tell you where asking the next question is more justified.”</blockquote>
          <aside className="honesty-rail"><strong>Model limits</strong><span>Correlated signals are not automatically independent evidence.</span><span>Missing public evidence does not mean a signal is absent.</span><span>A score orders investigation; it does not prove intent.</span></aside>
        </section>

        <section id="system" className="section signal-system" aria-labelledby="system-title">
          <p className="eyebrow">03 / Du signal au système</p>
          <h2 id="system-title">The final enrichment is the outcome.</h2>
          <ol className="signal-pipeline" aria-label="Signal feedback system">
            {pipeline.map((stage, index) => <li key={stage}><span>{String(index + 1).padStart(2, '0')}</span>{stage}</li>)}
          </ol>
          <p>The loop is the engineering work. If certain combinations consistently lead to responses, meetings, or progression, outcomes should improve the model. If they do not, change the assumptions.</p>
        </section>

        <section className="section convergence-learning" aria-labelledby="learning-title">
          <p className="eyebrow">04 / Ce que j'ai appris</p>
          <h2 id="learning-title">The number was never the hard part.</h2>
          <div>
            <p>I initially treated scoring as the difficult part. The harder question was whether the weights meant anything.</p>
            <p>A model can look quantitative while still encoding subjective assumptions. The useful abstraction became: how many independent pieces of evidence tell the same story?</p>
            <p>GTM scoring should be a hypothesis that gets tested against outcomes.</p>
          </div>
        </section>

        <section id="replicate" className="section replication" aria-labelledby="replicate-title">
          <p className="eyebrow">05 / Construisez le vôtre</p>
          <h2 id="replicate-title">How to build this yourself.</h2>
          <ol>{replicationSteps.map((step) => <li key={step}>{step}</li>)}</ol>
          <p>The pattern is tool-independent. Inputs can come from Clay, CRM data, a warehouse and dbt, APIs, enrichment providers, product telemetry, or intent sources.</p>
          <div className="replication__footer">
            <a className="button" href={baseUrl}>Return to portfolio</a>
            <a className="text-link" href={`${baseUrl}hospital-tam/`}>Explore the hospital TAM</a>
            <a className="text-link" href={`mailto:${portfolio.person.email}`}>Discuss a GTM data system</a>
          </div>
        </section>
      </main>
    </>
  )
}
