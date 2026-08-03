import { Badge } from '../ui'
import type { ToastKind, ToastRecord } from './types'

const KIND_BADGE_COLOR: Record<ToastKind, 'green' | 'red' | 'blue'> = {
  success: 'green',
  error: 'red',
  info: 'blue',
}

interface ToastViewportProps {
  toasts: ToastRecord[]
  onDismiss: (id: string) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className="glass-bright rounded-xl p-4 shadow-lg pointer-events-auto animate-slide-up"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge color={KIND_BADGE_COLOR[toast.kind]}>{toast.kind}</Badge>
                {toast.title && <span className="text-sm font-semibold text-white">{toast.title}</span>}
              </div>
              <p className="text-sm text-slate-300">{toast.message}</p>
              {toast.txHash && (
                <p className="text-xs font-mono text-slate-500 mt-1 truncate" title={toast.txHash}>
                  {toast.txHash}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
              className="text-slate-500 hover:text-slate-300 flex-shrink-0 leading-none text-lg"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
