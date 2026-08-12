import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as freighterApi from '@stellar/freighter-api'
import { AppRoutes } from './routes'
import { ToastProvider } from './components/toast'
import { WalletProvider } from './lib/wallet'

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

function renderRoutes(path: string) {
  return render(
    <ToastProvider>
      <WalletProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </WalletProvider>
    </ToastProvider>,
  )
}

describe('AppRoutes', () => {
  it.each(['/', '/passport', '/records', '/consent', '/this-route-does-not-exist'])(
    'renders %s without throwing',
    (path) => {
      renderRoutes(path)
      // Navbar (part of the shared Layout) renders on every route, matched or not.
      expect(screen.getByText('Medical Passport')).toBeInTheDocument()
    },
  )

  it('renders the 404 page for an unmatched route', () => {
    renderRoutes('/nowhere')
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders the Dashboard heading at the index route', () => {
    renderRoutes('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('LockA')
  })
})
