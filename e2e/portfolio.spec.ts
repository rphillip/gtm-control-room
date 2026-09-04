import { expect, test, type Locator, type Page } from '@playwright/test'

const sitePath = '/gtm-control-room/'

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

    await page.getByRole('link', { name: 'Start the machine' }).click()
    await expect(page.locator('#control-room')).toBeInViewport()
    await page.getByRole('navigation', { name: 'Portfolio sections' }).getByRole('link', { name: 'Registry' }).click()
    await expect(page.locator('#registry')).toBeInViewport()
  })
}

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

  await page.getByText('Open full case file', { exact: true }).first().click()
  expect(await page.locator('[data-case-ball]').first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration) || 0,
  )).toBeLessThan(0.01)

  await page.getByText('Open the registry', { exact: true }).click()
  const signalsView = page.getByRole('button', { name: 'Signals', exact: true })
  await signalsView.click()
  await expect(signalsView).toHaveAttribute('aria-pressed', 'true')
  await expect(signalsView.locator('[aria-hidden="true"]')).toBeVisible()
})

test('case machines expose evidence on focus and retain a permanent caption', async ({ page }) => {
  await page.goto(sitePath)
  await page.getByText('Open full case file', { exact: true }).first().click()

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

  await expect(selector.getByRole('button')).toHaveCount(3)
  await expect(page.locator('.selected-systems__stage .case-study')).toHaveCount(1)
  await expect(page.getByRole('figure', { name: 'Multi-Signal Account Engine evidence mobile' })).toBeVisible()

  const market = selector.getByRole('button', { name: /Healthcare Market Map/ })
  await market.click()
  await expect(market).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { level: 3, name: 'Healthcare Market Map' })).toBeVisible()
  await expect(page.getByRole('figure', { name: 'Healthcare Market Map evidence mobile' })).toBeVisible()
  await expect(page.locator('.selected-systems__stage .case-study')).toHaveCount(1)
})

test('Matter.js advances the ball and triggers collision-specific machine states', async ({ page }) => {
  test.setTimeout(60_000)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(sitePath)
  await page.getByRole('link', { name: 'Start the machine' }).click()

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

test('content remains usable at 200% text zoom', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 })
  await page.goto(sitePath)
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  await page.getByRole('link', { name: 'Start the machine' }).click()
  await expect(page.locator('#control-room')).toBeInViewport()
})

test('rendered case-study evidence loads beneath the Pages base without layout instability', async ({ page }) => {
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
  await page.getByText('Open full case file', { exact: true }).first().click()
  const image = page.getByRole('img', { name: /public signals.*observable account queue/i })

  await image.scrollIntoViewIfNeeded()
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  const src = await image.getAttribute('src')
  expect(new URL(src!, page.url()).pathname).toBe('/gtm-control-room/evidence/multi-signal-account-engine.svg')
  await expect(image).toHaveAttribute('width', '960')
  await expect(image).toHaveAttribute('height', '420')

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
