import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '../../components/toast'
import { useContractCall } from './useContractCall'
import { FreighterError } from '../wallet/freighter'

function TestHarness({ fn }: { fn: () => Promise<string> }) {
  const { call } = useContractCall()
  return (
    <div>
      <button
        onClick={async () => {
          const result = await call(fn)
          const output = document.getElementById('result')!
          output.textContent = result ?? 'undefined'
        }}
      >
        run
      </button>
      <div id="result" />
    </div>
  )
}

function renderHarness(fn: () => Promise<string>) {
  return render(
    <ToastProvider>
      <TestHarness fn={fn} />
    </ToastProvider>,
  )
}

describe('useContractCall', () => {
  it('returns the resolved value on success without showing a toast', async () => {
    const user = userEvent.setup()
    renderHarness(async () => 'success-value')
    await user.click(screen.getByText('run'))

    expect(await screen.findByText('success-value')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('catches a failure, shows a friendly toast, and resolves to undefined', async () => {
    const user = userEvent.setup()
    renderHarness(async () => {
      throw new FreighterError('User declined access')
    })
    await user.click(screen.getByText('run'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Freighter rejected the request.')
    expect(screen.getByText('undefined')).toBeInTheDocument()
  })

  it('never lets a rejected call escape as an unhandled promise rejection', async () => {
    const user = userEvent.setup()
    renderHarness(async () => {
      throw new Error('HostError: Error(Contract, #2)')
    })
    await user.click(screen.getByText('run'))

    expect(await screen.findByRole('alert')).toHaveTextContent('That medical record could not be found.')
  })
})
