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
  /** "true" swaps the Soroban contract client for the in-memory mock. */
  readonly VITE_USE_MOCK_CONTRACTS?: string
  /** Simulated round-trip delay for mock contract calls, in ms. */
  readonly VITE_MOCK_CONTRACT_LATENCY_MS?: string
  /** "true" starts the mock with no registered passport. */
  readonly VITE_MOCK_UNREGISTERED_PASSPORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
