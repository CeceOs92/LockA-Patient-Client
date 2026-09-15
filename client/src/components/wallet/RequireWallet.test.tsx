import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RequireWallet } from './RequireWallet'
import { useWallet } from '../../lib/wallet'
import type { WalletContextValue } from '../../lib/wallet'

vi.mock('../../lib/wallet', async () => {
  const actual = await vi.importActual<typeof import('../../lib/wallet')>('../../lib/wallet')
  return { ...actual, useWallet: vi.fn() }
})

const CONNECTED_ADDRESS = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function mockWallet(overrides: Partial<WalletContextValue>) {
  vi.mocked(useWallet).mockReturnValue({
    address: null,
    network: null,
    networkPassphrase: null,
    expectedNetworkPassphrase: 'Test SDF Network ; September 2015',
    isInstalled: true,
    isDetecting: false,
    isConnecting: false,
    isConnected: false,
    isWrongNetwork: false,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    ...overrides,
  })
}

function renderGuard(props: { title?: string; description?: string } = {}) {
  return render(
    <RequireWallet {...props}>
      <p>Passport contents</p>
    </RequireWallet>,
  )
}

describe('RequireWallet', () => {
  it('renders its children once a wallet is connected', () => {
    mockWallet({ isConnected: true, address: CONNECTED_ADDRESS, network: 'TESTNET' })
    renderGuard()

    expect(screen.getByText('Passport contents')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /connect your wallet/i })).not.toBeInTheDocument()
  })

  it('shows the connect prompt instead of its children while disconnected', () => {
    mockWallet({ isConnected: false })
    renderGuard()

    expect(screen.queryByText('Passport contents')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /connect your wallet/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeEnabled()
  })

  it('connects from the prompt', async () => {
    const user = userEvent.setup()
    const connect = vi.fn()
    mockWallet({ isConnected: false, connect })
    renderGuard()

    await user.click(screen.getByRole('button', { name: /connect wallet/i }))
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('accepts page-specific prompt copy', () => {
    mockWallet({ isConnected: false })
    renderGuard({ title: 'Connect to view records', description: 'Records are encrypted to your passport.' })

    expect(screen.getByRole('heading', { name: 'Connect to view records' })).toBeInTheDocument()
    expect(screen.getByText('Records are encrypted to your passport.')).toBeInTheDocument()
  })

  it('asks the user to install Freighter when the extension is missing', () => {
    mockWallet({ isConnected: false, isInstalled: false })
    renderGuard()

    expect(screen.queryByText('Passport contents')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /freighter wallet required/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /install freighter/i })).toHaveAttribute(
      'href',
      expect.stringContaining('freighter.app'),
    )
  })

  it('waits, without flashing the prompt or the page, while detecting the extension', () => {
    mockWallet({ isDetecting: true })
    renderGuard()

    expect(screen.queryByText('Passport contents')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /connect your wallet/i })).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })
})
