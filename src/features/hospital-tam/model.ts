export interface SyntheticFacility {
  facilityId: string
  name: string
  city: string
  type: string
  systemId: string
}

export interface SyntheticSystem {
  systemId: string
  name: string
  companyId: string
}

export interface SyntheticCompany {
  companyId: string
  name: string
  domain: string
}

export const syntheticFacilities: SyntheticFacility[] = [
  { facilityId: 'DEMO01', name: 'Hospital A', city: 'Houston', type: 'Acute Care', systemId: 'SYS001' },
  { facilityId: 'DEMO02', name: 'Hospital B', city: 'Sugar Land', type: 'Acute Care', systemId: 'SYS001' },
  { facilityId: 'DEMO03', name: 'Hospital C', city: 'Katy', type: 'Acute Care', systemId: 'SYS001' },
  { facilityId: 'DEMO04', name: 'Metro Surgical East', city: 'Austin', type: 'Acute Care', systemId: 'SYS002' },
  { facilityId: 'DEMO05', name: 'Metro Surgical West', city: 'Round Rock', type: 'Acute Care', systemId: 'SYS002' },
  { facilityId: 'DEMO06', name: 'Prairie Behavioral North', city: 'Dallas', type: 'Psychiatric', systemId: 'SYS003' },
  { facilityId: 'DEMO07', name: 'Prairie Behavioral South', city: 'Plano', type: 'Psychiatric', systemId: 'SYS003' },
  { facilityId: 'DEMO08', name: 'Gulf Community Central', city: 'Galveston', type: 'Critical Access', systemId: 'SYS004' },
  { facilityId: 'DEMO09', name: 'Gulf Community Island', city: 'Texas City', type: 'Critical Access', systemId: 'SYS004' },
  { facilityId: 'DEMO10', name: 'Gulf Community Bay', city: 'League City', type: 'Rural Emergency', systemId: 'SYS004' },
]

export const syntheticSystems: SyntheticSystem[] = [
  { systemId: 'SYS001', name: 'Example Health System', companyId: 'CO001' },
  { systemId: 'SYS002', name: 'Metro Surgical Network', companyId: 'CO001' },
  { systemId: 'SYS003', name: 'Prairie Behavioral System', companyId: 'CO002' },
  { systemId: 'SYS004', name: 'Gulf Community Hospitals', companyId: 'CO003' },
]

export const syntheticCompanies: SyntheticCompany[] = [
  { companyId: 'CO001', name: 'Example Health', domain: 'example-health.demo' },
  { companyId: 'CO002', name: 'Prairie Behavioral', domain: 'prairie-behavioral.demo' },
  { companyId: 'CO003', name: 'Gulf Community Care', domain: 'gulf-community.demo' },
]

export const walkthroughSteps = [
  { title: 'Start with facilities', shortLabel: '10 source rows' },
  { title: 'Join to health systems', shortLabel: '4 system keys' },
  { title: 'Resolve to GTM companies', shortLabel: '3 company identities' },
  { title: 'Now count prospects', shortLabel: '3 GTM accounts' },
] as const

export function facilitiesForSystem(systemId: string) {
  return syntheticFacilities.filter((facility) => facility.systemId === systemId)
}

export function systemsForCompany(companyId: string) {
  return syntheticSystems.filter((system) => system.companyId === companyId)
}
