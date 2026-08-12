import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getContractId, getContractIds } from './contracts'

beforeEach(() => {
  vi.stubEnv('VITE_PATIENT_IDENTITY_REGISTRY_CONTRACT_ID', 'C_PATIENT')
  vi.stubEnv('VITE_PROVIDER_REGISTRY_CONTRACT_ID', 'C_PROVIDER')
  vi.stubEnv('VITE_CONSENT_ACCESS_CONTROL_CONTRACT_ID', 'C_CONSENT')
  vi.stubEnv('VITE_RECORD_COMMITMENT_REGISTRY_CONTRACT_ID', 'C_RECORD')
  vi.stubEnv('VITE_DEVICE_ATTESTATION_REGISTRY_CONTRACT_ID', 'C_DEVICE')
  vi.stubEnv('VITE_AUDIT_EVENT_EMITTER_CONTRACT_ID', 'C_AUDIT')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('getContractIds', () => {
  it('reads all six contract IDs from the environment', () => {
    expect(getContractIds()).toEqual({
      patientIdentityRegistry: 'C_PATIENT',
      providerRegistry: 'C_PROVIDER',
      consentAccessControl: 'C_CONSENT',
      recordCommitmentRegistry: 'C_RECORD',
      deviceAttestationRegistry: 'C_DEVICE',
      auditEventEmitter: 'C_AUDIT',
    })
  })
})

describe('getContractId', () => {
  it('looks up a single contract ID by name', () => {
    expect(getContractId('consentAccessControl')).toBe('C_CONSENT')
  })
})
