import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import * as freighterApi from '@stellar/freighter-api'
import App from './App'
import { AppProviders } from './app/providers'

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetwork: vi.fn(),
  getNetworkDetails: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(freighterApi.isConnected).mockResolvedValue({ isConnected: false })
})

describe('App', () => {
  it('renders the LockA placeholder page', async () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('LockA')
    expect(screen.getByText('Medical Passport')).toBeInTheDocument()
    expect(screen.getByText(/decentralized healthcare identity/i)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('link', { name: /install freighter/i })).toBeInTheDocument())
  })
})
