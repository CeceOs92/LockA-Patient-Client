import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('defaults to the gray color', () => {
    render(<Badge>Unknown</Badge>)
    expect(screen.getByText('Unknown')).toHaveClass('badge', 'badge-gray')
  })

  it.each(['green', 'amber', 'red', 'blue', 'cyan', 'gray'] as const)(
    'applies the %s color class',
    (color) => {
      render(<Badge color={color}>Status</Badge>)
      expect(screen.getByText('Status')).toHaveClass(`badge-${color}`)
    },
  )
})
