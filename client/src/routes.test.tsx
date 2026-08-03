import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

describe('AppRoutes', () => {
  it.each(['/', '/passport', '/records', '/consent', '/this-route-does-not-exist'])(
    'renders %s without throwing',
    (path) => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>,
      )
      // Navbar (part of the shared Layout) renders on every route, matched or not.
      expect(screen.getByText('Medical Passport')).toBeInTheDocument()
    },
  )

  it('renders the 404 page for an unmatched route', () => {
    render(
      <MemoryRouter initialEntries={['/nowhere']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders the Dashboard heading at the index route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('LockA')
  })
})
