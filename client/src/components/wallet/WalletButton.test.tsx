import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletButton } from './WalletButton'
import { useWallet } from '../../lib/wallet'
import type { WalletContextValue } from '../../lib/wallet'

vi.mock('../../lib/wallet', async () => {
  const actual = await vi.importActual<typeof import('../../lib/wallet')>('../../lib/wallet')
  return { ...actual, useWallet: vi.fn() }
})

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

describe('WalletButton', () => {
  it('shows a disabled, loading Connect Wallet button while detecting the extension', () => {
    mockWallet({ isDetecting: true })
    render(<WalletButton />)
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeDisabled()
  })

  it('shows an install link when Freighter is not installed', () => {
    mockWallet({ isDetecting: false, isInstalled: false })
    render(<WalletButton />)
    const link = screen.getByRole('link', { name: /install freighter/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('freighter.app'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('shows an enabled Connect Wallet button when installed and disconnected', async () => {
    const user = userEvent.setup()
    const connect = vi.fn()
    mockWallet({ isInstalled: true, connect })
    render(<WalletButton />)

    const button = screen.getByRole('button', { name: /connect wallet/i })
    expect(button).toBeEnabled()
    await user.click(button)
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('disables the Connect Wallet button while connecting', () => {
    mockWallet({ isInstalled: true, isConnecting: true })
    render(<WalletButton />)
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeDisabled()
  })

  it('shows the truncated address and network badge when connected', () => {
    mockWallet({ address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567', network: 'TESTNET' })
    render(<WalletButton />)
    expect(screen.getByText('GABC…4567')).toBeInTheDocument()
    expect(screen.getByText('Testnet')).toBeInTheDocument()
  })

  it('shows a switch-network affordance instead of the badge when the network is wrong', () => {
    mockWallet({ address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567', network: 'PUBLIC', isWrongNetwork: true })
    render(<WalletButton />)
    expect(screen.getByRole('button', { name: /switch network/i })).toBeInTheDocument()
    expect(screen.queryByText('Mainnet')).not.toBeInTheDocument()
  })

  it('disconnects when the address button is clicked', async () => {
    const user = userEvent.setup()
    const disconnect = vi.fn()
    mockWallet({ address: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567', network: 'TESTNET', disconnect })
    render(<WalletButton />)

    await user.click(screen.getByRole('button', { name: /disconnect/i }))
    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
