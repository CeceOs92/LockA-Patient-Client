import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from './TextField'

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Recovery address" />)
    expect(screen.getByLabelText('Recovery address')).toBeInTheDocument()
  })

  it('fires onChange as the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TextField label="Recovery address" onChange={onChange} />)
    await user.type(screen.getByLabelText('Recovery address'), 'GABC')
    expect(onChange).toHaveBeenCalledTimes(4)
  })

  it('shows helper text when there is no error', () => {
    render(<TextField label="Recovery address" helperText="A Stellar G... address" />)
    expect(screen.getByText('A Stellar G... address')).toBeInTheDocument()
  })

  it('shows an error message and marks the field invalid, hiding helper text', () => {
    render(
      <TextField
        label="Recovery address"
        helperText="A Stellar G... address"
        error="Invalid address"
      />,
    )
    const input = screen.getByLabelText('Recovery address')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Invalid address')).toBeInTheDocument()
    expect(screen.queryByText('A Stellar G... address')).not.toBeInTheDocument()
    expect(input).toHaveAccessibleDescription('Invalid address')
  })
})
