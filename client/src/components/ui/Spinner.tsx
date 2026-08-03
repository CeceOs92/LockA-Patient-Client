export interface SpinnerProps {
  size?: number
  className?: string
}

export function Spinner({ size = 18, className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`spinner ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
