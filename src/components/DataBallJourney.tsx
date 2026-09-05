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
    let scrollFrame = 0
    let measureFrame = 0
    let travelFrame = 0
    let previousScroll = window.scrollY
    let previousActive = ''
    let previousSegment = -1
    let previousProgress = 0
    let ownerIndex = -1
    let queuedCatch = -1
    let ballHalfWidth = 10
    let ballHalfHeight = 10
    let mode: 'loop' | 'launch' | 'offscreen' | 'flight' = 'loop'
    let active = true

    const place = (x: number, y: number) => {
      carrier.style.transform = `translate3d(${(x - ballHalfWidth).toFixed(2)}px, ${(y - ballHalfHeight).toFixed(2)}px, 0)`
      layer.dataset.scrollX = x.toFixed(2)
      layer.dataset.scrollY = y.toFixed(2)
    }

    const dock = (index: number) => ({
      x: stops[index].x - window.scrollX,
      y: stops[index].y - window.scrollY,
    })

    const activate = (index: number) => {
      const next = stops[index]
      if (!next || previousActive === next.id) return
      for (const stop of stops) stop.element.dataset.active = String(stop.id === next.id)
      previousActive = next.id
    }

    const setMode = (nextMode: typeof mode, targetIndex = ownerIndex) => {
      mode = nextMode
      layer.dataset.scrollMode = nextMode
      if (stops[targetIndex]) {
        layer.dataset.scrollTarget = stops[targetIndex].id
        activate(targetIndex)
      }
    }

    const cancelTravel = () => {
      if (travelFrame) window.cancelAnimationFrame(travelFrame)
      travelFrame = 0
    }

    const animateBall = ({
      duration,
      startX,
      startY,
      end,
      onComplete,
    }: {
      duration: number
      startX: number
      startY: number
      end: () => { x: number; y: number }
      onComplete: () => void
    }) => {
      cancelTravel()
      place(startX, startY)
      const startedAt = performance.now()
      const step = (now: number) => {
        if (!active || !motionAllowed || document.hidden) {
          travelFrame = 0
          return
        }
        const progress = Math.min(1, (now - startedAt) / duration)
        const destination = end()
        const x = startX + (destination.x - startX) * progress
        const arcHeight = Math.min(180, Math.max(80, Math.abs(destination.x - startX) * 0.16))
        const y = startY + (destination.y - startY) * progress - 4 * arcHeight * progress * (1 - progress)
        const spin = ((x - startX) / Math.max(ballHalfWidth, 8)) * 28
        ball.style.setProperty('--journey-spin', `${spin.toFixed(1)}deg`)
        layer.dataset.travelProgress = progress.toFixed(3)
        place(x, y)
        if (progress >= 1) {
          travelFrame = 0
          onComplete()
          return
        }
        travelFrame = window.requestAnimationFrame(step)
      }
      travelFrame = window.requestAnimationFrame(step)
    }

    const oppositeEdge = (x: number) => x < window.innerWidth / 2
      ? window.innerWidth + ballHalfWidth + 20
      : -ballHalfWidth - 20

    const launch = (index: number) => {
      if (!stops[index]) return
      const rect = ball.getBoundingClientRect()
      const startX = rect.left + rect.width / 2
      const startY = rect.top + rect.height / 2
      const edgeX = oppositeEdge(startX)
      const edgeY = Math.min(window.innerHeight - 72, Math.max(96, startY + (index % 2 === 0 ? 64 : -48)))
      setMode('launch', index)
      animateBall({
        duration: 920,
        startX,
        startY,
        end: () => ({ x: edgeX, y: edgeY }),
        onComplete: () => {
          setMode('offscreen', index)
          place(edgeX, edgeY)
          if (queuedCatch >= 0) {
            const targetIndex = queuedCatch
            queuedCatch = -1
            catchBall(targetIndex)
          } else {
            scheduleRender()
          }
        },
      })
    }

    const catchBall = (targetIndex: number) => {
      if (!stops[targetIndex]) return
      const destination = dock(targetIndex)
      const startX = oppositeEdge(destination.x)
      const startY = Math.min(window.innerHeight - 90, Math.max(90, destination.y - 110))
      setMode('flight', targetIndex)
      place(startX, startY)
      animateBall({
        duration: 1040,
        startX,
        startY,
        end: () => dock(targetIndex),
        onComplete: () => {
          ownerIndex = targetIndex
          queuedCatch = -1
          previousSegment = -1
          layer.dataset.scrollOwner = stops[ownerIndex].id
          ball.style.setProperty('--journey-spin', '0deg')
          setMode('loop', ownerIndex)
          const destinationDock = dock(ownerIndex)
          place(destinationDock.x, destinationDock.y)
          scheduleRender()
        },
      })
    }

    const returnToOwner = () => {
      if (!stops[ownerIndex]) return
      queuedCatch = -1
      const rect = ball.getBoundingClientRect()
      const startX = rect.left + rect.width / 2
      const startY = rect.top + rect.height / 2
      setMode('flight', ownerIndex)
      animateBall({
        duration: 720,
        startX,
        startY,
        end: () => dock(ownerIndex),
        onComplete: () => {
          ball.style.setProperty('--journey-spin', '0deg')
          setMode('loop', ownerIndex)
          const ownerDock = dock(ownerIndex)
          place(ownerDock.x, ownerDock.y)
          previousSegment = -1
          scheduleRender()
        },
      })
    }

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
      scrollFrame = 0
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
      const upperIndex = Math.min(lowerIndex + 1, stops.length - 1)
      const nearestIndex = rawProgress < 0.5 ? lowerIndex : upperIndex

      if (ownerIndex < 0 || ownerIndex >= stops.length) {
        ownerIndex = rawProgress < 0.5 ? lowerIndex : upperIndex
        layer.dataset.scrollOwner = stops[ownerIndex].id
        setMode('loop', ownerIndex)
        const ownerDock = dock(ownerIndex)
        place(ownerDock.x, ownerDock.y)
      } else {
        const ownerIsAdjacent = ownerIndex === lowerIndex || ownerIndex === upperIndex
        const crossedWholePhase = Math.abs(deltaScroll) > viewportHeight * 1.25 || !ownerIsAdjacent
        const returningToOwner = mode === 'flight' && layer.dataset.scrollTarget === stops[ownerIndex].id
        const reversedLaunch = mode === 'launch' && (
          (ownerIndex === lowerIndex && direction === 'up' && rawProgress < 0.08)
          || (ownerIndex === upperIndex && direction === 'down' && rawProgress > 0.82)
        )
        const reversedCatch = mode === 'flight' && !returningToOwner && (
          (ownerIndex === lowerIndex && direction === 'up' && rawProgress < 0.82)
          || (ownerIndex === upperIndex && direction === 'down' && rawProgress > 0.18)
        )

        if (reversedLaunch || reversedCatch) {
          returnToOwner()
        } else if (travelFrame) {
          if (mode === 'launch') {
            if (!ownerIsAdjacent) queuedCatch = nearestIndex
            else if (ownerIndex === lowerIndex) queuedCatch = rawProgress >= 0.82 ? upperIndex : -1
            else if (ownerIndex === upperIndex) queuedCatch = rawProgress <= 0.18 ? lowerIndex : -1
          }
        } else if (mode === 'offscreen') {
          if (!ownerIsAdjacent) catchBall(nearestIndex)
          else if (ownerIndex === lowerIndex && rawProgress >= 0.82) catchBall(upperIndex)
          else if (ownerIndex === upperIndex && rawProgress <= 0.18) catchBall(lowerIndex)
          else if ((ownerIndex === lowerIndex && rawProgress < 0.08) || (ownerIndex === upperIndex && rawProgress > 0.82)) returnToOwner()
        } else if (crossedWholePhase) {
          queuedCatch = nearestIndex
          launch(ownerIndex)
        } else if (lower !== upper) {
          if (direction === 'down' && ownerIndex === lowerIndex) {
            if ((previousSegment !== lowerIndex || previousProgress < 0.82) && rawProgress >= 0.82) {
              queuedCatch = upperIndex
              launch(lowerIndex)
            }
            else if (previousSegment === lowerIndex && previousProgress < 0.08 && rawProgress >= 0.08) launch(lowerIndex)
          } else if (direction === 'up' && ownerIndex === upperIndex) {
            if ((previousSegment !== lowerIndex || previousProgress > 0.18) && rawProgress <= 0.18) {
              queuedCatch = lowerIndex
              launch(upperIndex)
            }
            else if (previousSegment === lowerIndex && previousProgress > 0.82 && rawProgress <= 0.82) launch(upperIndex)
          }
        }
        if (mode === 'loop' && !travelFrame) {
          const ownerDock = dock(ownerIndex)
          place(ownerDock.x, ownerDock.y)
          activate(ownerIndex)
        }
      }

      previousScroll = scrollY
      previousSegment = lowerIndex
      previousProgress = rawProgress
      layer.dataset.scrollDirection = direction
      layer.dataset.scrollProgress = rawProgress.toFixed(3)
    }

    const scheduleRender = () => {
      if (!motionAllowed || document.hidden || scrollFrame) return
      scrollFrame = window.requestAnimationFrame(render)
    }

    const applyMotionPreference = () => {
      motionAllowed = !motionPreference.matches
      layer.dataset.motion = motionAllowed ? 'full' : 'reduced'
      if (!motionAllowed && scrollFrame) {
        window.cancelAnimationFrame(scrollFrame)
        scrollFrame = 0
      }
      if (!motionAllowed && measureFrame) {
        window.cancelAnimationFrame(measureFrame)
        measureFrame = 0
      }
      if (!motionAllowed) {
        cancelTravel()
        queuedCatch = -1
        ownerIndex = -1
        mode = 'loop'
        layer.dataset.scrollMode = 'loop'
        ball.style.setProperty('--journey-spin', '0deg')
        for (const stop of stops) stop.element.dataset.active = 'false'
        previousActive = ''
      }
      if (motionAllowed) scheduleMeasure()
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
        if (measureFrame) window.cancelAnimationFrame(measureFrame)
        cancelTravel()
        queuedCatch = -1
        ownerIndex = -1
        mode = 'loop'
        layer.dataset.scrollMode = 'loop'
        ball.style.setProperty('--journey-spin', '0deg')
        previousSegment = -1
        scrollFrame = 0
        measureFrame = 0
        return
      }
      scheduleMeasure()
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    for (const id of stopIds) {
      const section = document.querySelector<HTMLElement>(id === 'hero' ? '.hero' : `#${id}`)
      const relay = document.querySelector<HTMLElement>(`[data-data-relay="${id}"]`)
      if (section) resizeObserver.observe(section)
      if (relay) resizeObserver.observe(relay)
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
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
      if (measureFrame) window.cancelAnimationFrame(measureFrame)
      cancelTravel()
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
