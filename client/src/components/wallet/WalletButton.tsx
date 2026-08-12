import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { FREIGHTER_INSTALL_URL, useWallet } from '../../lib/wallet'

const NETWORK_LABELS: Record<string, string> = {
  PUBLIC: 'Mainnet',
  TESTNET: 'Testnet',
  FUTURENET: 'Futurenet',
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

export function WalletButton() {
  const { address, network, isInstalled, isDetecting, isConnecting, isWrongNetwork, connect, disconnect } =
    useWallet()

  if (isDetecting) {
    return (
      <Button variant="secondary" loading>
        Connect Wallet
      </Button>
    )
  }

  if (!isInstalled) {
    return (
      <a
        href={FREIGHTER_INSTALL_URL}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2"
      >
        Install Freighter
      </a>
    )
  }

  if (address) {
    return (
      <div className="flex items-center gap-2">
        {isWrongNetwork ? (
          <button
            type="button"
            onClick={connect}
            title="Switch networks inside the Freighter extension, then click to refresh"
            className="btn-amber px-3 py-2 rounded-lg text-xs font-semibold"
          >
            Switch network
          </button>
        ) : (
          network && <Badge color="cyan">{NETWORK_LABELS[network] ?? network}</Badge>
        )}
        <button
          type="button"
          onClick={disconnect}
          title={address}
          aria-label={`Disconnect wallet ${address}`}
          className="btn-secondary px-4 py-2 rounded-lg text-sm font-mono"
        >
          {truncateAddress(address)}
        </button>
      </div>
    )
  }

  return (
    <Button variant="primary" loading={isConnecting} onClick={connect}>
      Connect Wallet
    </Button>
  )
}
