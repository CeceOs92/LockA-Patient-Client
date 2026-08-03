import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'amber'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  amber: 'btn-amber',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, disabled, type = 'button', className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${VARIANT_CLASSES[variant]} px-4 py-2 rounded-lg text-sm inline-flex items-center justify-center gap-2 ${className}`}
      {...rest}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
})
