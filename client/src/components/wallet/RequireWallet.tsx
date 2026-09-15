import type { ReactNode } from 'react'
import { useWallet } from '../../lib/wallet'
import { Card, Spinner } from '../ui'
import { WalletButton } from './WalletButton'

export interface RequireWalletProps {
  children: ReactNode
  /** Heading for the prompt, when the default is too generic for the page. */
  title?: string
  /** Copy under the heading — say what the page needs the wallet for. */
  description?: string
}

const DEFAULT_TITLE = 'Connect your wallet'
const DEFAULT_DESCRIPTION =
  'Your health passport is tied to your Stellar account. Connect Freighter to unlock this page — LockA never sees your keys, and nothing is signed without your approval.'

const NOT_INSTALLED_TITLE = 'Freighter wallet required'
const NOT_INSTALLED_DESCRIPTION =
  'LockA uses the Freighter browser extension to prove who you are and to sign consent transactions on Stellar. Install it, then reload this page.'

function WalletPrompt({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Card className="glow-blue p-10 text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-brand-blue"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </span>
        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">{description}</p>
        <div className="flex justify-center">{action}</div>
      </Card>
    </div>
  )
}

/**
 * Route guard for pages that only make sense with a connected wallet. Renders a
 * connect prompt in place of its children until one is connected — it does not
 * redirect, so the user keeps the URL they asked for and lands on the page as
 * soon as they connect.
 *
 * A connected wallet on the wrong network still renders the page: reads work,
 * and the navbar already offers the network switch for signing.
 */
export function RequireWallet({ children, title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION }: RequireWalletProps) {
  const { isConnected, isDetecting, isInstalled } = useWallet()

  if (isDetecting) {
    return (
      <WalletPrompt
        title="Looking for your wallet"
        description="Checking whether the Freighter extension is available in this browser."
        action={<Spinner size={24} />}
      />
    )
  }

  if (!isConnected) {
    return (
      <WalletPrompt
        title={isInstalled ? title : NOT_INSTALLED_TITLE}
        description={isInstalled ? description : NOT_INSTALLED_DESCRIPTION}
        action={<WalletButton />}
      />
    )
  }

  return <>{children}</>
}
