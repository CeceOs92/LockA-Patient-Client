export { invokeContract, readContract } from './client'
export type { ContractCallParams } from './client'
export { SorobanError } from './errors'
export type { SorobanErrorStage } from './errors'
export { getContractId, getContractIds } from './contracts'
export type { ContractName } from './contracts'

export { getContractClient, isMockContractsEnabled, resetContractClient } from './factory'
export { createRealClient } from './realClient'
export { createMockClient, DEFAULT_MOCK_LATENCY_MS } from './mockClient'
export type { MockClientOptions } from './mockClient'
export { MOCK_PATIENT_ADDRESS, MOCK_PROVIDERS } from './mockSeed'
export type {
  AccessRequest,
  AccessRequestStatus,
  ApproveAccessRequestInput,
  AuditEvent,
  AuditEventKind,
  ConsentGrant,
  ConsentGrantStatus,
  DenyAccessRequestInput,
  LockaContractClient,
  MedicalRecord,
  Passport,
  PassportStatus,
  Provider,
  ProviderKind,
  RecordCategory,
  RegisterPassportInput,
  RevokeConsentGrantInput,
} from './types'
