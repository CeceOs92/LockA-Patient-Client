import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders an accessible loading status at the default size', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status', { name: /loading/i })
    expect(spinner).toHaveClass('spinner')
    expect(spinner).toHaveStyle({ width: '18px', height: '18px' })
  })

  it('respects a custom size', () => {
    render(<Spinner size={32} />)
    expect(screen.getByRole('status', { name: /loading/i })).toHaveStyle({
      width: '32px',
      height: '32px',
    })
  })
})
