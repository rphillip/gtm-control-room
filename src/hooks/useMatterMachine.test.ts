import { describe, expect, it } from 'vitest'
import { caseMachineProfiles, heroMachineProfile, mainMachineProfile, selectorMachineProfiles } from './useMatterMachine'

const profiles = [
  ['hero', heroMachineProfile],
  ['main', mainMachineProfile],
  ...Object.entries(caseMachineProfiles),
  ...Object.entries(selectorMachineProfiles).map(([name, profile]) => [`selector:${name}`, profile] as const),
] as const

describe('physics machine profiles', () => {
  it.each(profiles)('%s defines a bounded physical launcher and return route', (_name, profile) => {
    const launcherIndex = profile.points.findIndex(({ impact }) => impact === 'launch')

    expect(launcherIndex).toBeGreaterThan(0)
    expect(launcherIndex).toBeLessThan(profile.points.length - 1)
    expect(profile.points[launcherIndex].id).toBe('launcher')
    expect(profile.launchSpeed).toBeGreaterThan(profile.speed)
    expect(profile.ballRadius).toBeGreaterThan(0)
    expect(profile.gravity).toBeGreaterThan(0)
    expect(profile.points.slice(launcherIndex + 1).length).toBeGreaterThan(0)

    for (const point of profile.points) {
      expect(Number.isFinite(point.x) && Number.isFinite(point.y)).toBe(true)
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.x).toBeLessThanOrEqual(profile.width)
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThanOrEqual(profile.height)
    }
  })
})
