// @vitest-environment node
// These tests never touch the DOM, so they skip the jsdom environment.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readContract } from './client'
import { getContractClient, isMockContractsEnabled, resetContractClient } from './factory'
import { MOCK_PATIENT_ADDRESS } from './mockSeed'

// Stubbed so the "real client" branch can be exercised without a live RPC server.
vi.mock('./client', () => ({
  readContract: vi.fn(),
  invokeContract: vi.fn(),
}))

function enableMockContracts(): void {
  vi.stubEnv('VITE_USE_MOCK_CONTRACTS', 'true')
  vi.stubEnv('VITE_MOCK_CONTRACT_LATENCY_MS', '0')
}

beforeEach(() => {
  resetContractClient()
  vi.spyOn(console, 'info').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.mocked(readContract).mockReset()
  resetContractClient()
})

describe('isMockContractsEnabled', () => {
  it('is off unless VITE_USE_MOCK_CONTRACTS is set to true', () => {
    expect(isMockContractsEnabled()).toBe(false)

    for (const value of ['false', '', '1', 'yes']) {
      vi.stubEnv('VITE_USE_MOCK_CONTRACTS', value)
      expect(isMockContractsEnabled(), `VITE_USE_MOCK_CONTRACTS=${value}`).toBe(false)
    }

    vi.stubEnv('VITE_USE_MOCK_CONTRACTS', 'TRUE ')
    expect(isMockContractsEnabled()).toBe(true)
  })
})

describe('getContractClient', () => {
  it('returns the seeded mock client, never touching the RPC layer, when the flag is on', async () => {
    enableMockContracts()

    await expect(getContractClient().getPassport(MOCK_PATIENT_ADDRESS)).resolves.toMatchObject({
      displayName: 'Amara Okafor',
    })
    expect(readContract).not.toHaveBeenCalled()
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('VITE_USE_MOCK_CONTRACTS=true'))
  })

  it('starts the mock unregistered when asked to', async () => {
    enableMockContracts()
    vi.stubEnv('VITE_MOCK_UNREGISTERED_PASSPORT', 'true')

    await expect(getContractClient().getPassport(MOCK_PATIENT_ADDRESS)).resolves.toBeNull()
  })

  it('returns the contract-backed client when the flag is off', async () => {
    vi.stubEnv('VITE_USE_MOCK_CONTRACTS', 'false')
    vi.stubEnv('VITE_PATIENT_IDENTITY_REGISTRY_CONTRACT_ID', 'C_PATIENT')
    vi.mocked(readContract).mockResolvedValue(null)

    await expect(getContractClient().getPassport(MOCK_PATIENT_ADDRESS)).resolves.toBeNull()
    expect(readContract).toHaveBeenCalledWith(
      expect.objectContaining({ contractId: 'C_PATIENT', method: 'get_passport' }),
    )
    expect(console.info).not.toHaveBeenCalled()
  })

  it('caches the client so the mock keeps its state between calls', async () => {
    enableMockContracts()

    expect(getContractClient()).toBe(getContractClient())
    await getContractClient().denyAccessRequest({ patient: MOCK_PATIENT_ADDRESS, requestId: 'req-1042' })

    const requests = await getContractClient().listAccessRequests(MOCK_PATIENT_ADDRESS)
    expect(requests.find((request) => request.id === 'req-1042')?.status).toBe('denied')
  })

  it('rebuilds the client after a reset, dropping mock state', async () => {
    enableMockContracts()

    const first = getContractClient()
    await first.denyAccessRequest({ patient: MOCK_PATIENT_ADDRESS, requestId: 'req-1042' })

    resetContractClient()
    const second = getContractClient()
    expect(second).not.toBe(first)

    const requests = await second.listAccessRequests(MOCK_PATIENT_ADDRESS)
    expect(requests.find((request) => request.id === 'req-1042')?.status).toBe('pending')
  })
})
