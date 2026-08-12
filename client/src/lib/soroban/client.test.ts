import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Account, StrKey, nativeToScVal } from '@stellar/stellar-sdk'
import * as wallet from '../wallet/freighter'

const mockServer = {
  simulateTransaction: vi.fn(),
  prepareTransaction: vi.fn(),
  sendTransaction: vi.fn(),
  pollTransaction: vi.fn(),
  getAccount: vi.fn(),
}

vi.mock('@stellar/stellar-sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stellar/stellar-sdk')>()
  return {
    ...actual,
    rpc: {
      ...actual.rpc,
      // `new rpc.Server(...)` requires a constructible mock — an arrow function can't be `new`-ed.
      Server: vi.fn().mockImplementation(function MockServer() {
        return mockServer
      }),
    },
  }
})

vi.mock('../wallet/freighter', () => ({
  getAddress: vi.fn(),
  signTransaction: vi.fn(),
}))

const { invokeContract, readContract } = await import('./client')
const { SorobanError } = await import('./errors')

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015'
const CONTRACT_ID = 'CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5'

async function catchError(promise: Promise<unknown>): Promise<InstanceType<typeof SorobanError>> {
  try {
    await promise
  } catch (err) {
    return err as InstanceType<typeof SorobanError>
  }
  throw new Error('Expected the promise to reject')
}

beforeEach(() => {
  vi.stubEnv('VITE_SOROBAN_RPC_URL', 'https://soroban-testnet.stellar.org')
  vi.stubEnv('VITE_NETWORK_PASSPHRASE', TESTNET_PASSPHRASE)
})

afterEach(() => {
  vi.unstubAllEnvs()
  Object.values(mockServer).forEach((fn) => fn.mockReset())
  vi.mocked(wallet.getAddress).mockReset()
  vi.mocked(wallet.signTransaction).mockReset()
})

describe('readContract', () => {
  it('simulates the call and returns the decoded result without touching the wallet', async () => {
    mockServer.simulateTransaction.mockResolvedValue({
      result: { auth: [], retval: nativeToScVal('hello') },
    })

    await expect(readContract<string>({ contractId: CONTRACT_ID, method: 'name' })).resolves.toBe('hello')
    expect(wallet.getAddress).not.toHaveBeenCalled()
    expect(wallet.signTransaction).not.toHaveBeenCalled()
  })

  it('throws a simulation-stage SorobanError when the simulation reports an error', async () => {
    mockServer.simulateTransaction.mockResolvedValue({ error: 'contract trapped' })

    const error = await catchError(readContract({ contractId: CONTRACT_ID, method: 'name' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('simulation')
    expect(error.message).toContain('contract trapped')
  })

  it('throws a simulation-stage SorobanError when the RPC call itself fails', async () => {
    mockServer.simulateTransaction.mockRejectedValue(new Error('network unreachable'))

    const error = await catchError(readContract({ contractId: CONTRACT_ID, method: 'name' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('simulation')
    expect(error.message).toContain('network unreachable')
  })
})

describe('invokeContract', () => {
  function mockConnectedWallet(address = StrKey.encodeEd25519PublicKey(new Uint8Array(32).fill(7))) {
    vi.mocked(wallet.getAddress).mockResolvedValue(address)
    mockServer.getAccount.mockResolvedValue(new Account(address, '100'))
    // No real signature needed here — TransactionBuilder.fromXDR doesn't verify one.
    vi.mocked(wallet.signTransaction).mockImplementation(async (xdrString) => xdrString)
    mockServer.prepareTransaction.mockImplementation(async (tx) => tx)
    return address
  }

  it('requires a connected wallet before invoking', async () => {
    vi.mocked(wallet.getAddress).mockResolvedValue('')

    const error = await catchError(invokeContract({ contractId: CONTRACT_ID, method: 'register' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('simulation')
    expect(error.message).toMatch(/connect a wallet/i)
    expect(mockServer.getAccount).not.toHaveBeenCalled()
  })

  it('simulates, signs, submits, and polls to a decoded success result', async () => {
    mockConnectedWallet()
    mockServer.sendTransaction.mockResolvedValue({
      status: 'PENDING',
      hash: 'deadbeef',
      latestLedger: 100,
      latestLedgerCloseTime: 123,
    })
    mockServer.pollTransaction.mockResolvedValue({
      status: 'SUCCESS',
      returnValue: nativeToScVal(42),
    })

    await expect(invokeContract<bigint>({ contractId: CONTRACT_ID, method: 'register' })).resolves.toBe(42n)
    expect(mockServer.sendTransaction).toHaveBeenCalledTimes(1)
    expect(mockServer.pollTransaction).toHaveBeenCalledWith('deadbeef', { attempts: 10 })
  })

  it('throws a simulation-stage SorobanError when prepareTransaction fails, without signing', async () => {
    mockConnectedWallet()
    mockServer.prepareTransaction.mockReset()
    mockServer.prepareTransaction.mockRejectedValue(new Error('insufficient resource fee'))

    const error = await catchError(invokeContract({ contractId: CONTRACT_ID, method: 'register' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('simulation')
    expect(error.message).toContain('insufficient resource fee')
    expect(wallet.signTransaction).not.toHaveBeenCalled()
  })

  it('throws a sign-stage SorobanError when Freighter signing fails', async () => {
    mockConnectedWallet()
    vi.mocked(wallet.signTransaction).mockRejectedValue(new Error('User declined access'))

    const error = await catchError(invokeContract({ contractId: CONTRACT_ID, method: 'register' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('sign')
    expect(error.message).toContain('User declined access')
    expect(mockServer.sendTransaction).not.toHaveBeenCalled()
  })

  it('throws a submit-stage SorobanError when the network rejects the transaction', async () => {
    mockConnectedWallet()
    mockServer.sendTransaction.mockResolvedValue({
      status: 'ERROR',
      hash: 'deadbeef',
      latestLedger: 100,
      latestLedgerCloseTime: 123,
    })

    const error = await catchError(invokeContract({ contractId: CONTRACT_ID, method: 'register' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('submit')
    expect(error.message).toContain('ERROR')
    expect(mockServer.pollTransaction).not.toHaveBeenCalled()
  })

  it('throws a contract-stage SorobanError when the transaction fails on-chain', async () => {
    mockConnectedWallet()
    mockServer.sendTransaction.mockResolvedValue({
      status: 'PENDING',
      hash: 'deadbeef',
      latestLedger: 100,
      latestLedgerCloseTime: 123,
    })
    mockServer.pollTransaction.mockResolvedValue({ status: 'FAILED' })

    const error = await catchError(invokeContract({ contractId: CONTRACT_ID, method: 'register' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('contract')
  })

  it('throws a poll-stage SorobanError when confirmation times out', async () => {
    mockConnectedWallet()
    mockServer.sendTransaction.mockResolvedValue({
      status: 'PENDING',
      hash: 'deadbeef',
      latestLedger: 100,
      latestLedgerCloseTime: 123,
    })
    mockServer.pollTransaction.mockResolvedValue({ status: 'NOT_FOUND' })

    const error = await catchError(invokeContract({ contractId: CONTRACT_ID, method: 'register' }))
    expect(error).toBeInstanceOf(SorobanError)
    expect(error.stage).toBe('poll')
    expect(error.message).toMatch(/timed out/i)
  })
})
