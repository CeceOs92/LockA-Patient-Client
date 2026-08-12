import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as freighterApi from '@stellar/freighter-api'
import { ToastProvider } from '../../components/toast'
import { WalletProvider } from './WalletProvider'
import { useWallet } from './useWallet'

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetwork: vi.fn(),
  getNetworkDetails: vi.fn(),
}))

const TESTNET_PASSPHRASE = 'Test SDF Network ; September 2015'
const MAINNET_PASSPHRASE = 'Public Global Stellar Network ; September 2015'

function TestHarness() {
  const wallet = useWallet()
  return (
    <div>
      <div data-testid="installed">{String(wallet.isInstalled)}</div>
      <div data-testid="detecting">{String(wallet.isDetecting)}</div>
      <div data-testid="connecting">{String(wallet.isConnecting)}</div>
      <div data-testid="address">{wallet.address ?? 'none'}</div>
      <div data-testid="network">{wallet.network ?? 'none'}</div>
      <div data-testid="wrong-network">{String(wallet.isWrongNetwork)}</div>
      <button onClick={() => wallet.connect()}>connect</button>
      <button onClick={() => wallet.disconnect()}>disconnect</button>
    </div>
  )
}

function renderWallet() {
  return render(
    <ToastProvider>
      <WalletProvider>
        <TestHarness />
      </WalletProvider>
    </ToastProvider>,
  )
}

beforeEach(() => {
  vi.stubEnv('VITE_NETWORK_PASSPHRASE', TESTNET_PASSPHRASE)
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.mocked(freighterApi.isConnected).mockReset()
  vi.mocked(freighterApi.requestAccess).mockReset()
  vi.mocked(freighterApi.getAddress).mockReset()
  vi.mocked(freighterApi.getNetworkDetails).mockReset()
})

describe('WalletProvider / useWallet', () => {
  it('reports the not-installed state when the extension is absent', async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: false })
    renderWallet()

    await waitFor(() => expect(screen.getByTestId('detecting')).toHaveTextContent('false'))
    expect(screen.getByTestId('installed')).toHaveTextContent('false')
    expect(screen.getByTestId('address')).toHaveTextContent('none')
  })

  it('reports the disconnected state when installed but no prior access was granted', async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '' })
    renderWallet()

    await waitFor(() => expect(screen.getByTestId('detecting')).toHaveTextContent('false'))
    expect(screen.getByTestId('installed')).toHaveTextContent('true')
    expect(screen.getByTestId('address')).toHaveTextContent('none')
  })

  it('silently restores a previously granted address and network on mount', async () => {
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: 'GABC123' })
    vi.mocked(freighterApi.getNetworkDetails).mockResolvedValue({
      network: 'TESTNET',
      networkUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: TESTNET_PASSPHRASE,
    })
    renderWallet()

    await waitFor(() => expect(screen.getByTestId('address')).toHaveTextContent('GABC123'))
    expect(screen.getByTestId('network')).toHaveTextContent('TESTNET')
    expect(screen.getByTestId('wrong-network')).toHaveTextContent('false')
  })

  it('connects on demand via requestAccess, exposing isConnecting while pending', async () => {
    const user = userEvent.setup()
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '' })
    let resolveAccess: (value: { address: string }) => void = () => {}
    vi.mocked(freighterApi.requestAccess).mockReturnValue(
      new Promise((resolve) => {
        resolveAccess = resolve
      }),
    )
    vi.mocked(freighterApi.getNetworkDetails).mockResolvedValue({
      network: 'TESTNET',
      networkUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: TESTNET_PASSPHRASE,
    })
    renderWallet()
    await waitFor(() => expect(screen.getByTestId('detecting')).toHaveTextContent('false'))

    await user.click(screen.getByText('connect'))
    expect(screen.getByTestId('connecting')).toHaveTextContent('true')

    resolveAccess({ address: 'GABC123' })
    await waitFor(() => expect(screen.getByTestId('address')).toHaveTextContent('GABC123'))
    expect(screen.getByTestId('connecting')).toHaveTextContent('false')
  })

  it('flags a wrong-network mismatch against VITE_NETWORK_PASSPHRASE', async () => {
    const user = userEvent.setup()
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '' })
    vi.mocked(freighterApi.requestAccess).mockResolvedValue({ address: 'GABC123' })
    vi.mocked(freighterApi.getNetworkDetails).mockResolvedValue({
      network: 'PUBLIC',
      networkUrl: 'https://horizon.stellar.org',
      networkPassphrase: MAINNET_PASSPHRASE,
    })
    renderWallet()
    await waitFor(() => expect(screen.getByTestId('detecting')).toHaveTextContent('false'))

    await user.click(screen.getByText('connect'))
    await waitFor(() => expect(screen.getByTestId('wrong-network')).toHaveTextContent('true'))
  })

  it('surfaces a toast and clears isConnecting when requestAccess fails', async () => {
    const user = userEvent.setup()
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: '' })
    vi.mocked(freighterApi.requestAccess).mockResolvedValue({
      address: '',
      error: { code: -4, message: 'User declined access' },
    })
    renderWallet()
    await waitFor(() => expect(screen.getByTestId('detecting')).toHaveTextContent('false'))

    await user.click(screen.getByText('connect'))

    await waitFor(() => expect(screen.getByText('User declined access')).toBeInTheDocument())
    expect(screen.getByTestId('connecting')).toHaveTextContent('false')
    expect(screen.getByTestId('address')).toHaveTextContent('none')
  })

  it('disconnects by clearing local address and network state', async () => {
    const user = userEvent.setup()
    vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: true })
    vi.mocked(freighterApi.getAddress).mockResolvedValue({ address: 'GABC123' })
    vi.mocked(freighterApi.getNetworkDetails).mockResolvedValue({
      network: 'TESTNET',
      networkUrl: 'https://horizon-testnet.stellar.org',
      networkPassphrase: TESTNET_PASSPHRASE,
    })
    renderWallet()
    await waitFor(() => expect(screen.getByTestId('address')).toHaveTextContent('GABC123'))

    await user.click(screen.getByText('disconnect'))
    expect(screen.getByTestId('address')).toHaveTextContent('none')
    expect(screen.getByTestId('network')).toHaveTextContent('none')
  })

  it('throws a clear error when used outside a WalletProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Broken() {
      useWallet()
      return null
    }
    expect(() => render(<Broken />)).toThrow(/useWallet must be used within a WalletProvider/)
    consoleError.mockRestore()
  })
})
