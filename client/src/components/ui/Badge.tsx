import type { HTMLAttributes } from 'react'

export type BadgeColor = 'green' | 'amber' | 'red' | 'blue' | 'cyan' | 'gray'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor
}

export function Badge({ color = 'gray', className = '', children, ...rest }: BadgeProps) {
  return (
    <span className={`badge badge-${color} ${className}`} {...rest}>
      {children}
    </span>
  )
}
