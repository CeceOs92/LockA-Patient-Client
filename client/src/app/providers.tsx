import type { ReactNode } from 'react'
import { ToastProvider } from '../components/toast'
import { SorobanClientProvider } from '../lib/soroban'
import type { LockaContractClient } from '../lib/soroban'
import { WalletProvider } from '../lib/wallet'

export interface AppProvidersProps {
  children: ReactNode
  /** Overrides the env-selected contract client — for tests and previews. */
  contractClient?: LockaContractClient
}

/**
 * Every app-wide context, composed in dependency order:
 *
 * 1. `ToastProvider` — outermost, because `WalletProvider` reports connection
 *    failures through `useToast()`.
 * 2. `WalletProvider` — owns the Freighter connection and the network check.
 * 3. `SorobanClientProvider` — the contract client, innermost so it can read
 *    wallet state as features grow.
 *
 * Routing stays outside this wrapper so tests can supply their own router.
 */
export function AppProviders({ children, contractClient }: AppProvidersProps) {
  return (
    <ToastProvider>
      <WalletProvider>
        <SorobanClientProvider client={contractClient}>{children}</SorobanClientProvider>
      </WalletProvider>
    </ToastProvider>
  )
}
