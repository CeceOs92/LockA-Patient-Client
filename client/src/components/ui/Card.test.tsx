import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('defaults to the glass variant', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toHaveClass('glass', 'rounded-2xl')
  })

  it('applies the glass-bright variant', () => {
    render(
      <Card variant="glass-bright" data-testid="card">
        Content
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveClass('glass-bright')
  })

  it('merges a custom className', () => {
    render(
      <Card className="p-6" data-testid="card">
        Content
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveClass('glass', 'rounded-2xl', 'p-6')
  })
})
