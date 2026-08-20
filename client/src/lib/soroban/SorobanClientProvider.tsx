import { useMemo, type ReactNode } from 'react'
import { SorobanClientContext, type SorobanClientContextValue } from './context'
import { getContractClient, isMockContractsEnabled } from './factory'
import type { LockaContractClient } from './types'

export interface SorobanClientProviderProps {
  children: ReactNode
  /**
   * Overrides the env-selected client. Tests and previews pass one in; the app
   * leaves it out and gets whatever `VITE_USE_MOCK_CONTRACTS` selects.
   */
  client?: LockaContractClient
}

/**
 * Puts one contract client on the tree. `getContractClient()` caches its
 * result, so the mock keeps its in-session state across route changes and
 * re-renders.
 */
export function SorobanClientProvider({ children, client }: SorobanClientProviderProps) {
  const value = useMemo<SorobanClientContextValue>(
    () => ({ client: client ?? getContractClient(), isMockData: isMockContractsEnabled() }),
    [client],
  )

  return <SorobanClientContext.Provider value={value}>{children}</SorobanClientContext.Provider>
}
