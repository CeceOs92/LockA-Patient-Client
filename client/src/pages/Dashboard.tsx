import { Badge, Card } from '../components/ui'

const NETWORK_LABELS: Record<string, string> = {
  'Test SDF Network ; September 2015': 'Stellar Testnet',
  'Public Global Stellar Network ; September 2015': 'Stellar Mainnet',
}

const SCAFFOLD_CHECKLIST = [
  'Vite + React + TypeScript (strict mode)',
  'Tailwind CSS v4 design tokens',
  'Vitest + React Testing Library',
  'oxlint',
]

function ConfiguredValue({ value }: { value: string }) {
  if (!value) {
    return <Badge color="amber">Not configured</Badge>
  }
  return (
    <span className="font-mono text-sm text-slate-300 truncate max-w-[220px]" title={value}>
      {value}
    </span>
  )
}

export function Dashboard() {
  const networkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE
  const rpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  const networkName = networkPassphrase ? (NETWORK_LABELS[networkPassphrase] ?? 'Custom Network') : ''

  return (
    <div className="px-6 py-16">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-white">Lock</span>
            <span className="gradient-text">A</span>
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Decentralized healthcare identity &amp; records platform. Patients control who
            can see their medical history &mdash; on-chain consent, off-chain data.
          </p>
        </div>

        <Card className="glow-blue p-6 sm:p-8 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Scaffold status
          </h2>
          <ul className="space-y-2.5">
            {SCAFFOLD_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <svg className="w-4 h-4 text-brand-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
            Environment
          </h2>
          <div className="divide-y divide-blue-900/20">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Network</span>
              <ConfiguredValue value={networkName} />
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-xs text-slate-500 uppercase tracking-wide">Soroban RPC</span>
              <ConfiguredValue value={rpcUrl} />
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-xs text-slate-500 uppercase tracking-wide">API base URL</span>
              <ConfiguredValue value={apiBaseUrl} />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Set these in <code className="font-mono text-slate-500">.env</code> — see{' '}
            <code className="font-mono text-slate-500">.env.example</code> for the full list.
          </p>
        </Card>
      </div>
    </div>
  )
}
