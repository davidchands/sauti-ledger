import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'

// Route-level code splitting: the landing page pulls in `motion` for its
// phone animations, which the installed app (start_url is /miamala, per
// vite.config.ts) never needs to download.
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const MiamalaPage = lazy(() =>
  import('@/pages/MiamalaPage').then((m) => ({ default: m.MiamalaPage })),
)
const RipotiPage = lazy(() =>
  import('@/pages/RipotiPage').then((m) => ({ default: m.RipotiPage })),
)
const DesignSystemPage = lazy(() =>
  import('@/pages/DesignSystemPage').then((m) => ({ default: m.DesignSystemPage })),
)

export default function App() {
  return (
    <Suspense fallback={null}>
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
    </Suspense>
  )
}
