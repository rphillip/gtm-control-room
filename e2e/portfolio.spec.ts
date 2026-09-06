import { expect, test, type Locator, type Page } from '@playwright/test'

const sitePath = '/gtm-control-room/'
const convergencePath = `${sitePath}signal-convergence/`
const hospitalTamPath = `${sitePath}hospital-tam/`

async function tabTo(page: Page, target: Locator, maximumTabs = 50) {
  for (let index = 0; index < maximumTabs; index += 1) {
    await page.keyboard.press('Tab')
    if (await target.evaluate((element) => element === document.activeElement)) return
  }

  throw new Error(`Could not reach ${await target.getAttribute('aria-label') ?? await target.textContent()} by keyboard`)
}

for (const viewport of [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
]) {
  test(`portfolio navigation has no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto(sitePath)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Healthcare GTM problems')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)

    await page.getByRole('link', { name: 'See the case studies' }).click()
    await expect(page.locator('#work')).toBeInViewport()
    await page.getByRole('navigation', { name: 'Portfolio sections' }).getByRole('link', { name: 'Technical proof' }).click()
    await expect(page.locator('#registry')).toBeInViewport()
  })
}

for (const viewport of [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
]) {
  test(`Hospital TAM has no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const response = await page.goto(hospitalTamPath)

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('5,000 Hospitals')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)

    const walkthrough = page.locator('#walkthrough')
    for (const label of ['Join to health systems', 'Resolve to GTM companies', 'Now count prospects']) {
      await walkthrough.getByRole('button', { name: new RegExp(label, 'i') }).click()
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
    }
    await expect(walkthrough.locator('.tam-final-count > div').nth(0)).toContainText('10')
    await expect(walkthrough.locator('.tam-final-count > div').nth(1)).toContainText('4')
    await expect(walkthrough.locator('.tam-final-count > div').nth(2)).toContainText('3')
  })
}

test('Hospital TAM deep link reloads with honest synthetic and source framing', async ({ page }) => {
  const requestedUrls: string[] = []
  page.on('request', (request) => requestedUrls.push(request.url()))
  await page.goto(hospitalTamPath)
  await page.reload()

  await expect(page).toHaveTitle(/5,000 Hospitals Don’t Mean 5,000 Prospects/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rphillip.github.io/gtm-control-room/hospital-tam/')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /default-src 'self';.*object-src 'none';.*form-action 'none'/)
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'same-origin')
  await expect(page.getByText(/Independent portfolio exercise/i)).toBeVisible()
  await expect(page.getByText('No data background needed.')).toBeVisible()
  await expect(page.getByText(/Every name, identifier, relationship, and domain.*invented/i)).toBeVisible()
  await expect(page.getByText(/not a purchase-intent model/i)).toBeVisible()
  await expect(page.getByText(/review queue—not force them/i)).not.toBeVisible()
  await expect(page.getByRole('link', { name: 'CMS Hospital General Information' })).toHaveAttribute('href', 'https://data.cms.gov/provider-data/dataset/xubh-q36u')
  await expect(page.getByRole('link', { name: /AHRQ 2023 linkage documentation/i })).toHaveAttribute('rel', /noreferrer/)

  await page.locator('#walkthrough').getByRole('button', { name: /Now count prospects/i }).click()
  await expect(page.locator('[data-artifact-data-ball]')).toHaveCSS('animation-name', 'tam-ball-account')
  await expect(page.getByText(/review queue—not force them/i)).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/guaranteed buyer|will convert|real patient/i)
  const pageOrigin = new URL(page.url()).origin
  expect(requestedUrls.every((url) => new URL(url).origin === pageOrigin)).toBe(true)
})

test('Hospital TAM supports keyboard controls, reduced motion, forced colors, and 200% zoom', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.setViewportSize({ width: 640, height: 800 })
  await page.goto(hospitalTamPath)

  const walkthrough = page.locator('#walkthrough')
  await expect(walkthrough).toBeVisible()
  const next = walkthrough.getByRole('button', { name: /Next layer/i })
  await next.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /Join to health systems/i })).toHaveAttribute('aria-current', 'step')
  expect(await page.locator('[data-artifact-data-ball]').evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration) || 0)).toBeLessThan(0.01)

  const firstCheck = page.locator('#checklist input[type="checkbox"]').first()
  await firstCheck.focus()
  await page.keyboard.press('Space')
  await expect(firstCheck).toBeChecked()
  await expect(page.locator('#checklist').getByRole('status')).toContainText('1 of 10 TAM checks complete')
  expect(await firstCheck.locator('..').evaluate((label) => getComputedStyle(label).cursor)).toBe('pointer')

  await page.evaluate(() => { document.documentElement.style.zoom = '2' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

for (const viewport of [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
]) {
  test(`Signal Convergence has no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    const response = await page.goto(convergencePath)

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: 'Signal Convergence Playground' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)

    for (const signal of await page.getByRole('checkbox').all()) await signal.check()
    await page.getByRole('radio', { name: 'Custom weight' }).check()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
  })
}

test('Signal Convergence deep link reloads and teaches all three signals without predictive claims', async ({ page }) => {
  await page.goto(convergencePath)
  await page.reload()
  await expect(page).toHaveTitle(/Signal Convergence Playground/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://rphillip.github.io/gtm-control-room/signal-convergence/')
  await expect(page.getByText('100% synthetic')).toBeVisible()
  await expect(page.getByText('No data background needed.')).toBeVisible()

  const status = page.getByRole('status')
  await expect(status).toContainText('0 of 3 signals')
  for (const signal of await page.getByRole('checkbox').all()) await signal.check()
  await expect(page.locator('[data-artifact-data-ball]')).toHaveCSS('animation-name', 'signal-ball-hypothesis')
  await expect(status).toContainText('3 of 3 signals')
  await expect(status).toContainText('Strong convergence — investigate now')
  await expect(status).toContainText('None of these proves buying intent')
  await expect(page.getByRole('meter')).toHaveAttribute('value', '100')
  await expect(page.locator('body')).not.toContainText(/ready to buy|high purchase intent|will convert/i)
  await expect(page.getByRole('link', { name: 'Return to portfolio' })).toHaveAttribute('href', sitePath)
})

test('Signal Convergence supports keyboard controls, reduced motion, and forced colors', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.goto(convergencePath)

  const firstSignal = page.getByRole('checkbox').first()
  await firstSignal.focus()
  await page.keyboard.press('Space')
  await expect(firstSignal).toBeChecked()
  await expect(page.getByRole('status')).toContainText('1 of 3 signals')
  expect(await page.locator('.convergence-diagram__ball').first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
  )).toBeLessThan(0.01)
  expect(await page.locator('[data-artifact-data-ball]').evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
  )).toBeLessThan(0.01)

  const customMode = page.getByRole('radio', { name: 'Custom weight' })
  await customMode.focus()
  await page.keyboard.press('Space')
  await expect(customMode).toBeChecked()
  expect(await customMode.locator('..').evaluate((label) => getComputedStyle(label, '::after').content)).toContain('✓')
  const firstWeight = page.getByRole('slider').first()
  await firstWeight.focus()
  await page.keyboard.press('ArrowRight')
  await expect(firstWeight).toHaveValue('36')
})

test('keyboard traversal activates the Control Room and registry', async ({ page }) => {
  await page.goto(sitePath)

  const skipLink = page.getByRole('link', { name: 'Skip to main content' })
  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()

  const healthcareSource = page.getByRole('button', { name: /CMS \+ CHSP/i })
  await tabTo(page, healthcareSource)
  await page.keyboard.press('Enter')
  await expect(healthcareSource).toHaveAttribute('aria-pressed', 'true')
  const machineStatus = page.locator('.control-room__status')
  await expect(machineStatus).toContainText('5,419 CMS facility rows')

  const normalizeStage = page.getByRole('button', { name: /02 Normalize/i })
  await tabTo(page, normalizeStage)
  await page.keyboard.press('Space')
  await expect(normalizeStage).toHaveAttribute('aria-pressed', 'true')
  await expect(machineStatus).toContainText('Normalize')

  const registryDisclosure = page.locator('.registry-disclosure > summary')
  await tabTo(page, registryDisclosure)
  await page.keyboard.press('Enter')
  const signalsView = page.getByRole('button', { name: 'Signals', exact: true })
  await tabTo(page, signalsView)
  await page.keyboard.press('Enter')
  await expect(signalsView).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Signals registry' })).toContainText('active')
})

test('every source retains the canonical loop through Observe then Improve', async ({ page }) => {
  await page.goto(sitePath)

  const loop = page.getByRole('list', { name: 'GTM operating loop' })
  await expect(loop.getByRole('button')).toHaveCount(7)
  expect(await loop.getByRole('button').evaluateAll((buttons) =>
    buttons.map((button) => button.querySelector('.control-room__stage-name')?.textContent),
  )).toEqual([
    'Detect', 'Normalize', 'Qualify', 'Route', 'Activate', 'Observe', 'Improve',
  ])

  const sources = page.getByLabel('Public data sources').getByRole('button')
  for (let index = 0; index < await sources.count(); index += 1) {
    await sources.nth(index).click()
    expect(await loop.locator('.is-on-path button').evaluateAll((buttons) =>
      buttons.slice(-2).map((button) => button.querySelector('.control-room__stage-name')?.textContent),
    )).toEqual(['Observe', 'Improve'])
  }
})

test('reduced motion and forced colors preserve usable state changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.goto(sitePath)

  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  expect(await page.evaluate(() => matchMedia('(forced-colors: active)').matches)).toBe(true)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')

  const selectedStage = page.getByRole('button', { name: /01 Detect/i })
  const transitionDuration = await selectedStage.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration) || 0,
  )
  expect(transitionDuration).toBeLessThan(0.01)
  expect(await selectedStage.evaluate((element) => getComputedStyle(element).borderTopStyle)).toBe('solid')
  expect(await page.locator('[data-atelier-ball]').evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
  )).toBeLessThan(0.01)

  await page.getByText('See the decisions, failure, and next production step', { exact: true }).first().click()
  expect(await page.locator('[data-case-ball]').first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
  )).toBeLessThan(0.01)

  await page.getByText('Inspect the Clay implementation', { exact: true }).click()
  const signalsView = page.getByRole('button', { name: 'Signals', exact: true })
  await signalsView.click()
  await expect(signalsView).toHaveAttribute('aria-pressed', 'true')
  await expect(signalsView.locator('[aria-hidden="true"]')).toBeVisible()
})

test('case machines expose evidence on focus and retain a permanent caption', async ({ page }) => {
  await page.goto(sitePath)
  await page.getByText('See the decisions, failure, and next production step', { exact: true }).first().click()

  const machine = page.getByRole('figure', { name: 'Multi-Signal Account Engine animated system machine' })
  await expect(machine).toBeVisible()
  const evidence = machine.getByRole('button', { name: /Evidence: 11 High score tier/i })
  await evidence.focus()
  await expect(evidence.locator('.case-machine__tooltip')).toBeVisible()
  await expect(machine.locator('figcaption')).toContainText('Scored accounts')
  await expect(machine.locator('figcaption')).toContainText('60')
})

test('the kinetic selector swaps one case and its evidence mobile without a case-study stack', async ({ page }) => {
  await page.goto(sitePath)
  const selector = page.getByRole('group', { name: 'Choose a case file' })
  const mobile = page.locator('.selected-systems__stage .evidence-mobile')

  await expect(selector.getByRole('button')).toHaveCount(3)
  await expect(page.locator('.selected-systems__stage .case-study')).toHaveCount(1)
  await expect(page.getByRole('figure', { name: 'Multi-Signal Account Engine evidence mobile' })).toBeVisible()
  await expect(mobile).toHaveAttribute('data-mobile-variant', 'multi-signal-account-engine')
  await expect(mobile.locator('.evidence-mobile__beam--main')).toHaveCSS('animation-name', 'mobile-beam-main')

  const market = selector.getByRole('button', { name: /Healthcare Market Map/ })
  await market.click()
  await expect(market).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { level: 3, name: 'Healthcare Market Map' })).toBeVisible()
  await expect(page.getByRole('figure', { name: 'Healthcare Market Map evidence mobile' })).toBeVisible()
  await expect(mobile).toHaveAttribute('data-mobile-variant', 'healthcare-market-map')
  await expect(mobile.locator('.evidence-mobile__beam--main')).toHaveCSS('animation-name', 'market-mobile-main')
  await expect(mobile.locator('.evidence-mobile__orbit')).toBeVisible()

  const activation = selector.getByRole('button', { name: /Activation Workflows/ })
  await activation.click()
  await expect(activation).toHaveAttribute('aria-pressed', 'true')
  await expect(mobile).toHaveAttribute('data-mobile-variant', 'activation-workflows')
  await expect(mobile.locator('.evidence-mobile__beam--main')).toHaveCSS('animation-name', 'activation-mobile-switch')
  await expect(mobile.locator('.evidence-mobile__switch-pin')).toBeVisible()
  await expect(page.locator('.selected-systems__stage .case-study')).toHaveCount(1)
})

test('Matter.js advances the ball and triggers collision-specific machine states', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(sitePath)
  await page.getByRole('navigation', { name: 'Portfolio sections' }).getByRole('link', { name: 'Approach' }).click()

  const machine = page.locator('.contraption[data-physics-engine="matter-js"]')
  await expect(machine).toHaveAttribute('data-physics-state', 'running')
  const ball = machine.locator('[data-physics-ball]')
  const start = await ball.evaluate((element) => ({
    x: Number(element.getAttribute('cx')),
    y: Number(element.getAttribute('cy')),
  }))
  await page.waitForTimeout(450)
  const moved = await ball.evaluate((element) => ({
    x: Number(element.getAttribute('cx')),
    y: Number(element.getAttribute('cy')),
  }))

  expect(Math.hypot(moved.x - start.x, moved.y - start.y)).toBeGreaterThan(2)
  await expect.poll(() => machine.getAttribute('data-physics-active')).not.toBeNull()
  await expect.poll(async () => Number(await machine.getAttribute('data-physics-cycle')), { timeout: 25_000 }).toBeGreaterThan(0)
  await expect.poll(async () => Number(await machine.getAttribute('data-physics-launcher-contacts'))).toBeGreaterThan(0)
  await expect.poll(async () => Number(await machine.getAttribute('data-physics-returns')), { timeout: 15_000 }).toBeGreaterThan(0)
  await expect(machine).not.toHaveAttribute('data-physics-recovered')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(machine).toHaveAttribute('data-physics-state', 'reduced-motion')
  const reduced = await ball.evaluate((element) => `${element.getAttribute('cx')},${element.getAttribute('cy')}`)
  await page.waitForTimeout(250)
  expect(await ball.evaluate((element) => `${element.getAttribute('cx')},${element.getAttribute('cy')}`)).toBe(reduced)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(machine).toHaveAttribute('data-physics-state', 'running')
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  const offscreen = await ball.evaluate((element) => `${element.getAttribute('cx')},${element.getAttribute('cy')}`)
  await page.waitForTimeout(350)
  expect(await ball.evaluate((element) => `${element.getAttribute('cx')},${element.getAttribute('cy')}`)).toBe(offscreen)
})

test('hero and every case machine launch their balls onto a return route', async ({ page }) => {
  test.setTimeout(210_000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(sitePath)

  const atelier = page.locator('.hero__system[data-physics-engine="matter-js"]')
  await atelier.scrollIntoViewIfNeeded()
  await expect(atelier).toHaveAttribute('data-physics-state', 'running')
  const atelierBall = atelier.locator('[data-physics-ball]')
  const atelierStart = await atelierBall.evaluate((element) => `${element.getAttribute('cx')},${element.getAttribute('cy')}`)
  await expect.poll(async () => atelierBall.evaluate((element) => `${element.getAttribute('cx')},${element.getAttribute('cy')}`)).not.toBe(atelierStart)
  await expect.poll(async () => Number(await atelier.getAttribute('data-physics-cycle')), { timeout: 25_000 }).toBeGreaterThan(0)
  await expect.poll(async () => Number(await atelier.getAttribute('data-physics-launcher-contacts'))).toBeGreaterThan(0)
  await expect.poll(async () => Number(await atelier.getAttribute('data-physics-returns')), { timeout: 15_000 }).toBeGreaterThan(0)
  await expect(atelier).not.toHaveAttribute('data-physics-recovered')

  for (const slug of ['multi-signal-account-engine', 'healthcare-market-map', 'activation-workflows']) {
    const selector = page.locator(`[data-case-selector="${slug}"]`)
    await selector.scrollIntoViewIfNeeded()
    await selector.click()
    await expect(selector).toHaveAttribute('data-physics-state', 'running')
    await expect.poll(async () => Number(await selector.getAttribute('data-physics-cycle')), { timeout: 20_000 }).toBeGreaterThan(0)
    await expect.poll(async () => Number(await selector.getAttribute('data-physics-returns')), { timeout: 15_000 }).toBeGreaterThan(0)
    await expect(selector).not.toHaveAttribute('data-physics-recovered')

    const drawer = page.locator('.case-study__drawer')
    await drawer.locator('summary').click()
    const caseMachine = page.locator(`.case-machine[data-machine="${slug}"]`)
    await caseMachine.scrollIntoViewIfNeeded()
    await expect(caseMachine).toHaveAttribute('data-physics-state', 'running')
    await expect.poll(async () => Number(await caseMachine.getAttribute('data-physics-cycle')), { timeout: 30_000 }).toBeGreaterThan(0)
    await expect.poll(async () => Number(await caseMachine.getAttribute('data-physics-launcher-contacts'))).toBeGreaterThan(0)
    await expect.poll(async () => Number(await caseMachine.getAttribute('data-physics-returns')), { timeout: 30_000 }).toBeGreaterThan(0)
    await expect(caseMachine).not.toHaveAttribute('data-physics-recovered')
    await drawer.locator('summary').click()
  }
})

test('every rendered data word receives the themed red highlight', async ({ page }) => {
  await page.goto(sitePath)

  const getCounts = () => page.evaluate(() => {
    const registry = (CSS as typeof CSS & {
      highlights?: { get(name: string): Iterable<Range> | undefined }
    }).highlights
    const ranges = Array.from(registry?.get('themed-data') ?? []).filter((range) => range.startContainer.isConnected)
    const nodes = Array.from(document.body.querySelectorAll('*'))
      .flatMap((element) => Array.from(element.childNodes))
      .filter((node) => node.nodeType === Node.TEXT_NODE)
    const nodeIds = new Map(nodes.map((node, index) => [node, index]))
    const expectedKeys = nodes.flatMap((node) => {
      const matches = Array.from((node.textContent ?? '').matchAll(/\bdata\b/gi))
      return matches.map((match) => `${nodeIds.get(node)}:${match.index}`)
    })
    const highlightedKeys = new Set(ranges.map((range) => `${nodeIds.get(range.startContainer)}:${range.startOffset}`))
    return {
      expected: expectedKeys.length,
      highlighted: ranges.length,
      allExpectedHighlighted: expectedKeys.every((key) => highlightedKeys.has(key)),
      onlyDataWords: ranges.every((range) => /^data$/i.test(range.toString())),
    }
  })

  await expect.poll(async () => {
    const { allExpectedHighlighted } = await getCounts()
    return allExpectedHighlighted
  }).toBe(true)
  const counts = await getCounts()

  expect(counts.onlyDataWords).toBe(true)
  expect(counts.highlighted).toBeGreaterThanOrEqual(counts.expected)
  expect(counts.highlighted).toBeGreaterThan(10)
})

test('the data ball hands off through every section in both scroll directions', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(sitePath)
  const journey = page.locator('[data-scroll-ball]')
  const stops = ['hero', 'control-room', 'work', 'registry', 'about', 'contact']
  const scrollToStop = async (id: string) => {
    await page.evaluate((stopId) => {
      const stopIds = ['hero', 'control-room', 'work', 'registry', 'about', 'contact']
      const index = stopIds.indexOf(stopId)
      const target = document.querySelector(`[data-data-relay="${stopId}"] [data-data-catch]`)!
      const rect = target.getBoundingClientRect()
      const documentY = rect.top + window.scrollY
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const threshold = index === 0 ? 0 : index === stopIds.length - 1 ? maxScroll : Math.min(maxScroll, Math.max(0, documentY - window.innerHeight * 0.38))
      window.scrollTo({ top: threshold, behavior: 'instant' })
    }, id)
  }

  await expect(journey).toHaveCount(1)
  for (const id of stops) {
    await scrollToStop(id)
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(journey).toHaveAttribute('data-scroll-owner', id)
    await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')
    const point = await journey.evaluate((element) => [Number(element.dataset.scrollX), Number(element.dataset.scrollY)])
    expect(point.every(Number.isFinite)).toBe(true)
  }

  for (const id of [...stops].reverse()) {
    await scrollToStop(id)
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    await expect(journey).toHaveAttribute('data-scroll-owner', id)
    await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')
  }
  await expect(journey).toHaveAttribute('data-scroll-direction', 'up')
})

test('each machine launches the data ball offscreen and the next machine catches it', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(sitePath)
  const journey = page.locator('[data-scroll-ball]')
  const segment = await page.evaluate(() => {
    const getY = (id: string) => {
      const target = document.querySelector(`[data-data-relay="${id}"] [data-data-catch]`)!
      const rect = target.getBoundingClientRect()
      return rect.top + window.scrollY
    }
    return { start: 0, end: getY('control-room') - window.innerHeight * 0.38 }
  })
  const go = async (progress: number) => {
    await page.evaluate(({ start, end, progress }) => window.scrollTo({ top: start + (end - start) * progress, behavior: 'instant' }), { ...segment, progress })
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  }
  const expectDockAlignment = async (id: string) => {
    const distance = await page.evaluate((stopId) => {
      const dock = document.querySelector(`[data-data-relay="${stopId}"] [data-data-catch]`)!.getBoundingClientRect()
      const layer = document.querySelector<HTMLElement>('[data-scroll-ball]')!
      return Math.hypot(Number(layer.dataset.scrollX) - (dock.left + dock.width / 2), Number(layer.dataset.scrollY) - (dock.top + dock.height / 2))
    }, id)
    expect(distance).toBeLessThan(3)
  }
  const jumpToRegistry = async () => {
    await page.evaluate(() => {
      const target = document.querySelector('[data-data-relay="registry"] [data-data-catch]')!
      const rect = target.getBoundingClientRect()
      window.scrollTo({ top: rect.top + window.scrollY - window.innerHeight * 0.38, behavior: 'instant' })
    })
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  }

  await go(0)
  await go(0.05)
  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')
  await expectDockAlignment('hero')

  await go(0.12)
  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'launch')
  const launchStart = await journey.evaluate((element) => Number(element.dataset.scrollX))
  await page.waitForTimeout(260)
  const launchLater = await journey.evaluate((element) => Number(element.dataset.scrollX))
  expect(Math.abs(launchLater - launchStart)).toBeGreaterThan(20)

  await go(0.04)
  await expect(journey).toHaveAttribute('data-scroll-mode', 'flight')
  await expect(journey).toHaveAttribute('data-scroll-target', 'hero')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop', { timeout: 1500 })
  await expectDockAlignment('hero')

  await go(0.12)
  await expect(journey).toHaveAttribute('data-scroll-mode', 'launch')

  await expect(journey).toHaveAttribute('data-scroll-mode', 'offscreen', { timeout: 2000 })
  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero')
  const hiddenX = await journey.evaluate((element) => Number(element.dataset.scrollX))
  expect(hiddenX < 0 || hiddenX > 1280).toBe(true)

  await go(0.9)
  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'flight')
  await expect(journey).toHaveAttribute('data-scroll-target', 'control-room')
  const flightStart = await journey.evaluate((element) => Number(element.dataset.scrollX))
  await page.waitForTimeout(260)
  const flightLater = await journey.evaluate((element) => Number(element.dataset.scrollX))
  expect(Math.abs(flightLater - flightStart)).toBeGreaterThan(20)

  await expect(journey).toHaveAttribute('data-scroll-owner', 'control-room', { timeout: 2000 })
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')
  await expectDockAlignment('control-room')

  await go(0.8)
  await expect(journey).toHaveAttribute('data-scroll-owner', 'control-room')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'launch')

  await expect(journey).toHaveAttribute('data-scroll-mode', 'offscreen', { timeout: 2000 })
  await expect(journey).toHaveAttribute('data-scroll-owner', 'control-room')

  await go(0.17)
  await expect(journey).toHaveAttribute('data-scroll-owner', 'control-room')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'flight')
  await expect(journey).toHaveAttribute('data-scroll-target', 'hero')

  await go(0.25)
  await expect(journey).toHaveAttribute('data-scroll-mode', 'flight')
  await expect(journey).toHaveAttribute('data-scroll-target', 'control-room')
  await expect(journey).toHaveAttribute('data-scroll-owner', 'control-room', { timeout: 1500 })
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')

  await go(0.9)
  await go(0.8)
  await expect(journey).toHaveAttribute('data-scroll-mode', 'launch')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'offscreen', { timeout: 2000 })
  await go(0.17)
  await expect(journey).toHaveAttribute('data-scroll-target', 'hero')

  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero', { timeout: 2000 })
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')
  await expectDockAlignment('hero')

  await go(0.05)
  await go(0.12)
  await expect(journey).toHaveAttribute('data-scroll-mode', 'launch')
  await jumpToRegistry()
  await go(0.4)
  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'offscreen', { timeout: 2000 })
  await go(0.04)
  await expect(journey).toHaveAttribute('data-scroll-target', 'hero')
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop', { timeout: 1500 })

  await go(0.05)
  await go(0.12)
  await expect(journey).toHaveAttribute('data-scroll-mode', 'launch')
  await jumpToRegistry()
  await expect(journey).toHaveAttribute('data-scroll-owner', 'registry', { timeout: 3500 })
  await expect(journey).toHaveAttribute('data-scroll-mode', 'loop')
  await expectDockAlignment('registry')
})

test('the data journey becomes static when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(sitePath)

  const journey = page.locator('[data-scroll-ball]')
  await expect(journey).toHaveAttribute('data-motion', 'reduced')
  await expect(journey).toBeHidden()

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(journey).toHaveAttribute('data-motion', 'full')
  await expect(journey).toBeVisible()
  await expect(journey).toHaveAttribute('data-scroll-owner', 'hero')
})

test('the data journey remeasures its docks after an expanded machine changes layout', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(sitePath)
  const registryDock = page.locator('[data-data-relay="registry"] [data-data-catch]')
  const before = await registryDock.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)

  await page.locator('.machine-notes > summary').click()
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  const after = await registryDock.evaluate((element) => element.getBoundingClientRect().top + window.scrollY)
  expect(after).toBeGreaterThan(before)

  await registryDock.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    window.scrollTo({ top: rect.top + window.scrollY - window.innerHeight * 0.38, behavior: 'instant' })
  })
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))

  const journey = page.locator('[data-scroll-ball]')
  await expect(journey).toHaveAttribute('data-scroll-owner', 'registry')
  const alignment = await page.evaluate(() => {
    const dock = document.querySelector('[data-data-relay="registry"] [data-data-catch]')!.getBoundingClientRect()
    const journey = document.querySelector<HTMLElement>('[data-scroll-ball]')!
    return Math.hypot(Number(journey.dataset.scrollX) - (dock.left + dock.width / 2), Number(journey.dataset.scrollY) - (dock.top + dock.height / 2))
  })
  expect(alignment).toBeLessThan(3)
})

test('content remains usable at 200% text zoom', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 })
  await page.goto(sitePath)
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  await page.getByRole('navigation', { name: 'Portfolio sections' }).getByRole('link', { name: 'Approach' }).click()
  await expect(page.locator('#control-room')).toBeInViewport()
})

test('the focused case file expands without layout instability or horizontal overflow', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as typeof window & { __layoutShift: number }
    state.__layoutShift = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (!entry.hadRecentInput) state.__layoutShift += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(sitePath)
  await page.getByText('See the decisions, failure, and next production step', { exact: true }).first().click()
  const machine = page.getByRole('figure', { name: /Multi-Signal Account Engine animated system machine/i })

  await machine.scrollIntoViewIfNeeded()
  await expect(machine).toBeVisible()
  await expect(machine).toHaveAttribute('data-physics-engine', 'matter-js')
  await expect(page.getByRole('heading', { name: 'Three build decisions' })).toBeVisible()

  const pageMetrics = await page.evaluate(() => ({
    layoutShift: (window as typeof window & { __layoutShift: number }).__layoutShift,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }))
  expect(pageMetrics.layoutShift).toBeLessThanOrEqual(0.1)
  expect(pageMetrics.overflow).toBeLessThanOrEqual(1)
})

test('landmarks, headings, targets, images, and local assets meet basic accessibility invariants', async ({ page }) => {
  const requestedUrls: string[] = []
  page.on('request', (request) => requestedUrls.push(request.url()))
  await page.goto(sitePath)

  await expect(page.getByRole('main')).toHaveCount(1)
  await expect(page.getByRole('navigation', { name: 'Portfolio sections' })).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const sectionsWithoutHeadings = await page.locator('section').evaluateAll((sections) =>
    sections
      .filter((section) => !section.querySelector('h1, h2, h3, h4, h5, h6'))
      .map((section) => section.id || section.className),
  )
  expect(sectionsWithoutHeadings).toEqual([])

  const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
    const ids = elements.map((element) => element.id)
    return ids.filter((id, index) => ids.indexOf(id) !== index)
  })
  expect(duplicateIds).toEqual([])

  const brokenHashLinks = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href): href is string => Boolean(href && !document.querySelector(href))),
  )
  expect(brokenHashLinks).toEqual([])

  const undersizedTargets = await page.locator('a:visible, button:visible').evaluateAll((elements) =>
    elements
      .map((element) => ({ label: element.getAttribute('aria-label') || element.textContent?.trim(), rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width < 44 || rect.height < 44)
      .map(({ label, rect }) => `${label}: ${Math.round(rect.width)}x${Math.round(rect.height)}`),
  )
  expect(undersizedTargets).toEqual([])

  const invalidImages = await page.locator('img').evaluateAll((images) =>
    images
      .filter((image) => !image.hasAttribute('alt') || !image.hasAttribute('width') || !image.hasAttribute('height'))
      .map((image) => image.getAttribute('src')),
  )
  expect(invalidImages).toEqual([])

  const faviconHref = await page.locator('link[rel="icon"]').getAttribute('href')
  expect(faviconHref).toBeTruthy()
  const faviconResponse = await page.request.get(new URL(faviconHref!, page.url()).href)
  expect(faviconResponse.ok()).toBe(true)
  expect(faviconResponse.headers()['content-type']).toContain('image/svg+xml')

  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'light')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
    'content',
    /default-src 'self';.*object-src 'none';.*base-uri 'self';.*form-action 'none'/,
  )
  await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'same-origin')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Healthcare GTM Data Engineer/)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /signal-driven go-to-market systems/)

  const pageOrigin = new URL(page.url()).origin
  expect(requestedUrls.every((url) => new URL(url).origin === pageOrigin)).toBe(true)
})
