import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SorobanClientProvider } from './SorobanClientProvider'
import { useIsMockData, useSorobanClient } from './useSorobanClient'
import { createMockClient } from './mockClient'
import { MOCK_PATIENT_ADDRESS } from './mockSeed'
import { resetContractClient } from './factory'
import type { LockaContractClient } from './types'

function Probe({ onClient }: { onClient?: (client: LockaContractClient) => void } = {}) {
  const client = useSorobanClient()
  const isMockData = useIsMockData()
  onClient?.(client)
  return <p>{`mock data: ${isMockData}`}</p>
}

afterEach(() => {
  vi.unstubAllEnvs()
  resetContractClient()
})

describe('SorobanClientProvider', () => {
  it('provides the env-selected client and flags mock mode', async () => {
    vi.stubEnv('VITE_USE_MOCK_CONTRACTS', 'true')
    vi.stubEnv('VITE_MOCK_CONTRACT_LATENCY_MS', '0')
    vi.spyOn(console, 'info').mockImplementation(() => {})
    let client: LockaContractClient | undefined

    render(
      <SorobanClientProvider>
        <Probe onClient={(value) => (client = value)} />
      </SorobanClientProvider>,
    )

    expect(screen.getByText('mock data: true')).toBeInTheDocument()
    await expect(client?.getPassport(MOCK_PATIENT_ADDRESS)).resolves.toMatchObject({ displayName: 'Amara Okafor' })
  })

  it('prefers an injected client over the env-selected one', async () => {
    const injected = createMockClient({ latencyMs: 0, unregistered: true })
    let client: LockaContractClient | undefined

    render(
      <SorobanClientProvider client={injected}>
        <Probe onClient={(value) => (client = value)} />
      </SorobanClientProvider>,
    )

    expect(client).toBe(injected)
    expect(screen.getByText('mock data: false')).toBeInTheDocument()
    await expect(client?.getPassport(MOCK_PATIENT_ADDRESS)).resolves.toBeNull()
  })

  it('keeps the same client across re-renders, so mock state survives', () => {
    vi.stubEnv('VITE_USE_MOCK_CONTRACTS', 'true')
    vi.stubEnv('VITE_MOCK_CONTRACT_LATENCY_MS', '0')
    vi.spyOn(console, 'info').mockImplementation(() => {})
    const seen: LockaContractClient[] = []

    const { rerender } = render(
      <SorobanClientProvider>
        <Probe onClient={(value) => seen.push(value)} />
      </SorobanClientProvider>,
    )
    rerender(
      <SorobanClientProvider>
        <Probe onClient={(value) => seen.push(value)} />
      </SorobanClientProvider>,
    )

    expect(seen.length).toBeGreaterThan(1)
    expect(new Set(seen).size).toBe(1)
  })
})

describe('useSorobanClient', () => {
  it('fails loudly when used outside the provider', () => {
    // React logs the thrown error itself; silence it so the run stays readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/must be used within a SorobanClientProvider/i)
  })
})
