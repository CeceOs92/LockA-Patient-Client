/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PATIENT_PASSPORT_REGISTRY_ADDRESS: string
  readonly VITE_PROVIDER_REGISTRY_ADDRESS: string
  readonly VITE_MEDICAL_RECORD_REGISTRY_ADDRESS: string
  readonly VITE_CONSENT_ACCESS_MANAGER_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
