import { useEffect, type RefObject } from 'react'

type Impact = 'catch' | 'funnel' | 'weigh' | 'switch' | 'package' | 'inspect' | 'loop' | 'coast'

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
    { x: 174, y: 286, impact: 'coast' },
  ],
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
      { x: 845, y: 152, impact: 'coast' },
    ],
  },
  'healthcare-market-map': {
    width: 900, height: 300, speed: 4.6, force: 0.00088,
    points: [
      { x: 48, y: 151, id: 'facilities', impact: 'catch', hold: 160 },
      { x: 307, y: 151, id: 'resolve', impact: 'loop', hold: 260 },
      { x: 510, y: 151, id: 'parent', impact: 'weigh', hold: 220 },
      { x: 709, y: 143, id: 'map', impact: 'inspect', hold: 250 },
      { x: 852, y: 151, impact: 'coast' },
    ],
  },
  'activation-workflows': {
    width: 900, height: 300, speed: 4.8, force: 0.0009,
    points: [
      { x: 50, y: 150, id: 'segment', impact: 'catch', hold: 170 },
      { x: 430, y: 150, id: 'check', impact: 'switch', hold: 230 },
      { x: 595, y: 150, impact: 'coast' },
      { x: 742, y: 85, id: 'prepare', impact: 'package', hold: 230 },
      { x: 669, y: 215, id: 'review', impact: 'inspect', hold: 230 },
      { x: 852, y: 215, impact: 'coast' },
    ],
  },
}

export function useMatterMachine(hostRef: RefObject<HTMLElement | null>, profile: PhysicsMachineProfile) {
  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

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

    const resetVisibleBall = () => {
      const ballElement = host.querySelector<SVGCircleElement>('[data-physics-ball]')
      ballElement?.setAttribute('cx', String(profile.points[0].x))
      ballElement?.setAttribute('cy', String(profile.points[0].y))
      if (profile.points[0].id) host.dataset.physicsActive = profile.points[0].id
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
      const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } })
      const ball = Bodies.circle(profile.points[0].x, profile.points[0].y, 10, {
        frictionAir: 0.035,
        restitution: 0.72,
        label: 'red-ball',
      })
      const sensors = profile.points.map((point, index) => Bodies.circle(point.x, point.y, 18, {
        isSensor: true,
        isStatic: true,
        label: `waypoint:${index}`,
      }))
      Composite.add(engine.world, [ball, ...sensors])

      const ballElement = host.querySelector<SVGCircleElement>('[data-physics-ball]')
      let targetIndex = 1
      let holdUntil = performance.now() + (profile.points[0].hold ?? 0)
      let previousTime = performance.now()
      let accumulator = 0
      engineReady = true
      host.dataset.physicsState = 'running'
      if (profile.points[0].id) host.dataset.physicsActive = profile.points[0].id

      const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
        for (const pair of event.pairs) {
          const sensor = pair.bodyA.label.startsWith('waypoint:') ? pair.bodyA : pair.bodyB.label.startsWith('waypoint:') ? pair.bodyB : undefined
          if (!sensor) continue
          const index = Number(sensor.label.split(':')[1])
          if (index !== targetIndex) continue

          const point = profile.points[index]
          if (point.id) host.dataset.physicsActive = point.id
          holdUntil = performance.now() + (point.hold ?? 70)
          if (point.impact === 'catch') Body.setVelocity(ball, { x: 0, y: 0 })
          if (point.impact === 'funnel') Body.setVelocity(ball, { x: 0.7, y: 2.8 })
          if (point.impact === 'weigh') Body.setVelocity(ball, { x: -1.1, y: 0.45 })
          if (point.impact === 'switch') Body.setVelocity(ball, { x: 2.4, y: -1.8 })
          if (point.impact === 'package') Body.setVelocity(ball, { x: 0.35, y: 0.25 })
          if (point.impact === 'inspect') Body.setAngularVelocity(ball, 0.32)
          if (point.impact === 'loop') Body.setVelocity(ball, { x: 1.6, y: -1.6 })
          targetIndex = (index + 1) % profile.points.length
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
          if (time >= holdUntil) {
            const target = profile.points[targetIndex]
            const dx = target.x - ball.position.x
            const dy = target.y - ball.position.y
            const distance = Math.max(Math.hypot(dx, dy), 1)
            Body.applyForce(ball, ball.position, {
              x: (dx / distance) * profile.force * ball.mass,
              y: (dy / distance) * profile.force * ball.mass,
            })
            const speed = Math.hypot(ball.velocity.x, ball.velocity.y)
            if (speed > profile.speed) Body.setVelocity(ball, {
              x: ball.velocity.x * profile.speed / speed,
              y: ball.velocity.y * profile.speed / speed,
            })
          } else {
            Body.setVelocity(ball, { x: ball.velocity.x * 0.82, y: ball.velocity.y * 0.82 })
          }
          Engine.update(engine, 1000 / 60)
          accumulator -= 1000 / 60
        }
        ballElement?.setAttribute('cx', ball.position.x.toFixed(2))
        ballElement?.setAttribute('cy', ball.position.y.toFixed(2))
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
  }, [hostRef, profile])
}
