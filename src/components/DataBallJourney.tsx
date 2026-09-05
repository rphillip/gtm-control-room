import { useEffect, useRef, type ReactNode } from 'react'

export type DataRelayVariant = 'intake' | 'refinery' | 'switchboard' | 'archive' | 'elevator' | 'dispatch'

const stopIds = ['hero', 'control-room', 'work', 'registry', 'about', 'contact'] as const
type StopId = (typeof stopIds)[number]

type MeasuredStop = {
  element: HTMLElement
  id: StopId
  x: number
  y: number
}

const relayDrawings: Record<DataRelayVariant, ReactNode> = {
  intake: <><path d="M18 36h31l12 13h35"/><path d="M18 36V18m-9 0h18M13 12h10"/><circle className="data-relay__moving data-relay__moving--wheel" cx="61" cy="49" r="9"/><path d="m61 40 4 9-4 9-4-9zM96 49h12"/></>,
  refinery: <><path d="M18 36h22l12 12h31"/><path className="data-relay__moving data-relay__moving--funnel" d="M38 14h34L59 32v15l-8 5V32z"/><path d="M83 48h20m0-10v20"/><path className="data-relay__spring" d="m103 38 7 4-7 4 7 4-7 4"/></>,
  switchboard: <><path d="M18 36h33m0 0 22-18m-22 18 22 18"/><circle className="data-relay__moving data-relay__moving--switch" cx="51" cy="36" r="8"/><path d="M73 18h27m-27 36h27M100 10v16m0 20v16"/><circle cx="100" cy="18" r="4"/><circle cx="100" cy="54" r="4"/></>,
  archive: <><path d="M18 36h22"/><rect x="40" y="13" width="48" height="46"/><path d="M40 28h48M40 44h48M58 21h13m-13 15h13m-13 16h13"/><path className="data-relay__moving data-relay__moving--stamp" d="M94 18h15v17H94zm4 17v12h8V35"/><path d="M88 51h25"/></>,
  elevator: <><path d="M18 36h22v20h24V39h24V22h24"/><circle className="data-relay__moving data-relay__moving--lift" cx="51" cy="49" r="8"/><path d="M51 16v25m-7-18 7-7 7 7M96 22h16"/><path d="M96 15v14"/></>,
  dispatch: <><path d="M18 36h28"/><path className="data-relay__moving data-relay__moving--arm" d="M46 36 68 14l7 7-22 22"/><rect x="72" y="30" width="34" height="24"/><path d="m73 32 16 13 16-13M106 42h9"/><path className="data-relay__spring" d="m108 35 6 4-6 4 6 4-6 4"/></>,
}

export function DataRelay({ id, variant, label }: { id: StopId; variant: DataRelayVariant; label?: boolean }) {
  return (
    <div className={`data-relay data-relay--${variant}`} data-data-relay={id} data-active="false" aria-hidden="true">
      {label ? <span className="data-relay__label"><i /> Data in motion</span> : null}
      <svg viewBox="0 0 120 72">
        <g className="data-relay__ink">{relayDrawings[variant]}</g>
        <circle className="data-relay__catch" cx="18" cy="36" r="8" />
        <circle data-data-catch cx="18" cy="36" r="1" fill="none" stroke="none" />
        <path className="data-relay__accent" d="M12 58h18" />
      </svg>
    </div>
  )
}

export function DataBallJourney() {
  const layerRef = useRef<HTMLDivElement>(null)
  const carrierRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const carrier = carrierRef.current
    const ball = ballRef.current
    if (!layer || !carrier || !ball || typeof window.matchMedia !== 'function' || typeof ResizeObserver === 'undefined') return

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motionAllowed = !motionPreference.matches
    let stops: MeasuredStop[] = []
    let frame = 0
    let measureFrame = 0
    let jumpFrame = 0
    let previousScroll = window.scrollY
    let previousOwner = ''
    let ownerIndex = -1
    let ballHalfWidth = 10
    let ballHalfHeight = 10
    let active = true

    const measure = () => {
      measureFrame = 0
      if (!motionAllowed || document.hidden) return
      ballHalfWidth = ball.offsetWidth / 2
      ballHalfHeight = ball.offsetHeight / 2
      const nextStops: MeasuredStop[] = []
      for (const id of stopIds) {
        const element = document.querySelector<HTMLElement>(`[data-data-relay="${id}"]`)
        const target = element?.querySelector<SVGGraphicsElement>('[data-data-catch]')
        if (!element || !target) continue
        const rect = target.getBoundingClientRect()
        nextStops.push({
          element,
          id,
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        })
      }
      stops = nextStops
      scheduleRender()
    }

    const scheduleMeasure = () => {
      if (!motionAllowed || document.hidden || measureFrame) return
      measureFrame = window.requestAnimationFrame(measure)
    }

    const render = () => {
      frame = 0
      if (!active || stops.length === 0) return

      const viewportHeight = window.innerHeight
      const scrollY = window.scrollY
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewportHeight)
      const thresholds = stops.map((stop, index) => {
        if (index === 0) return 0
        if (index === stops.length - 1) return maxScroll
        return Math.min(maxScroll, Math.max(0, stop.y - viewportHeight * 0.38))
      })
      let lowerIndex = 0

      while (lowerIndex < stops.length - 1 && scrollY >= thresholds[lowerIndex + 1]) lowerIndex += 1
      const lower = stops[lowerIndex]
      const upper = stops[Math.min(lowerIndex + 1, stops.length - 1)]
      const span = Math.max(thresholds[Math.min(lowerIndex + 1, thresholds.length - 1)] - thresholds[lowerIndex], 1)
      const rawProgress = lower === upper ? 0 : Math.min(1, Math.max(0, (scrollY - thresholds[lowerIndex]) / span))
      const deltaScroll = scrollY - previousScroll
      const direction = deltaScroll === 0 ? layer.dataset.scrollDirection ?? 'down' : deltaScroll < 0 ? 'up' : 'down'
      let jumped = Math.abs(deltaScroll) > viewportHeight * 1.25

      if (ownerIndex < 0 || ownerIndex >= stops.length || (ownerIndex !== lowerIndex && ownerIndex !== Math.min(lowerIndex + 1, stops.length - 1)) || jumped) {
        ownerIndex = rawProgress < 0.5 ? lowerIndex : Math.min(lowerIndex + 1, stops.length - 1)
      }

      const forwardLaunchAt = 0.78
      const reverseLaunchUntil = 0.22
      let mode: 'loop' | 'handoff' = 'loop'
      let routeFrom = stops[ownerIndex]
      let routeTo = routeFrom
      let routeProgress = 0

      if (lower !== upper && ownerIndex === lowerIndex && rawProgress >= forwardLaunchAt) {
        mode = 'handoff'
        routeFrom = lower
        routeTo = upper
        routeProgress = Math.min(1, Math.max(0, (rawProgress - forwardLaunchAt) / (1 - forwardLaunchAt)))
        if (rawProgress >= 0.995) {
          if (Number.parseFloat(window.getComputedStyle(ball).getPropertyValue('--journey-loop-scale')) > 0.15) jumped = true
          ownerIndex = Math.min(lowerIndex + 1, stops.length - 1)
          mode = 'loop'
          routeFrom = stops[ownerIndex]
          routeTo = routeFrom
          routeProgress = 0
        }
      } else if (lower !== upper && ownerIndex === lowerIndex + 1 && rawProgress <= reverseLaunchUntil) {
        mode = 'handoff'
        routeFrom = lower
        routeTo = upper
        routeProgress = Math.min(1, Math.max(0, rawProgress / reverseLaunchUntil))
        if (rawProgress <= 0.005) {
          if (Number.parseFloat(window.getComputedStyle(ball).getPropertyValue('--journey-loop-scale')) > 0.15) jumped = true
          ownerIndex = lowerIndex
          mode = 'loop'
          routeFrom = stops[ownerIndex]
          routeTo = routeFrom
          routeProgress = 0
        }
      }

      const progress = routeProgress * routeProgress * (3 - 2 * routeProgress)
      const arc = Math.sin(Math.PI * progress)
      const arcDirection = lowerIndex % 2 === 0 ? 1 : -1
      const arcX = Math.min(150, window.innerWidth * 0.13) * arc * arcDirection
      const arcY = Math.min(90, viewportHeight * 0.1) * arc
      const documentX = routeFrom.x + (routeTo.x - routeFrom.x) * progress + arcX
      const documentY = routeFrom.y + (routeTo.y - routeFrom.y) * progress - arcY
      const x = documentX - window.scrollX
      const y = documentY - scrollY
      const owner = stops[ownerIndex]

      if (jumped) {
        layer.dataset.jump = 'true'
        ball.style.transition = 'none'
        ball.style.opacity = '0'
        if (jumpFrame) window.cancelAnimationFrame(jumpFrame)
        jumpFrame = window.requestAnimationFrame(() => {
          if (!active) return
          ball.style.removeProperty('transition')
          jumpFrame = window.requestAnimationFrame(() => {
            if (active) {
              layer.dataset.jump = 'false'
              ball.style.removeProperty('opacity')
            }
            jumpFrame = 0
          })
        })
      }
      previousScroll = scrollY
      carrier.style.transform = `translate3d(${(x - ballHalfWidth).toFixed(2)}px, ${(y - ballHalfHeight).toFixed(2)}px, 0)`
      layer.dataset.scrollOwner = owner.id
      layer.dataset.scrollDirection = direction
      layer.dataset.scrollProgress = rawProgress.toFixed(3)
      layer.dataset.scrollMode = mode
      layer.dataset.handoffProgress = routeProgress.toFixed(3)
      layer.dataset.scrollX = x.toFixed(2)
      layer.dataset.scrollY = y.toFixed(2)

      if (previousOwner !== owner.id) {
        for (const stop of stops) stop.element.dataset.active = String(stop.id === owner.id)
        previousOwner = owner.id
      }
    }

    const scheduleRender = () => {
      if (!motionAllowed || document.hidden || frame) return
      frame = window.requestAnimationFrame(render)
    }

    const applyMotionPreference = () => {
      motionAllowed = !motionPreference.matches
      layer.dataset.motion = motionAllowed ? 'full' : 'reduced'
      if (!motionAllowed && frame) {
        window.cancelAnimationFrame(frame)
        frame = 0
      }
      if (!motionAllowed && measureFrame) {
        window.cancelAnimationFrame(measureFrame)
        measureFrame = 0
      }
      if (!motionAllowed && jumpFrame) {
        window.cancelAnimationFrame(jumpFrame)
        jumpFrame = 0
      }
      if (!motionAllowed) {
        layer.dataset.jump = 'false'
        ball.style.removeProperty('transition')
        ball.style.removeProperty('opacity')
        for (const stop of stops) stop.element.dataset.active = 'false'
        previousOwner = ''
      }
      if (motionAllowed) scheduleMeasure()
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frame) window.cancelAnimationFrame(frame)
        if (measureFrame) window.cancelAnimationFrame(measureFrame)
        frame = 0
        measureFrame = 0
        return
      }
      scheduleMeasure()
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    for (const id of stopIds) {
      const section = document.querySelector<HTMLElement>(id === 'hero' ? '.hero' : `#${id}`)
      if (section) resizeObserver.observe(section)
    }

    window.addEventListener('scroll', scheduleRender, { passive: true })
    window.addEventListener('resize', scheduleMeasure, { passive: true })
    window.visualViewport?.addEventListener('resize', scheduleMeasure, { passive: true })
    document.addEventListener('toggle', scheduleMeasure, true)
    document.addEventListener('visibilitychange', onVisibilityChange)
    motionPreference.addEventListener('change', applyMotionPreference)
    void document.fonts.ready.then(() => { if (active) scheduleMeasure() })
    applyMotionPreference()

    return () => {
      active = false
      if (frame) window.cancelAnimationFrame(frame)
      if (measureFrame) window.cancelAnimationFrame(measureFrame)
      if (jumpFrame) window.cancelAnimationFrame(jumpFrame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleRender)
      window.removeEventListener('resize', scheduleMeasure)
      window.visualViewport?.removeEventListener('resize', scheduleMeasure)
      document.removeEventListener('toggle', scheduleMeasure, true)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      motionPreference.removeEventListener('change', applyMotionPreference)
    }
  }, [])

  return (
    <div ref={layerRef} className="data-ball-journey" data-scroll-ball data-motion="full" data-scroll-mode="loop" aria-hidden="true">
      <div ref={carrierRef} className="data-ball-journey__carrier">
        <div ref={ballRef} className="data-ball-journey__ball"><i /></div>
      </div>
    </div>
  )
}
