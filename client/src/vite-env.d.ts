/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOROBAN_RPC_URL: string
  readonly VITE_NETWORK_PASSPHRASE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PATIENT_IDENTITY_REGISTRY_CONTRACT_ID: string
  readonly VITE_PROVIDER_REGISTRY_CONTRACT_ID: string
  readonly VITE_CONSENT_ACCESS_CONTROL_CONTRACT_ID: string
  readonly VITE_RECORD_COMMITMENT_REGISTRY_CONTRACT_ID: string
  readonly VITE_DEVICE_ATTESTATION_REGISTRY_CONTRACT_ID: string
  readonly VITE_AUDIT_EVENT_EMITTER_CONTRACT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
