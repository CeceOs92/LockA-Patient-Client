import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { PassportPage } from './pages/PassportPage'
import { RecordsPage } from './pages/RecordsPage'
import { ConsentPage } from './pages/ConsentPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="passport" element={<PassportPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="consent" element={<ConsentPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
