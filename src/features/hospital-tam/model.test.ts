import { describe, expect, it } from 'vitest'
import {
  facilitiesForSystem,
  syntheticCompanies,
  syntheticFacilities,
  syntheticSystems,
  systemsForCompany,
} from './model'

describe('hospital TAM synthetic entity model', () => {
  it('collapses ten facilities into four systems and three companies', () => {
    expect(syntheticFacilities).toHaveLength(10)
    expect(syntheticSystems).toHaveLength(4)
    expect(syntheticCompanies).toHaveLength(3)
    expect(facilitiesForSystem('SYS001')).toHaveLength(3)
    expect(systemsForCompany('CO001')).toHaveLength(2)
  })

  it('resolves every foreign key without mutating the source model', () => {
    const systemIds = new Set(syntheticSystems.map(({ systemId }) => systemId))
    const companyIds = new Set(syntheticCompanies.map(({ companyId }) => companyId))

    expect(syntheticFacilities.every(({ systemId }) => systemIds.has(systemId))).toBe(true)
    expect(syntheticSystems.every(({ companyId }) => companyIds.has(companyId))).toBe(true)
    expect(new Set(syntheticFacilities.map(({ facilityId }) => facilityId)).size).toBe(10)
  })

  it('uses visibly nonproduction identifiers in the public demonstration', () => {
    expect(syntheticFacilities.every(({ facilityId }) => /^DEMO\d{2}$/.test(facilityId))).toBe(true)
    expect(syntheticCompanies.every(({ domain }) => domain.endsWith('.demo'))).toBe(true)
  })
})
