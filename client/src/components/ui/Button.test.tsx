import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders children and defaults to the primary variant', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveClass('btn-primary')
    expect(button).toHaveAttribute('type', 'button')
  })

  it.each(['primary', 'secondary', 'success', 'danger', 'amber'] as const)(
    'applies the %s variant class',
    (variant) => {
      render(<Button variant={variant}>Go</Button>)
      expect(screen.getByRole('button', { name: 'Go' })).toHaveClass(`btn-${variant}`)
    },
  )

  it('fires onClick when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    await user.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled and does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows a spinner and disables itself while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Submitting
      </Button>,
    )
    const button = screen.getByRole('button', { name: /submitting/i })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
