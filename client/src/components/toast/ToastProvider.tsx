import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ToastContext } from './context'
import { ToastViewport } from './ToastViewport'
import type { ToastContextValue, ToastKind, ToastOptions, ToastRecord } from './types'

const DEFAULT_DURATION_MS = 5000

let toastIdCounter = 0
function nextToastId(): string {
  toastIdCounter += 1
  return `toast-${toastIdCounter}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (kind: ToastKind, message: string, opts?: ToastOptions) => {
      const id = nextToastId()
      const durationMs = opts?.durationMs ?? DEFAULT_DURATION_MS
      setToasts((current) => [
        ...current,
        { id, kind, message, title: opts?.title, txHash: opts?.txHash },
      ])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), durationMs),
      )
    },
    [dismiss],
  )

  const value: ToastContextValue = {
    success: (message, opts) => push('success', message, opts),
    error: (message, opts) => push('error', message, opts),
    info: (message, opts) => push('info', message, opts),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
