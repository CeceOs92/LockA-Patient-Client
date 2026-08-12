export type ContractName =
  | 'patientIdentityRegistry'
  | 'providerRegistry'
  | 'consentAccessControl'
  | 'recordCommitmentRegistry'
  | 'deviceAttestationRegistry'
  | 'auditEventEmitter'

/** The six deployed Soroban contract IDs for the target network, from `.env`. */
export function getContractIds(): Record<ContractName, string> {
  const env = import.meta.env
  return {
    patientIdentityRegistry: env.VITE_PATIENT_IDENTITY_REGISTRY_CONTRACT_ID,
    providerRegistry: env.VITE_PROVIDER_REGISTRY_CONTRACT_ID,
    consentAccessControl: env.VITE_CONSENT_ACCESS_CONTROL_CONTRACT_ID,
    recordCommitmentRegistry: env.VITE_RECORD_COMMITMENT_REGISTRY_CONTRACT_ID,
    deviceAttestationRegistry: env.VITE_DEVICE_ATTESTATION_REGISTRY_CONTRACT_ID,
    auditEventEmitter: env.VITE_AUDIT_EVENT_EMITTER_CONTRACT_ID,
  }
}

export function getContractId(name: ContractName): string {
  return getContractIds()[name]
}
