import { useContext } from 'react'
import { ToastContext } from './context'
import type { ToastContextValue } from './types'

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
