import { LockaLogo } from './components/LockaLogo'

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
    return <span className="badge badge-amber">Not configured</span>
  }
  return (
    <span className="font-mono text-sm text-slate-300 truncate max-w-[220px]" title={value}>
      {value}
    </span>
  )
}

function App() {
  const networkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE
  const rpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  const networkName = networkPassphrase ? (NETWORK_LABELS[networkPassphrase] ?? 'Custom Network') : ''

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass sticky top-0 z-10 border-b border-blue-900/30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LockaLogo size={34} />
            <div className="leading-none">
              <div className="text-sm font-bold tracking-tight">
                <span className="text-white">Lock</span>
                <span className="gradient-text">A</span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
                Medical Passport
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled
            title="Wallet connection lands in a follow-up feature issue"
            className="text-sm px-4 py-2 rounded-lg font-semibold text-white opacity-50 cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #0066ff, #00d4ff)' }}
          >
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
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

          <div className="glass glow-blue rounded-2xl p-6 sm:p-8 mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Scaffold status
            </h2>
            <ul className="space-y-2.5">
              {SCAFFOLD_CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-brand-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
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
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-6">
        LockA Patient Client &mdash; patient app for health passports, records, and provider consent.
      </footer>
    </div>
  )
}

export default App
