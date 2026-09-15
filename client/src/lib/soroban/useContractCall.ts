import { useCallback } from 'react'
import { useToast } from '../../components/toast'
import { parseContractError } from './errors'

/**
 * Wraps a Soroban contract call (e.g. `invokeContract`/`readContract`) so any
 * failure is caught and shown as a friendly toast instead of surfacing raw
 * SDK/host error text.
 */
export function useContractCall() {
  const toast = useToast()

  const call = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn()
      } catch (err) {
        toast.error(parseContractError(err))
        return undefined
      }
    },
    [toast],
  )

  return { call }
}
