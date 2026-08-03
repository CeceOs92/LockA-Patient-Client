import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-slate-600 py-6">
        LockA Patient Client &mdash; patient app for health passports, records, and provider consent.
      </footer>
    </div>
  )
}
