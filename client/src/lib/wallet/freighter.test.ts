import { afterEach, describe, expect, it, vi } from 'vitest'
import * as freighterApi from '@stellar/freighter-api'
import {
  FreighterError,
  getAddress,
  getNetwork,
  getNetworkDetails,
  isFreighterInstalled,
  requestAccess,
  signTransaction,
} from './freighter'

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetwork: vi.fn(),
  getNetworkDetails: vi.fn(),
  signTransaction: vi.fn(),
}))

afterEach(() => {
  vi.useRealTimers()
  vi.mocked(freighterApi.isConnected).mockReset()
  vi.mocked(freighterApi.requestAccess).mockReset()
  vi.mocked(freighterApi.getAddress).mockReset()
  vi.mocked(freighterApi.getNetwork).mockReset()
  vi.mocked(freighterApi.getNetworkDetails).mockReset()
  vi.mocked(freighterApi.signTransaction).mockReset()
})

describe('isFreighterInstalled', () => {
  it('resolves true when the extension reports connected', async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    await expect(isFreighterInstalled()).resolves.toBe(true)
  })

  it('resolves false when the extension reports not connected', async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: false })
    await expect(isFreighterInstalled()).resolves.toBe(false)
  })

  it('resolves false when the call reports an error', async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({
      isConnected: false,
      error: { code: -1, message: 'no extension' },
    })
    await expect(isFreighterInstalled()).resolves.toBe(false)
  })

  it('resolves false when the extension never responds', async () => {
    vi.useFakeTimers()
    vi.mocked(freighterApi.isConnected).mockReturnValue(new Promise(() => {}))
    const resultPromise = isFreighterInstalled()
    await vi.advanceTimersByTimeAsync(2000)
    await expect(resultPromise).resolves.toBe(false)
  })
})

describe('requestAccess', () => {
  it('returns the address on success', async () => {
    vi.mocked(freighterApi.requestAccess).mockResolvedValue({ address: 'GABC123' })
    await expect(requestAccess()).resolves.toBe('GABC123')
  })

  it('throws a FreighterError when the extension reports an error', async () => {
    vi.mocked(freighterApi.requestAccess).mockResolvedValue({
      address: '',
      error: { code: -4, message: 'User declined access' },
    })
    await expect(requestAccess()).rejects.toThrow(FreighterError)
    await expect(requestAccess()).rejects.toThrow('User declined access')
  })
})

describe('getAddress', () => {
  it('returns the address on success', async () => {
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: 'GABC123' })
    await expect(getAddress()).resolves.toBe('GABC123')
  })

  it('throws on error', async () => {
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '', error: { code: -1, message: 'Not allowed' } })
    await expect(getAddress()).rejects.toThrow('Not allowed')
  })
})

describe('getNetwork', () => {
  it('returns network info on success', async () => {
    vi.mocked(freighterApi.getNetwork).mockResolvedValue({
      network: 'TESTNET',
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
    await expect(getNetwork()).resolves.toEqual({
      network: 'TESTNET',
      networkPassphrase: 'Test SDF Network ; September 2015',
    })
  })

  it('throws on error', async () => {
    vi.mocked(freighterApi.getNetwork).mockResolvedValue({
      network: '',
      networkPassphrase: '',
      error: { code: -1, message: 'boom' },
    })
    await expect(getNetwork()).rejects.toThrow('boom')
  })
})

describe('getNetworkDetails', () => {
  it('returns full network details on success', async () => {
    vi.mocked(freighterApi.getNetworkDetails).mockResolvedValue({
      network: 'TESTNET',
      networkUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: 'Test SDF Network ; September 2015',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    })
    await expect(getNetworkDetails()).resolves.toEqual({
      network: 'TESTNET',
      networkUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: 'Test SDF Network ; September 2015',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    })
  })

  it('throws on error', async () => {
    vi.mocked(freighterApi.getNetworkDetails).mockResolvedValue({
      network: '',
      networkUrl: '',
      networkPassphrase: '',
      error: { code: -1, message: 'boom' },
    })
    await expect(getNetworkDetails()).rejects.toThrow('boom')
  })
})

describe('signTransaction', () => {
  it('returns the signed XDR on success', async () => {
    vi.mocked(freighterApi.signTransaction).mockResolvedValue({
      signedTxXdr: 'AAAA...signed',
      signerAddress: 'GABC123',
    })
    await expect(
      signTransaction('AAAA...unsigned', { networkPassphrase: 'Test SDF Network ; September 2015' }),
    ).resolves.toBe('AAAA...signed')
  })

  it('throws a FreighterError when the extension reports an error', async () => {
    vi.mocked(freighterApi.signTransaction).mockResolvedValue({
      signedTxXdr: '',
      signerAddress: '',
      error: { code: -4, message: 'User declined access' },
    })
    await expect(
      signTransaction('AAAA...unsigned', { networkPassphrase: 'Test SDF Network ; September 2015' }),
    ).rejects.toThrow(FreighterError)
  })
})
