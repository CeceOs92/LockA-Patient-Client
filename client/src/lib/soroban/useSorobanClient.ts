import { useContext } from 'react'
import { SorobanClientContext } from './context'
import type { LockaContractClient } from './types'

function useSorobanContext() {
  const ctx = useContext(SorobanClientContext)
  if (!ctx) {
    throw new Error('useSorobanClient must be used within a SorobanClientProvider')
  }
  return ctx
}

/** The app's contract client. Identical shape whether it is real or mocked. */
export function useSorobanClient(): LockaContractClient {
  return useSorobanContext().client
}

/** True when the app is running on mock data — for dev badges, not for branching logic. */
export function useIsMockData(): boolean {
  return useSorobanContext().isMockData
}
