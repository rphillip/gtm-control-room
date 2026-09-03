# GTM Control Room Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a fast, mobile-first React portfolio that proves Ryan Sulapas is a data-native healthcare GTM engineer through sanitized Clay systems, measurable case studies, and an interactive GTM Control Room.

**Architecture:** A static React/Vite application renders typed authored content plus a committed, allowlisted Clay snapshot. A local sync script calls the authenticated Clay CLI, sanitizes responses through pure functions, and writes only aggregate metrics and topology safe for publication. GitHub Actions builds the static site and deploys it to GitHub Pages without receiving Clay credentials.

**Tech Stack:** React 19, TypeScript 5, Vite 7, Vitest, Testing Library, Playwright, CSS Modules/global CSS, locally bundled font packages, GitHub Actions, GitHub Pages, Clay CLI.

**Spec:** `docs/superpowers/specs/2026-09-03-gtm-control-room-portfolio-design.md`

## Global Constraints

- The first screen must communicate healthcare focus, data-system thinking, and deep engineering within 30 seconds.
- The public build must contain no contact-level Clay records, internal Clay identifiers, raw API responses, private workflow URLs, credentials, or phone number.
- Only observed aggregate metrics may be presented as facts; sampled health must be labeled as sampled.
- Campaigns must appear as an activation layer not yet shipped because this Clay workspace currently contains zero Campaigns.
- The site must work from 320 px mobile widths through desktop and support keyboard, reduced-motion, and forced-colors users.
- Initial JavaScript target: under 150 kB compressed, excluding locally bundled fonts.
- Production targets: Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- No runtime Clay request or client-side secret is allowed in the first release.
- A future project must be addable through one typed content entry plus optional local media.

## Planned File Structure

```text
.
├── .github/workflows/deploy-pages.yml       # GitHub Pages build and deployment
├── docs/superpowers/                        # Approved specification and this plan
├── e2e/portfolio.spec.ts                    # Mobile/desktop browser checks
├── public/favicon.svg                       # Lightweight brand mark
├── scripts/
│   ├── clay/commands.mjs                    # Safe execFile wrapper for read-only Clay commands
│   ├── clay/sanitize.mjs                    # Pure allowlist sanitizer
│   ├── clay/sanitize.test.ts                # Sanitizer regression tests
│   └── sync-clay.mjs                        # Resolve named resources and write sanitized snapshot
├── src/
│   ├── components/
│   │   ├── CaseStudy.tsx                    # Reusable long-form project presentation
│   │   ├── ControlRoom.tsx                  # Interactive closed-loop system diagram
│   │   ├── MetricStrip.tsx                  # Accessible aggregate metrics
│   │   ├── SiteHeader.tsx                   # Compact navigation
│   │   └── SystemRegistry.tsx               # Tables/signals/function/workflow inventory
│   ├── content/
│   │   ├── portfolio.ts                     # Bio, case studies, public links
│   │   ├── types.ts                         # Content contracts
│   │   └── validate.ts                      # Runtime content validation
│   ├── data/clay-snapshot.json              # Sanitized build-time data only
│   ├── styles/global.css                    # Tokens, layout, motion, responsive behavior
│   ├── test/setup.ts                        # Testing Library matchers
│   ├── App.test.tsx                         # App-level behavior and fallback tests
│   ├── App.tsx                              # Page composition
│   └── main.tsx                             # React entry point
├── index.html                               # Metadata and root element
├── package.json                             # Commands and dependency versions
├── playwright.config.ts                     # Browser test configuration
├── tsconfig.json                            # TypeScript project configuration
└── vite.config.ts                           # Build base path and Vitest config
```

---

### Task 1: Scaffold the Typed React Application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`
- Create: `src/content/types.ts`
- Create: `src/content/validate.ts`
- Test: `src/content/validate.test.ts`

**Interfaces:**
- Produces: `PortfolioContent`, `CaseStudyContent`, `Metric`, `ClaySnapshot`, and `validatePortfolio(value: unknown): PortfolioContent`.
- Consumes: no application code.

- [ ] **Step 1: Create project configuration and install dependencies**

Create `package.json` with these scripts and dependency boundaries:

```json
{
  "name": "gtm-control-room",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "sync:clay": "node scripts/sync-clay.mjs"
  },
  "dependencies": {
    "@fontsource-variable/newsreader": "^5.2.6",
    "@fontsource/ibm-plex-mono": "^5.2.6",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "@testing-library/jest-dom": "^6.8.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^24.3.0",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.2",
    "jsdom": "^26.1.0",
    "typescript": "^5.9.2",
    "vite": "^7.1.4",
    "vitest": "^3.2.4"
  }
}
```

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 2: Write a failing portfolio-validation test**

```ts
import { describe, expect, it } from 'vitest'
import { validatePortfolio } from './validate'

describe('validatePortfolio', () => {
  it('accepts a project with observed metrics and a labeled sample', () => {
    const content = validatePortfolio({
      person: { name: 'Ryan Sulapas', email: 'ryansulapas@gmail.com', linkedIn: 'https://www.linkedin.com/in/ryan-s-75366514/' },
      caseStudies: [{
        slug: 'signal-engine',
        title: 'Multi-Signal Account Engine',
        summary: 'Turns heterogeneous signals into a ranked account queue.',
        metrics: [{ label: 'High priority', value: '11', provenance: 'observed' }],
        stages: ['Detect', 'Normalize', 'Score'],
        buildLog: ['Joined BLS risk data to account-level intent.'],
        failures: ['1 of 10 sampled AutoTier intent actions errored.'],
        reflection: 'Missing-data behavior belongs in the scoring contract.'
      }]
    })
    expect(content.caseStudies[0].metrics[0].provenance).toBe('observed')
  })

  it('rejects private Clay identifiers in public content', () => {
    expect(() => validatePortfolio({ person: {}, caseStudies: [{ slug: 'wf_123' }] })).toThrow(/private identifier/i)
  })
})
```

- [ ] **Step 3: Run the test and verify the red state**

Run: `npm test -- src/content/validate.test.ts`

Expected: FAIL because `validatePortfolio` and its types do not exist.

- [ ] **Step 4: Implement the content contracts and minimal validator**

Define exact public contracts in `src/content/types.ts`:

```ts
export type MetricProvenance = 'observed' | 'sampled'

export interface Metric {
  label: string
  value: string
  provenance: MetricProvenance
}

export interface CaseStudyContent {
  slug: string
  title: string
  summary: string
  metrics: Metric[]
  stages: string[]
  buildLog: string[]
  failures: string[]
  reflection: string
}

export interface PortfolioContent {
  person: { name: string; email: string; linkedIn: string }
  caseStudies: CaseStudyContent[]
}

export interface ClaySnapshot {
  generatedAt: string
  signals: { name: string; type: string; status: 'Active' | 'Errored'; cadence: string; inputKind: 'table' | 'audience' }[]
  function: { name: 'AutoTier'; contract: string }
  workflows: { name: string; nodes: { name: string; type: string }[]; edges: [number, number][] }[]
  aggregates: Record<string, number | Record<string, number>>
}
```

Implement `validatePortfolio` in `src/content/validate.ts` with structural checks and a recursive string scan:

```ts
import type { PortfolioContent } from './types'

const privateId = /\b(?:wf_|wfn_|td_|sig_|t_|f_|wb_|rec_)[A-Za-z0-9_-]+\b/

export function validatePortfolio(value: unknown): PortfolioContent {
  const serialized = JSON.stringify(value)
  if (privateId.test(serialized)) throw new Error('Public content contains a private identifier')
  if (!value || typeof value !== 'object') throw new Error('Portfolio content must be an object')
  const candidate = value as Partial<PortfolioContent>
  if (!candidate.person?.name || !candidate.person.email || !candidate.person.linkedIn) throw new Error('Public identity is incomplete')
  if (!Array.isArray(candidate.caseStudies) || candidate.caseStudies.length < 2) throw new Error('At least two case studies are required')
  for (const study of candidate.caseStudies) {
    if (!study.slug || !study.title || !study.summary || !study.reflection) throw new Error('Case study copy is incomplete')
    if (!Array.isArray(study.metrics) || !Array.isArray(study.stages) || !Array.isArray(study.buildLog) || !Array.isArray(study.failures)) throw new Error('Case study collections are invalid')
  }
  return candidate as PortfolioContent
}
```

- [ ] **Step 5: Add Vite, TypeScript, test setup, HTML metadata, and the React mount**

Configure Vitest for `jsdom`, load `@testing-library/jest-dom/vitest`, derive the Pages base path from `GITHUB_REPOSITORY`, and create an accessible `#root` mount. `index.html` must include title “Ryan Sulapas — Healthcare GTM Data Engineer,” description, viewport, theme color, and favicon link.

- [ ] **Step 6: Run validation tests and production compilation**

Run: `npm test -- src/content/validate.test.ts && npm run build`

Expected: both validator tests PASS and the build exits 0.

- [ ] **Step 7: Commit the typed foundation**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html src
git commit -m "feat: scaffold typed portfolio app"
```

---

### Task 2: Build the Sanitized Clay Snapshot Pipeline

**Files:**
- Create: `scripts/clay/commands.mjs`
- Create: `scripts/clay/sanitize.mjs`
- Test: `scripts/clay/sanitize.test.ts`
- Create: `scripts/sync-clay.mjs`
- Create: `src/data/clay-snapshot.json`

**Interfaces:**
- Consumes: `ClaySnapshot` shape from `src/content/types.ts`; authenticated `clay` executable on local PATH.
- Produces: `sanitizeClay(raw): ClaySnapshot`, `runClay(args: string[]): Promise<unknown>`, and a safe `src/data/clay-snapshot.json`.

- [ ] **Step 1: Write failing sanitizer tests with intentionally unsafe input**

```ts
import { describe, expect, it } from 'vitest'
import { sanitizeClay } from './sanitize.mjs'

describe('sanitizeClay', () => {
  it('keeps aggregate topology while removing ids, URLs, prompts, and row values', () => {
    const safe = sanitizeClay({
      signals: [{ id: 'td_secret', name: 'Event: New hire', runStatus: 'Active', signal: { type: 'NewHire' }, inputKind: 'table', schedule: { periodUnit: 'quarterly' } }],
      workflows: [{ name: 'Turquoise Immature', url: 'https://private', nodes: [{ id: 'wfn_secret', name: 'Segment', nodeType: 'trigger', contentPreview: 'private prompt' }], edges: [] }],
      function: { name: 'AutoTier', inputSchema: { properties: { Value: {}, ClayDomain: {}, 'Column Name': {} } } },
      aggregates: { scoredAccounts: 60 }
    })
    expect(safe.signals[0]).toEqual({ name: 'Event: New hire', type: 'NewHire', status: 'Active', cadence: 'quarterly', inputKind: 'table' })
    expect(JSON.stringify(safe)).not.toMatch(/td_secret|wfn_secret|private prompt|https:\/\/private/)
    expect(safe.aggregates.scoredAccounts).toBe(60)
  })

  it('rejects unapproved workflow names and negative aggregates', () => {
    expect(() => sanitizeClay({ signals: [], workflows: [{ name: 'Customer Export', nodes: [], edges: [] }], function: null, aggregates: {} })).toThrow(/workflow allowlist/i)
    expect(() => sanitizeClay({ signals: [], workflows: [], function: null, aggregates: { scoredAccounts: -1 } })).toThrow(/aggregate/i)
  })
})
```

- [ ] **Step 2: Run the sanitizer tests and verify the red state**

Run: `npm test -- scripts/clay/sanitize.test.ts`

Expected: FAIL because `sanitizeClay` does not exist.

- [ ] **Step 3: Implement strict allowlist sanitization**

In `scripts/clay/sanitize.mjs`, allow only these assets:

```js
const allowedWorkflows = new Set(['Turquoise Immature', 'Turquoise Operator Enrichment'])
const allowedSignals = new Set(['Event: Company topic intent', 'Event: Job posting', 'Event: New hire', 'OSHA news'])
const allowedNodeTypes = new Set(['trigger', 'conditional', 'tool', 'agent'])

export function sanitizeClay(raw) {
  for (const workflow of raw.workflows) {
    if (!allowedWorkflows.has(workflow.name)) throw new Error('Workflow allowlist rejected an entry')
  }
  for (const value of Object.values(raw.aggregates)) {
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) throw new Error('Aggregate value is invalid')
  }
  return {
    generatedAt: new Date().toISOString(),
    signals: raw.signals.filter((item) => allowedSignals.has(item.name)).map((item) => ({
      name: item.name,
      type: item.signal.type,
      status: item.runStatus,
      cadence: item.schedule.periodUnit,
      inputKind: item.inputKind
    })),
    function: { name: 'AutoTier', contract: 'Value + company domain + scoring dimension → tier' },
    workflows: raw.workflows.map((workflow) => ({
      name: workflow.name,
      nodes: workflow.nodes.filter((node) => allowedNodeTypes.has(node.nodeType)).map((node) => ({ name: node.name, type: node.nodeType })),
      edges: workflow.edges.map((edge) => [workflow.nodes.findIndex((node) => node.id === edge.sourceNodeId), workflow.nodes.findIndex((node) => node.id === edge.targetNodeId)])
    })),
    aggregates: structuredClone(raw.aggregates)
  }
}
```

Add a final recursive assertion that rejects keys named `id`, `url`, `contentPreview`, `prompt`, `email`, `phone`, or `rows`, and rejects any string matching the private-ID expression from Task 1.

- [ ] **Step 4: Implement the safe Clay command wrapper**

Use `execFile`, never a shell string, and allow only read commands:

```js
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const allowedPrefixes = [
  ['whoami'], ['workbooks', 'list'], ['tables', 'list'], ['tables', 'get'],
  ['tables', 'columns', 'get'], ['tables', 'rows', 'list'], ['tables', 'query-live'],
  ['signals', 'list'], ['signals', 'get'], ['functions', 'list'], ['functions', 'get'],
  ['workflows', 'list'], ['workflows', 'graph', 'get'], ['campaigns', 'list']
]

export async function runClay(args) {
  const allowed = allowedPrefixes.some((prefix) => prefix.every((part, index) => args[index] === part))
  if (!allowed) throw new Error(`Clay command is not read-only allowlisted: ${args.slice(0, 3).join(' ')}`)
  const { stdout } = await execFileAsync('clay', args, { maxBuffer: 10_000_000 })
  return JSON.parse(stdout)
}
```

- [ ] **Step 5: Implement named-resource resolution and write the snapshot**

`scripts/sync-clay.mjs` must resolve workbooks and tables by exact display name on every run, fetch only the named Week 2/Week 3 resources, compute the published aggregates, sanitize the assembled object, validate that `JSON.stringify(snapshot)` contains no private-ID pattern, and write formatted JSON to `src/data/clay-snapshot.json`.

The committed snapshot must contain these verified values:

```json
{
  "signalsActive": 5,
  "signalsErrored": 1,
  "scoredAccounts": 60,
  "newHireEvents": 27,
  "scoreTiers": { "High": 11, "Medium": 40, "Low": 9 },
  "intentTiers": { "High": 9, "Medium": 37, "Low": 7, "Unclassified": 7 },
  "injuryTiers": { "High": 20, "Medium": 12, "Low": 28 },
  "cmsFacilities": 5419,
  "chspSystems": 639,
  "healthSystemWorkingRows": 922,
  "matureTargets": 139,
  "immatureTargets": 196,
  "payerProviders": 167
}
```

- [ ] **Step 6: Run red-green verification and inspect the generated artifact**

Run: `npm test -- scripts/clay/sanitize.test.ts && npm run sync:clay && npm test`

Expected: sanitizer tests PASS, the sync exits 0, the generated JSON contains no internal IDs or row-level fields, and the full test suite passes.

- [ ] **Step 7: Commit the safe data pipeline**

```bash
git add scripts src/data package.json package-lock.json
git commit -m "feat: add sanitized Clay snapshot pipeline"
```

---

### Task 3: Render the Portfolio Shell and Healthcare-First Hero

**Files:**
- Create: `src/content/portfolio.ts`
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/MetricStrip.tsx`
- Create: `src/App.tsx`
- Test: `src/App.test.tsx`
- Create: `src/styles/global.css`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `PortfolioContent`, `validatePortfolio`, and `ClaySnapshot`.
- Produces: semantic page landmarks, stable IDs `control-room`, `work`, `registry`, `about`, and `contact`, plus `MetricStrip({ metrics }: { metrics: Metric[] })`.

- [ ] **Step 1: Write failing hero and navigation tests**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('portfolio shell', () => {
  it('states the healthcare data wedge on the first screen', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /healthcare GTM problems are usually data problems first/i })).toBeInTheDocument()
    expect(screen.getByText(/signals, models, integrations, and automation/i)).toBeInTheDocument()
  })

  it('exposes keyboard-reachable navigation and public profile links', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /enter the control room/i })).toHaveAttribute('href', '#control-room')
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/ryan-s-75366514/')
    expect(screen.queryByText(/713.?679.?4960/)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the App tests and verify the red state**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `App` and the content module do not exist.

- [ ] **Step 3: Create authored content and compose the semantic shell**

In `portfolio.ts`, validate an object containing Ryan's public identity, the three case-study records from the specification, and hero copy. In `App.tsx`, render this hierarchy:

```tsx
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <SiteHeader />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Ryan Sulapas · Healthcare GTM data systems</p>
          <h1 id="hero-title">Healthcare GTM problems are usually data problems first.</h1>
          <p className="hero__lede">I build the signals, models, integrations, and automation that turn fragmented healthcare data into action.</p>
          <div className="hero__actions">
            <a className="button" href="#control-room">Enter the Control Room</a>
            <a className="text-link" href="https://www.linkedin.com/in/ryan-s-75366514/">LinkedIn</a>
          </div>
        </section>
        <section id="control-room" aria-labelledby="control-room-title" />
        <section id="work" aria-labelledby="work-title" />
        <section id="registry" aria-labelledby="registry-title" />
        <section id="about" aria-labelledby="about-title" />
        <section id="contact" aria-labelledby="contact-title" />
      </main>
    </>
  )
}
```

- [ ] **Step 4: Add the visual tokens and first-screen responsive layout**

Define CSS custom properties for paper, ink, cyan, orange, chartreuse, spacing, type scale, focus ring, and borders. Import only Newsreader variable roman and IBM Plex Mono weights 400/500 in `main.tsx`. Use CSS Grid for the hero, a pseudo-element graph grid, and `clamp()` typography. At 320 px, actions stack and no content exceeds the viewport.

- [ ] **Step 5: Run tests and build**

Run: `npm test -- src/App.test.tsx && npm run build`

Expected: App tests PASS and production build exits 0.

- [ ] **Step 6: Commit the portfolio shell**

```bash
git add src index.html
git commit -m "feat: add healthcare-first portfolio shell"
```

---

### Task 4: Implement the Interactive GTM Control Room

**Files:**
- Create: `src/components/ControlRoom.tsx`
- Test: `src/components/ControlRoom.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: sanitized `ClaySnapshot` and the stages `detect`, `normalize`, `qualify`, `route`, `activate`, `observe`.
- Produces: `ControlRoom({ snapshot }: { snapshot: ClaySnapshot })` with source tabs and selected-stage telemetry.

- [ ] **Step 1: Write failing interaction and accessibility tests**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ControlRoom } from './ControlRoom'
import snapshot from '../data/clay-snapshot.json'

describe('ControlRoom', () => {
  it('updates the explained path when a source is selected', async () => {
    const user = userEvent.setup()
    render(<ControlRoom snapshot={snapshot} />)
    await user.click(screen.getByRole('button', { name: /CMS \+ CHSP/i }))
    expect(screen.getByRole('button', { name: /CMS \+ CHSP/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(/5,419 CMS facility rows/i)
  })

  it('uses standard buttons in document order without drag-only behavior', () => {
    render(<ControlRoom snapshot={snapshot} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.textContent)).toEqual(expect.arrayContaining(['Hiring + intent', 'CMS + CHSP', 'BLS injury data']))
  })
})
```

- [ ] **Step 2: Run the component tests and verify the red state**

Run: `npm test -- src/components/ControlRoom.test.tsx`

Expected: FAIL because `ControlRoom` does not exist.

- [ ] **Step 3: Implement deterministic source-to-stage data**

Use a module-level configuration so render work is stable:

```ts
const paths = {
  signals: {
    label: 'Hiring + intent',
    telemetry: '60 accounts · 27 new-hire events · 5 active watches',
    stages: ['detect', 'normalize', 'qualify', 'route']
  },
  healthcare: {
    label: 'CMS + CHSP',
    telemetry: '5,419 CMS facility rows joined to 639 CHSP health systems',
    stages: ['detect', 'normalize', 'qualify', 'route', 'activate']
  },
  safety: {
    label: 'BLS injury data',
    telemetry: '9 industry series → 20 high / 12 medium / 28 low',
    stages: ['detect', 'normalize', 'qualify']
  }
} as const
```

Implement buttons with `aria-pressed`, a six-stage ordered list, a polite status region, and a visible failure rail containing the OSHA taxonomy error and sampled AutoTier failure. Do not include raw Clay prompts, IDs, or company/contact names.

- [ ] **Step 4: Style the memorable interaction for desktop and mobile**

Use a horizontal CSS grid above 800 px and a vertical rail below it. Active paths use border/color changes plus textual state markers. Animate a wrapper with opacity/translate only; under `prefers-reduced-motion: reduce`, set transition and animation durations to `0.01ms` and remove automatic pulses.

- [ ] **Step 5: Run tests and build**

Run: `npm test -- src/components/ControlRoom.test.tsx && npm run build`

Expected: interaction tests PASS and build exits 0.

- [ ] **Step 6: Commit the Control Room**

```bash
git add src/components/ControlRoom.tsx src/components/ControlRoom.test.tsx src/App.tsx src/styles/global.css
git commit -m "feat: build interactive GTM Control Room"
```

---

### Task 5: Add Case Studies, Failure Logs, Registry, and Career Narrative

**Files:**
- Create: `src/components/CaseStudy.tsx`
- Create: `src/components/SystemRegistry.tsx`
- Create: `src/components/CaseStudy.test.tsx`
- Modify: `src/components/MetricStrip.tsx`
- Modify: `src/content/portfolio.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `CaseStudyContent`, `Metric[]`, and `ClaySnapshot`.
- Produces: `CaseStudy({ study, index })`, `SystemRegistry({ snapshot })`, build-log disclosure, failure notes, reflection, and healthcare-first career copy.

- [ ] **Step 1: Write failing content and disclosure tests**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CaseStudy } from './CaseStudy'
import { portfolio } from '../content/portfolio'

describe('CaseStudy', () => {
  it('shows evidence provenance and expands the build log', async () => {
    const user = userEvent.setup()
    render(<CaseStudy study={portfolio.caseStudies[0]} index={0} />)
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText(/observed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /open build log/i }))
    expect(screen.getByText(/normalized company identity/i)).toBeVisible()
  })

  it('presents failures without converting samples into global rates', () => {
    render(<CaseStudy study={portfolio.caseStudies[1]} index={1} />)
    expect(screen.getByText(/ten-row CMS sample/i)).toBeInTheDocument()
    expect(screen.queryByText(/match rate/i)).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests and verify the red state**

Run: `npm test -- src/components/CaseStudy.test.tsx`

Expected: FAIL because the case-study component and final content are incomplete.

- [ ] **Step 3: Implement the three authored case studies**

Populate `portfolio.ts` from the approved specification with these titles and exact evidence boundaries:

```ts
const caseStudyTitles = [
  'Multi-Signal Account Engine',
  'Healthcare Market Map',
  'Activation Workflows'
] as const
```

Each record must contain a one-sentence problem, ordered stages, observed metrics, a numbered build log, at least one failure/limitation, and a first-person reflective script. Use “sampled” provenance for the ten-row AutoTier and CMS health observations.

- [ ] **Step 4: Implement reusable case-study presentation**

Render `article`, numbered metadata, an architecture rail, `MetricStrip`, an accessible disclosure button with `aria-expanded`, a failure block headed “What broke / what was missing,” and a final “What I would change in production” reflection. Screenshot-like evidence must be built from anonymized CSS/SVG system views and adjacent descriptive text.

- [ ] **Step 5: Implement the System Registry**

Render four tabs with these observed summaries:

- Tables: Week 2 and Week 3 source/pipeline inventory.
- Signals: five active, one errored; types include topic intent, job posting, new hire, and news.
- Function: AutoTier's public input/output contract.
- Workflows: Turquoise Immature and Turquoise Operator Enrichment node diagrams.

The Campaigns row must state: “0 campaigns in this workspace · activation output prepared, campaign execution not yet shipped.”

- [ ] **Step 6: Add the healthcare-first career narrative and contact section**

Lead with BetterHelp, Cylinder Health, and Optum/AbleTo experience. State “4+ years building cloud data platforms across startup and digital-health environments.” Mention two years of oil-and-gas data consulting once, as the origin of the multiweek-to-ten-minute automation example. Do not include the broader oil-and-gas project scale, schedule claims, or phone number.

- [ ] **Step 7: Run component and full-suite verification**

Run: `npm test -- src/components/CaseStudy.test.tsx && npm test && npm run build`

Expected: all tests PASS and build exits 0.

- [ ] **Step 8: Commit the portfolio body**

```bash
git add src
git commit -m "feat: add evidence-led GTM case studies"
```

---

### Task 6: Verify Responsive, Accessible, and Fast Behavior

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/portfolio.spec.ts`
- Create: `public/favicon.svg`
- Modify: `src/styles/global.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: production application from Tasks 1–5.
- Produces: repeatable browser checks at mobile and desktop viewports and final visual/accessibility refinements.

- [ ] **Step 1: Write failing browser tests for mobile overflow and core navigation**

```ts
import { expect, test } from '@playwright/test'

for (const viewport of [{ width: 320, height: 800 }, { width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  test(`portfolio works at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Healthcare GTM problems')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    await page.getByRole('link', { name: 'Enter the Control Room' }).click()
    await expect(page.locator('#control-room')).toBeInViewport()
  })
}

test('keyboard focus and reduced motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).not.toBe('smooth')
})
```

- [ ] **Step 2: Run the browser tests and verify the red state**

Run: `npx playwright install chromium && npm run build && npm run test:e2e`

Expected: at least one test FAIL until the server configuration and responsive details are complete.

- [ ] **Step 3: Configure Playwright against Vite preview**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true }
})
```

- [ ] **Step 4: Fix responsive and accessibility failures**

Add `min-width: 0` to grid children, `overflow-wrap: anywhere` to telemetry, 44 px minimum interactive targets, `:focus-visible` treatment, forced-colors borders, non-color selected-state markers, and reduced-motion overrides. Confirm every section has a heading and every decorative SVG is `aria-hidden="true"`.

- [ ] **Step 5: Add metadata and lightweight favicon**

Add canonical-ready metadata, Open Graph title/description, color-scheme, and a simple inline-shape SVG favicon that contains no embedded text or raster image. The actual production URL is inserted after repository creation.

- [ ] **Step 6: Run full automated verification**

Run: `npm test && npm run build && npm run test:e2e`

Expected: unit/component tests PASS, build exits 0, and all viewport/browser checks PASS.

- [ ] **Step 7: Inspect the production bundle budget**

Run: `find dist/assets -name '*.js' -print0 | xargs -0 gzip -c | wc -c`

Expected: total compressed JavaScript is below 153600 bytes. If it exceeds the target, remove avoidable dependencies or split below-the-fold modules before continuing.

- [ ] **Step 8: Commit quality and browser verification**

```bash
git add e2e playwright.config.ts public src/styles index.html
git commit -m "test: verify responsive accessible portfolio"
```

---

### Task 7: Document Extension Workflow and Deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create: `README.md`
- Modify: `vite.config.ts`
- Modify: `index.html`

**Interfaces:**
- Consumes: verified static Vite build and authenticated GitHub CLI/account.
- Produces: GitHub repository, Pages deployment workflow, public URL, and future-project instructions.

- [ ] **Step 1: Write the deployment workflow**

```yaml
name: Deploy portfolio to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Document local use, Clay refresh, privacy, and future projects**

README sections must cover: local setup, tests, production build, `npm run sync:clay`, the read-only allowlist, fields that are intentionally excluded, deployment, and this exact future-project procedure:

1. Add one `CaseStudyContent` object to `src/content/portfolio.ts`.
2. Add optional sanitized assets under `public/projects/<slug>/`.
3. Run `npm test && npm run build && npm run test:e2e`.
4. Confirm no internal Clay ID or contact-level record appears in the diff.

- [ ] **Step 3: Run final local verification before creating the remote**

Run: `npm test && npm run build && npm run test:e2e && git status --short`

Expected: all checks PASS; only the deployment and README files are uncommitted.

- [ ] **Step 4: Commit deployment configuration and documentation**

```bash
git add .github/workflows/deploy-pages.yml README.md vite.config.ts index.html
git commit -m "ci: deploy portfolio to GitHub Pages"
```

- [ ] **Step 5: Create the GitHub repository and push**

Check authentication and name availability:

```bash
gh auth status
gh repo view gtmweb
```

If `gtmweb` does not exist, create it from the current directory:

```bash
gh repo create gtmweb --public --source=. --remote=origin --push
```

If the name belongs to another project, use the documented fallback:

```bash
gh repo create gtm-control-room --public --source=. --remote=origin --push
```

- [ ] **Step 6: Enable and verify GitHub Pages**

Configure Pages to use GitHub Actions, watch the deployment, and read the published URL:

```bash
gh api --method POST repos/{owner}/{repo}/pages -f build_type=workflow
gh run list --workflow deploy-pages.yml --limit 1
gh run watch --exit-status
gh api repos/{owner}/{repo}/pages --jq .html_url
```

If Pages already exists, the POST may report that it is already configured; verify `build_type` is `workflow` before treating that response as success.

- [ ] **Step 7: Verify the live site and update canonical metadata**

Open the returned public URL, verify the hero, Control Room, all three case studies, LinkedIn/email links, mobile layout, and absence of private IDs. Replace the canonical and Open Graph URL values in `index.html` with the verified URL, then commit and push:

```bash
git add index.html
git commit -m "chore: set production portfolio URL"
git push origin main
```

- [ ] **Step 8: Run final remote checks**

Run: `gh run watch --exit-status` and fetch the published URL with an HTTP HEAD request.

Expected: the Pages workflow succeeds and the public URL returns HTTP 200.
