import { createContext } from 'react'
import type { LockaContractClient } from './types'

export interface SorobanClientContextValue {
  /** The contract client for this session — real or mock, chosen by env. */
  client: LockaContractClient
  /**
   * Whether the app is running on mock data (`VITE_USE_MOCK_CONTRACTS`). For
   * display only — a dev badge or banner. Never branch behaviour on it: both
   * clients implement the same interface precisely so features don't have to.
   */
  isMockData: boolean
}

export const SorobanClientContext = createContext<SorobanClientContextValue | null>(null)
