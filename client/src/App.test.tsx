import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the LockA placeholder page', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('LockA')
    expect(screen.getByText('Medical Passport')).toBeInTheDocument()
    expect(screen.getByText(/decentralized healthcare identity/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeDisabled()
  })
})
