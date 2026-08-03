import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold text-white mb-3">404</h1>
      <p className="text-slate-400 text-sm mb-6">This page doesn't exist.</p>
      <Link
        to="/"
        className="btn-primary px-4 py-2 rounded-lg text-sm inline-flex items-center justify-center gap-2"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
