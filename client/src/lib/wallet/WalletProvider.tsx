import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useToast } from '../../components/toast'
import { WalletContext } from './context'
import { FreighterError, getAddress, getNetworkDetails, isFreighterInstalled, requestAccess } from './freighter'
import type { WalletContextValue } from './types'

interface WalletState {
  isDetecting: boolean
  isInstalled: boolean
  address: string | null
  network: string | null
  networkPassphrase: string | null
  isConnecting: boolean
  error: string | null
}

const INITIAL_STATE: WalletState = {
  isDetecting: true,
  isInstalled: false,
  address: null,
  network: null,
  networkPassphrase: null,
  isConnecting: false,
  error: null,
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(INITIAL_STATE)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const installed = await isFreighterInstalled()
      if (cancelled) return
      if (!installed) {
        setState((current) => ({ ...current, isDetecting: false, isInstalled: false }))
        return
      }

      try {
        const address = await getAddress()
        if (cancelled) return
        if (!address) {
          setState((current) => ({ ...current, isDetecting: false, isInstalled: true }))
          return
        }
        const { network, networkPassphrase } = await getNetworkDetails()
        if (cancelled) return
        setState((current) => ({
          ...current,
          isDetecting: false,
          isInstalled: true,
          address,
          network,
          networkPassphrase,
        }))
      } catch {
        // No prior access granted — leave the wallet in its disconnected state.
        if (!cancelled) {
          setState((current) => ({ ...current, isDetecting: false, isInstalled: true }))
        }
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const connect = useCallback(async () => {
    setState((current) => ({ ...current, isConnecting: true, error: null }))
    try {
      const address = await requestAccess()
      const { network, networkPassphrase } = await getNetworkDetails()
      setState((current) => ({
        ...current,
        isInstalled: true,
        address,
        network,
        networkPassphrase,
        isConnecting: false,
      }))
    } catch (err) {
      const message = err instanceof FreighterError ? err.message : 'Could not connect to Freighter.'
      setState((current) => ({ ...current, isConnecting: false, error: message }))
      toast.error(message, { title: 'Wallet connection failed' })
    }
  }, [toast])

  const disconnect = useCallback(() => {
    // Freighter has no revoke API for dApps — this only clears local app state.
    setState((current) => ({ ...current, address: null, network: null, networkPassphrase: null, error: null }))
  }, [])

  const expectedNetworkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE

  const value = useMemo<WalletContextValue>(() => {
    const isWrongNetwork = Boolean(
      state.address &&
        expectedNetworkPassphrase &&
        state.networkPassphrase &&
        state.networkPassphrase !== expectedNetworkPassphrase,
    )
    return {
      address: state.address,
      network: state.network,
      networkPassphrase: state.networkPassphrase,
      expectedNetworkPassphrase,
      isInstalled: state.isInstalled,
      isDetecting: state.isDetecting,
      isConnecting: state.isConnecting,
      isConnected: Boolean(state.address),
      isWrongNetwork,
      error: state.error,
      connect,
      disconnect,
    }
  }, [state, expectedNetworkPassphrase, connect, disconnect])

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
