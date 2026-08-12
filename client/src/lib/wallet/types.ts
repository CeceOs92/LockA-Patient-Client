export interface WalletContextValue {
  address: string | null
  network: string | null
  networkPassphrase: string | null
  /** The network passphrase this app expects, from VITE_NETWORK_PASSPHRASE. */
  expectedNetworkPassphrase: string
  isInstalled: boolean
  /** True until the initial extension-presence check resolves. */
  isDetecting: boolean
  isConnecting: boolean
  isConnected: boolean
  isWrongNetwork: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}
