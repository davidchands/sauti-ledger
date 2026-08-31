import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { MiamalaPage } from '@/pages/MiamalaPage'
import { RipotiPage } from '@/pages/RipotiPage'
import { DesignSystemPage } from '@/pages/DesignSystemPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="miamala" element={<MiamalaPage />} />
        <Route path="ripoti" element={<RipotiPage />} />
        <Route path="*" element={<Navigate to="/miamala" replace />} />
      </Route>
      {/* Internal QA only — not part of the merchant-facing product, not in nav. */}
      <Route path="design-system" element={<DesignSystemPage />} />
    </Routes>
  )
}
