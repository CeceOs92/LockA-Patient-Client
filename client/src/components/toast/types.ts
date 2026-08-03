export type ToastKind = 'success' | 'error' | 'info'

export interface ToastOptions {
  title?: string
  txHash?: string
  /** Auto-dismiss delay in ms. Defaults to 5000. */
  durationMs?: number
}

export interface ToastRecord extends ToastOptions {
  id: string
  kind: ToastKind
  message: string
}

export interface ToastContextValue {
  success: (message: string, opts?: ToastOptions) => void
  error: (message: string, opts?: ToastOptions) => void
  info: (message: string, opts?: ToastOptions) => void
}
