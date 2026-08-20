import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as freighterApi from '@stellar/freighter-api'
import { AppProviders } from './providers'
import { useToast } from '../components/toast'
import { createMockClient, useIsMockData, useSorobanClient, MOCK_PATIENT_ADDRESS } from '../lib/soroban'
import { useWallet } from '../lib/wallet'

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetwork: vi.fn(),
  getNetworkDetails: vi.fn(),
}))

/** Reads all three contexts, so a missing or misordered provider fails the render. */
function ContextProbe() {
  const wallet = useWallet()
  const toast = useToast()
  const client = useSorobanClient()
  const isMockData = useIsMockData()
  const [passportName, setPassportName] = useState('loading')

  useEffect(() => {
    let cancelled = false
    client.getPassport(MOCK_PATIENT_ADDRESS).then((passport) => {
      if (!cancelled) {
        setPassportName(passport?.displayName ?? 'none')
      }
    })
    return () => {
      cancelled = true
    }
  }, [client])

  return (
    <div>
      <p>wallet: {wallet.isConnected ? 'connected' : 'disconnected'}</p>
      <p>passport: {passportName}</p>
      <p>mock data: {String(isMockData)}</p>
      <button type="button" onClick={() => toast.info('Providers are wired up')}>
        Push toast
      </button>
    </div>
  )
}

beforeEach(() => {
  vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: false })
})

describe('AppProviders', () => {
  it('exposes the wallet, toast, and contract-client contexts to the tree', async () => {
    render(
      <AppProviders contractClient={createMockClient({ latencyMs: 0 })}>
        <ContextProbe />
      </AppProviders>,
    )

    expect(screen.getByText('wallet: disconnected')).toBeInTheDocument()
    expect(await screen.findByText('passport: Amara Okafor')).toBeInTheDocument()
  })

  it('mounts toasts above the wallet, so wallet errors have somewhere to land', async () => {
    // WalletProvider calls useToast() while rendering: were ToastProvider nested
    // inside it, every render here — and every render of the app — would throw.
    const user = userEvent.setup()
    render(
      <AppProviders contractClient={createMockClient({ latencyMs: 0 })}>
        <ContextProbe />
      </AppProviders>,
    )

    await user.click(screen.getByRole('button', { name: 'Push toast' }))
    expect(await screen.findByText('Providers are wired up')).toBeInTheDocument()
  })

  it('reports mock-data mode from the environment', async () => {
    vi.stubEnv('VITE_USE_MOCK_CONTRACTS', 'true')
    try {
      render(
        <AppProviders contractClient={createMockClient({ latencyMs: 0 })}>
          <ContextProbe />
        </AppProviders>,
      )
      expect(await screen.findByText('mock data: true')).toBeInTheDocument()
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
