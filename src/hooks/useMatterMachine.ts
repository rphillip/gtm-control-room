import { useEffect, type RefObject } from 'react'

type Impact = 'catch' | 'funnel' | 'weigh' | 'switch' | 'package' | 'inspect' | 'loop' | 'launch' | 'coast'

export interface PhysicsWaypoint {
  x: number
  y: number
  id?: string
  impact?: Impact
  hold?: number
}

export interface PhysicsMachineProfile {
  width: number
  height: number
  speed: number
  force: number
  ballRadius?: number
  arrivalRadius?: number
  gravity?: number
  launchSpeed?: number
  skipRailSegments?: number[]
  points: PhysicsWaypoint[]
}

export const mainMachineProfile: PhysicsMachineProfile = {
  width: 1000,
  height: 430,
  speed: 5.2,
  force: 0.00082,
  points: [
    { x: 76, y: 118, id: 'detect', impact: 'catch', hold: 260 },
    { x: 274, y: 73, id: 'normalize', impact: 'funnel', hold: 170 },
    { x: 449, y: 171, id: 'qualify', impact: 'weigh', hold: 240 },
    { x: 626, y: 103, id: 'route', impact: 'switch', hold: 150 },
    { x: 836, y: 188, id: 'activate', impact: 'package', hold: 230 },
    { x: 721, y: 343, id: 'observe', impact: 'inspect', hold: 260 },
    { x: 455, y: 351, id: 'improve', impact: 'loop', hold: 180 },
    { x: 233, y: 351, impact: 'coast' },
    { x: 174, y: 286, id: 'launcher', impact: 'launch' },
    { x: 76, y: 286, impact: 'coast' },
  ],
  gravity: 0.08,
  launchSpeed: 8.8,
  ballRadius: 10,
  arrivalRadius: 64,
  skipRailSegments: [0, 1, 2, 3, 4, 5, 6, 7],
}

export const caseMachineProfiles: Record<string, PhysicsMachineProfile> = {
  'multi-signal-account-engine': {
    width: 900, height: 300, speed: 4.8, force: 0.0009,
    points: [
      { x: 55, y: 100, id: 'signals', impact: 'catch', hold: 180 },
      { x: 250, y: 80, id: 'normalize', impact: 'funnel', hold: 200 },
      { x: 255, y: 180, impact: 'coast' },
      { x: 445, y: 175, id: 'weigh', impact: 'weigh', hold: 230 },
      { x: 685, y: 150, id: 'queue', impact: 'package', hold: 190 },
      { x: 845, y: 152, id: 'launcher', impact: 'launch' },
      { x: 845, y: 38, impact: 'coast' },
      { x: 55, y: 38, impact: 'coast' },
    ],
    gravity: 0.06, launchSpeed: 9.2, ballRadius: 10, skipRailSegments: [0, 1, 2, 3, 4],
  },
  'healthcare-market-map': {
    width: 900, height: 300, speed: 4.6, force: 0.00088,
    points: [
      { x: 48, y: 151, id: 'facilities', impact: 'catch', hold: 160 },
      { x: 307, y: 151, id: 'resolve', impact: 'loop', hold: 260 },
      { x: 510, y: 151, id: 'parent', impact: 'weigh', hold: 220 },
      { x: 709, y: 143, id: 'map', impact: 'inspect', hold: 250 },
      { x: 852, y: 151, id: 'launcher', impact: 'launch' },
      { x: 852, y: 38, impact: 'coast' },
      { x: 48, y: 38, impact: 'coast' },
    ],
    gravity: 0.06, launchSpeed: 9.2, ballRadius: 10, skipRailSegments: [0, 1, 2, 3],
  },
  'activation-workflows': {
    width: 900, height: 300, speed: 4.8, force: 0.0009,
    points: [
      { x: 50, y: 150, id: 'segment', impact: 'catch', hold: 170 },
      { x: 430, y: 150, id: 'check', impact: 'switch', hold: 230 },
      { x: 595, y: 150, impact: 'coast' },
      { x: 742, y: 85, id: 'prepare', impact: 'package', hold: 230 },
      { x: 669, y: 215, id: 'review', impact: 'inspect', hold: 230 },
      { x: 852, y: 215, id: 'launcher', impact: 'launch' },
      { x: 852, y: 38, impact: 'coast' },
      { x: 50, y: 38, impact: 'coast' },
    ],
    gravity: 0.06, launchSpeed: 9.4, ballRadius: 10, arrivalRadius: 90, skipRailSegments: [0, 1, 2, 3, 4],
  },
}

export const heroMachineProfile: PhysicsMachineProfile = {
  width: 620, height: 400, speed: 4.5, force: 0.00082, gravity: 0.055, launchSpeed: 8.2, ballRadius: 9, skipRailSegments: [0, 1, 2, 3, 4],
  points: [
    { x: 108, y: 228, id: 'signals', impact: 'catch', hold: 150 },
    { x: 228, y: 270, impact: 'coast' },
    { x: 307, y: 195, id: 'join', impact: 'loop', hold: 180 },
    { x: 383, y: 235, impact: 'coast' },
    { x: 470, y: 207, id: 'route', impact: 'package', hold: 170 },
    { x: 548, y: 235, id: 'launcher', impact: 'launch' },
    { x: 548, y: 82, impact: 'coast' },
    { x: 82, y: 82, impact: 'coast' },
    { x: 82, y: 228, impact: 'coast' },
  ],
}

export const selectorMachineProfiles: Record<string, PhysicsMachineProfile> = {
  'multi-signal-account-engine': { width: 64, height: 50, speed: 1.8, force: 0.0015, gravity: 0.025, launchSpeed: 2.8, ballRadius: 4, skipRailSegments: [0, 1, 2], points: [
    { x: 7, y: 8, impact: 'coast' }, { x: 32, y: 16, id: 'weigh', impact: 'weigh', hold: 80 },
    { x: 55, y: 34, id: 'launcher', impact: 'launch' }, { x: 56, y: 7, impact: 'coast' },
  ] },
  'healthcare-market-map': { width: 64, height: 50, speed: 1.8, force: 0.0015, gravity: 0.025, launchSpeed: 2.8, ballRadius: 4, skipRailSegments: [0, 1, 2], points: [
    { x: 7, y: 25, impact: 'coast' }, { x: 32, y: 25, id: 'resolve', impact: 'loop', hold: 80 },
    { x: 56, y: 25, id: 'launcher', impact: 'launch' }, { x: 56, y: 7, impact: 'coast' }, { x: 7, y: 7, impact: 'coast' },
  ] },
  'activation-workflows': { width: 64, height: 50, speed: 1.8, force: 0.0015, gravity: 0.025, launchSpeed: 2.9, ballRadius: 4, skipRailSegments: [0, 1, 2, 3], points: [
    { x: 7, y: 25, impact: 'coast' }, { x: 28, y: 25, id: 'check', impact: 'switch', hold: 80 },
    { x: 50, y: 12, id: 'prepare', impact: 'package', hold: 80 }, { x: 57, y: 40, id: 'launcher', impact: 'launch' },
    { x: 7, y: 40, impact: 'coast' },
  ] },
}

export function useMatterMachine(hostRef: RefObject<HTMLElement | null>, profile: PhysicsMachineProfile, enabled = true) {
  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    const resetVisibleBall = () => {
      const ballElement = host.querySelector<SVGCircleElement>('[data-physics-ball]')
      const spinElement = host.querySelector<SVGGraphicsElement>('[data-physics-spin]')
      const start = profile.points[0]
      ballElement?.setAttribute('cx', String(start.x))
      ballElement?.setAttribute('cy', String(start.y))
      spinElement?.setAttribute('transform', `translate(${start.x} ${start.y}) rotate(0)`)
      delete host.dataset.physicsActive
      delete host.dataset.physicsContact
      delete host.dataset.physicsLastSolid
      delete host.dataset.physicsRecovered
      if (start.id) host.dataset.physicsActive = start.id
      host.dataset.physicsPhase = 'forward'
      host.dataset.physicsCycle = '0'
      host.dataset.physicsReturns = '0'
      host.dataset.physicsLauncherContacts = '0'
    }

    if (!enabled) {
      host.dataset.physicsState = 'idle'
      resetVisibleBall()
      return
    }

    let active = true
    let visible = false
    let started = false
    let engineReady = false
    let animationFrame = 0
    let runFrame: ((time: number) => void) | undefined
    let teardown: (() => void) | undefined
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let motionAllowed = !motionPreference.matches

    const stopFrame = () => {
      if (!animationFrame) return
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    const scheduleFrame = () => {
      if (!animationFrame && runFrame && active && visible && motionAllowed && !document.hidden) {
        animationFrame = requestAnimationFrame(runFrame)
      }
    }

    const start = async () => {
      if (started || !motionAllowed) return
      started = true
      let Matter: typeof import('matter-js')
      try {
        Matter = await import('matter-js')
      } catch {
        started = false
        host.dataset.physicsState = 'css-fallback'
        return
      }
      if (!active || !motionAllowed) {
        started = false
        return
      }

      const { Bodies, Body, Composite, Engine, Events } = Matter
      const ballRadius = profile.ballRadius ?? 10
      const engine = Engine.create({ gravity: { x: 0, y: profile.gravity ?? 0.06, scale: 0.001 } })
      const ball = Bodies.circle(profile.points[0].x, profile.points[0].y, ballRadius, {
        density: 0.002,
        friction: 0.08,
        frictionAir: 0.025,
        restitution: 0.78,
        label: 'red-ball',
      })
      const bumpers = profile.points.flatMap((point, index) => {
        if (index === 0 || point.impact === 'coast') return []
        return [Bodies.circle(
          point.x,
          point.y,
          Math.max(3, ballRadius * 0.62),
          { isStatic: true, restitution: 0.92, friction: 0.08, label: `bumper:${index}` },
        )]
      })
      // A narrow pair of rails keeps the ball in the drawn route while leaving
      // short openings at corners and mechanisms so it can change direction.
      const railGap = ballRadius * 2.2 + 2
      const route = [...profile.points, profile.points[0]]
      const rails = route.slice(0, -1).flatMap((from, index) => {
        if (profile.skipRailSegments?.includes(index)) return []
        const to = route[index + 1]
        const dx = to.x - from.x
        const dy = to.y - from.y
        const length = Math.max(Math.hypot(dx, dy), 1)
        const normalX = -dy / length
        const normalY = dx / length
        const angle = Math.atan2(dy, dx)
        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2
        return [-1, 1].map((side) => Bodies.rectangle(
          midX + normalX * railGap * side,
          midY + normalY * railGap * side,
          Math.max(2, length - railGap * 1.6),
          Math.max(2, ballRadius * 0.28),
          { isStatic: true, angle, friction: 0.12, restitution: 0.36, label: `rail:${index}:${side}` },
        ))
      })
      const walls = [
        Bodies.rectangle(profile.width / 2, -24, profile.width + 80, 20, { isStatic: true }),
        Bodies.rectangle(profile.width / 2, profile.height + 24, profile.width + 80, 20, { isStatic: true }),
        Bodies.rectangle(-24, profile.height / 2, 20, profile.height + 80, { isStatic: true }),
        Bodies.rectangle(profile.width + 24, profile.height / 2, 20, profile.height + 80, { isStatic: true }),
      ]
      Composite.add(engine.world, [ball, ...bumpers, ...rails, ...walls])
      host.dataset.physicsRailCount = String(rails.length)

      const ballElement = host.querySelector<SVGCircleElement>('[data-physics-ball]')
      const spinElement = host.querySelector<SVGGraphicsElement>('[data-physics-spin]')
      let targetIndex = 1
      let cycle = 0
      let returns = 0
      let launcherContacts = 0
      let returning = false
      const contactedPoints = new Set<number>()
      let holdUntil = performance.now() + (profile.points[0].hold ?? 0)
      let previousTime = performance.now()
      let accumulator = 0
      const reenableBumpers = new Map<Matter.Body, number>()
      engineReady = true
      host.dataset.physicsState = 'running'
      if (profile.points[0].id) host.dataset.physicsActive = profile.points[0].id

      const advancePoint = (index: number) => {
        const point = profile.points[index]
        // A mechanism contact is valid only for the current leg of the route.
        contactedPoints.clear()
        if (point.id) host.dataset.physicsActive = point.id
        holdUntil = performance.now() + (point.hold ?? 70)
        const nextIndex = (index + 1) % profile.points.length
        const next = profile.points[nextIndex]
        const releaseX = next.x - ball.position.x
        const releaseY = next.y - ball.position.y
        const releaseDistance = Math.max(Math.hypot(releaseX, releaseY), 1)
        const releaseSpeed = point.impact === 'switch' || point.impact === 'loop'
          ? profile.speed * 0.72
          : point.impact === 'funnel' || point.impact === 'weigh' || point.impact === 'package' || point.impact === 'inspect'
            ? profile.speed * 0.55
            : profile.speed * 0.4
        if (point.impact !== 'launch' && point.impact !== 'coast') {
          Body.setVelocity(ball, { x: releaseX / releaseDistance * releaseSpeed, y: releaseY / releaseDistance * releaseSpeed })
        }
        if (point.impact === 'inspect' || point.impact === 'loop') Body.setAngularVelocity(ball, releaseSpeed / ballRadius)
        targetIndex = nextIndex
        if (point.impact === 'launch') {
          const launchTarget = profile.points[targetIndex]
          // Launch along the machine's designed route, not from the slightly
          // displaced collision point, so the spring cannot introduce drift.
          const dx = launchTarget.x - point.x
          const dy = launchTarget.y - point.y
          const distance = Math.max(Math.hypot(dx, dy), 1)
          const launchSpeed = profile.launchSpeed ?? profile.speed * 1.7
          Body.setVelocity(ball, { x: dx / distance * launchSpeed, y: dy / distance * launchSpeed })
          Body.setAngularVelocity(ball, launchSpeed / ballRadius)
          cycle += 1
          returning = true
          host.dataset.physicsCycle = String(cycle)
          host.dataset.physicsPhase = 'return'
        } else if (targetIndex === 1) {
          if (cycle > returns) {
            returns = cycle
            host.dataset.physicsReturns = String(returns)
          }
          returning = false
          host.dataset.physicsPhase = 'forward'
        }
      }

      const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
        for (const pair of event.pairs) {
          const bumper = pair.bodyA.label.startsWith('bumper:') ? pair.bodyA : pair.bodyB.label.startsWith('bumper:') ? pair.bodyB : undefined
          if (bumper) {
            const bumperIndex = Number(bumper.label.split(':')[1])
            const bumperPoint = profile.points[bumperIndex]
            contactedPoints.add(bumperIndex)
            host.dataset.physicsContact = 'solid'
            host.dataset.physicsLastSolid = bumperPoint.id ?? String(bumperIndex)
            if (bumperPoint.impact === 'launch') {
              launcherContacts += 1
              host.dataset.physicsLauncherContacts = String(launcherContacts)
            }
            bumper.collisionFilter.mask = 0
            reenableBumpers.set(bumper, performance.now() + 900)
          }
        }
      }
      Events.on(engine, 'collisionStart', onCollision)

      runFrame = (time: number) => {
        animationFrame = 0
        if (!active) return
        const elapsed = Math.min(time - previousTime, 50)
        previousTime = time
        accumulator += elapsed
        while (accumulator >= 1000 / 60) {
          for (const [bumper, reenableAt] of reenableBumpers) {
            if (time < reenableAt) continue
            bumper.collisionFilter.mask = 0xFFFFFFFF
            reenableBumpers.delete(bumper)
          }
          const arrival = profile.points[targetIndex]
          const arrivalDistance = Math.hypot(arrival.x - ball.position.x, arrival.y - ball.position.y)
          const arrivalThreshold = profile.width < 100
            ? Math.max(10, ballRadius * 4)
            : returning
              ? ballRadius * 2.2
            : arrival.impact === 'launch'
              ? ballRadius * 2.2
              : profile.arrivalRadius ?? ballRadius * 4.6
          const mechanismHasContact = targetIndex === 0 || arrival.impact === 'coast' || contactedPoints.has(targetIndex)
          const launcherHasContact = arrival.impact !== 'launch' || launcherContacts > cycle
          if (arrivalDistance <= arrivalThreshold && mechanismHasContact && launcherHasContact) advancePoint(targetIndex)
          if (time >= holdUntil) {
            const target = profile.points[targetIndex]
            const dx = target.x - ball.position.x
            const dy = target.y - ball.position.y
            const distance = Math.max(Math.hypot(dx, dy), 1)
            Body.applyForce(ball, ball.position, {
              x: (dx / distance) * profile.force * ball.mass,
              y: (dy / distance) * profile.force * ball.mass,
            })
            const desiredSpeed = Math.min(profile.speed, Math.max(profile.speed * 0.45, distance * 0.035))
            Body.setVelocity(ball, {
              x: ball.velocity.x * 0.94 + dx / distance * desiredSpeed * 0.06,
              y: ball.velocity.y * 0.94 + dy / distance * desiredSpeed * 0.06,
            })
            const speed = Math.hypot(ball.velocity.x, ball.velocity.y)
            if (speed > profile.speed) Body.setVelocity(ball, {
              x: ball.velocity.x * profile.speed / speed,
              y: ball.velocity.y * profile.speed / speed,
            })
          } else {
            Body.setVelocity(ball, { x: ball.velocity.x * 0.99, y: ball.velocity.y * 0.99 })
          }
          Engine.update(engine, 1000 / 60)
          accumulator -= 1000 / 60
        }
        const finite = Number.isFinite(ball.position.x) && Number.isFinite(ball.position.y)
        const escaped = ball.position.x < -30 || ball.position.x > profile.width + 30 || ball.position.y < -30 || ball.position.y > profile.height + 30
        if (!finite || escaped) {
          const target = profile.points[targetIndex]
          Body.setPosition(ball, target)
          Body.setVelocity(ball, { x: 0, y: 0 })
          Body.setAngle(ball, 0)
          host.dataset.physicsRecovered = 'true'
        }
        const rollingVelocity = Math.hypot(ball.velocity.x, ball.velocity.y)
        if (rollingVelocity > 0.2) Body.setAngularVelocity(ball, ball.velocity.x / ballRadius)
        ballElement?.setAttribute('cx', ball.position.x.toFixed(2))
        ballElement?.setAttribute('cy', ball.position.y.toFixed(2))
        spinElement?.setAttribute('transform', `translate(${ball.position.x.toFixed(2)} ${ball.position.y.toFixed(2)}) rotate(${(ball.angle * 180 / Math.PI).toFixed(2)})`)
        scheduleFrame()
      }
      scheduleFrame()

      teardown = () => {
        stopFrame()
        Events.off(engine, 'collisionStart', onCollision)
        Composite.clear(engine.world, false)
        Engine.clear(engine)
        engineReady = false
        runFrame = undefined
      }
    }

    const applyMotionPreference = () => {
      motionAllowed = !motionPreference.matches
      if (!motionAllowed) {
        stopFrame()
        teardown?.()
        teardown = undefined
        started = false
        host.dataset.physicsState = 'reduced-motion'
        resetVisibleBall()
        return
      }
      if (engineReady) {
        host.dataset.physicsState = 'running'
        scheduleFrame()
      } else if (visible) {
        void start()
      }
    }

    const applyDocumentVisibility = () => {
      if (document.hidden) {
        stopFrame()
      } else {
        scheduleFrame()
      }
    }

    motionPreference.addEventListener('change', applyMotionPreference)
    document.addEventListener('visibilitychange', applyDocumentVisibility)
    applyMotionPreference()

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) {
        stopFrame()
        return
      }
      if (engineReady) {
        scheduleFrame()
      } else if (motionAllowed) {
        void start()
      }
    }, { rootMargin: '120px' })
    observer.observe(host)

    return () => {
      active = false
      stopFrame()
      observer.disconnect()
      motionPreference.removeEventListener('change', applyMotionPreference)
      document.removeEventListener('visibilitychange', applyDocumentVisibility)
      teardown?.()
    }
  }, [enabled, hostRef, profile])
}
