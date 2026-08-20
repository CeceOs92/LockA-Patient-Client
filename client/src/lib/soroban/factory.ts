/**
 * Chooses the contract client the app runs against.
 *
 * With `VITE_USE_MOCK_CONTRACTS=true` the app talks to the in-memory mock and
 * needs neither deployed contracts nor a wallet; otherwise it talks to Soroban.
 * Feature code only ever calls `getContractClient()`, so nothing downstream
 * knows or cares which one it got.
 */
import { createMockClient, DEFAULT_MOCK_LATENCY_MS, type MockClientOptions } from './mockClient'
import { createRealClient } from './realClient'
import type { LockaContractClient } from './types'

let cached: LockaContractClient | null = null

function isTrue(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === 'true'
}

/** True when the app is running against mock contracts. */
export function isMockContractsEnabled(): boolean {
  return isTrue(import.meta.env.VITE_USE_MOCK_CONTRACTS)
}

function mockOptions(): MockClientOptions {
  const rawLatency = import.meta.env.VITE_MOCK_CONTRACT_LATENCY_MS?.trim()
  const latency = rawLatency ? Number(rawLatency) : Number.NaN
  return {
    latencyMs: Number.isFinite(latency) && latency >= 0 ? latency : DEFAULT_MOCK_LATENCY_MS,
    unregistered: isTrue(import.meta.env.VITE_MOCK_UNREGISTERED_PASSPORT),
  }
}

/**
 * The app-wide contract client, built once and reused so the mock keeps its
 * in-session state across pages.
 */
export function getContractClient(): LockaContractClient {
  if (!cached) {
    if (isMockContractsEnabled()) {
      const options = mockOptions()
      console.info(
        `[locka] VITE_USE_MOCK_CONTRACTS=true — using mock contract data (${options.latencyMs}ms simulated latency).`,
      )
      cached = createMockClient(options)
    } else {
      cached = createRealClient()
    }
  }
  return cached
}

/** Drops the cached client, so the next `getContractClient()` rebuilds it. */
export function resetContractClient(): void {
  cached = null
}
