import { describe, expect, it } from 'vitest'
import { resolveLocalAsset } from './localAsset'

describe('resolveLocalAsset', () => {
  it('joins validated root-local media to root and Pages base paths', () => {
    expect(resolveLocalAsset('/evidence/topology.svg', '/')).toBe('/evidence/topology.svg')
    expect(resolveLocalAsset('/evidence/topology.svg', '/gtm-control-room/')).toBe('/gtm-control-room/evidence/topology.svg')
    expect(resolveLocalAsset('/evidence/topology.svg', '/gtm-control-room')).toBe('/gtm-control-room/evidence/topology.svg')
  })

  it.each([
    'https://example.com/evidence.svg',
    'data:image/svg+xml,unsafe',
    '//example.com/evidence.svg',
    '/evidence/../private.svg',
    '/evidence/%2e%2e/private.svg',
    '/evidence/%252e%252e/private.svg',
    '/evidence\\..\\private.svg',
  ])('rejects unsafe media path %s', (src) => {
    expect(() => resolveLocalAsset(src, '/gtm-control-room/')).toThrow(/local asset path/i)
  })

  it('rejects a non-local base URL', () => {
    expect(() => resolveLocalAsset('/evidence/topology.svg', 'https://example.com/')).toThrow(/base path/i)
  })
})
