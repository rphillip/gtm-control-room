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

    await page.getByRole('link', { name: 'Enter the Control Room' }).click()
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
  await expect(page.getByRole('status')).toContainText('5,419 CMS facility rows')

  const normalizeStage = page.getByRole('button', { name: /02 Normalize/i })
  await tabTo(page, normalizeStage)
  await page.keyboard.press('Space')
  await expect(normalizeStage).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('status')).toContainText('Normalize')

  const signalsView = page.getByRole('button', { name: 'Signals', exact: true })
  await tabTo(page, signalsView)
  await page.keyboard.press('Enter')
  await expect(signalsView).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Signals registry' })).toContainText('active')
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

  const signalsView = page.getByRole('button', { name: 'Signals', exact: true })
  await signalsView.click()
  await expect(signalsView).toHaveAttribute('aria-pressed', 'true')
  await expect(signalsView.locator('[aria-hidden="true"]')).toBeVisible()
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
  await page.getByRole('link', { name: 'Enter the Control Room' }).click()
  await expect(page.locator('#control-room')).toBeInViewport()
})

test('public evidence assets load beneath the Pages base path', async ({ page }) => {
  await page.goto(sitePath)
  const assetUrl = new URL(`${sitePath}evidence/base-path-test.svg`, page.url()).href
  const response = await page.request.get(assetUrl)

  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('image/svg+xml')
  const dimensions = await page.evaluate((src) => new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve({ width: image.naturalWidth, height: image.naturalHeight }), { once: true })
    image.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
    image.src = src
  }), assetUrl)
  expect(dimensions).toEqual({ width: 64, height: 40 })
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
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Healthcare GTM Data Engineer/)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /signal-driven go-to-market systems/)

  const pageOrigin = new URL(page.url()).origin
  expect(requestedUrls.every((url) => new URL(url).origin === pageOrigin)).toBe(true)
})
