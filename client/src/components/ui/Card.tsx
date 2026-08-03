import type { HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-bright'
}

export function Card({ variant = 'glass', className = '', ...rest }: CardProps) {
  return <div className={`${variant} rounded-2xl ${className}`} {...rest} />
}
